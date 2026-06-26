import { RequestHandler } from 'express'
import csrf from 'csrf'

const csrfProtection = new csrf()

export const generateCsrfToken: RequestHandler = (req: any, res, next) => {
    if (process.env.NODE_ENV === 'test') {
        return next()
    }

    const secret = csrfProtection.secretSync()
    const token = csrfProtection.create(secret)

    res.cookie('csrfSecret', secret, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    })

    req.csrfToken = () => token
    next()
}

export const validateCsrfToken: RequestHandler = (req: any, res, next) => {
    if (req.method === 'GET' || process.env.NODE_ENV === 'test') {
        return next()
    }

    const token = req.headers['x-csrf-token'] || req.body._csrf
    const secret = req.cookies.csrfSecret

    if (!token || !secret) {
        return next(new Error('CSRF-токен отсутствует'))
    }

    if (!csrfProtection.verify(secret, token)) {
        return next(new Error('Неверный CSRF-токен'))
    }

    next()
}
