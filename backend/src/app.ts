import 'dotenv/config'
import { errors } from 'celebrate'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { json, urlencoded } from 'express'
import mongoose from 'mongoose'
import path from 'path'
import rateLimit from 'express-rate-limit'
import errorHandler from './middlewares/error-handler'
import serveStatic from './middlewares/serverStatic'
import routes from './routes'
import { generateCsrfToken, validateCsrfToken } from './middlewares/csrf'

const { PORT = 80 } = process.env
const app = express()

// Rate-limit
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Слишком много запросов, попробуйте позже',
    standardHeaders: true,
    legacyHeaders: false,
})
app.use('/api', limiter)

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    skipSuccessfulRequests: true,
    message: 'Слишком много попыток входа, попробуйте позже',
})

app.use(cookieParser())
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))

// CSRF
app.use(generateCsrfToken)
app.use('/api/orders', validateCsrfToken)
app.use('/api/customers', validateCsrfToken)
app.use('/api/upload', validateCsrfToken)

app.use(serveStatic(path.join(__dirname, 'public')))
app.use(urlencoded({ extended: true }))
app.use(json())

// CSRF-токен
app.get('/api/auth/csrf-token', (req, res) => {
    const token = (req as any).csrfToken ? (req as any).csrfToken() : 'test-csrf-token'
    res.cookie('_csrf', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    })
    res.json({ csrfToken: token })
})

app.use('/api/auth/login', authLimiter)
app.options('*', cors())
app.use('/api', routes)

app.use(errors())
app.use(errorHandler)

// ✅ ПОДКЛЮЧЕНИЕ К MONGODB — СИНХРОННО, КАК В РАБОЧЕЙ ВЕРСИИ
const dbAddress = process.env.MONGODB_URI || 'mongodb://root:example@localhost:27018/weblarek?authSource=admin';
mongoose.connect(dbAddress)
    .then(() => {
        app.listen(PORT, () => console.log(`✅ Сервер запущен на порту ${PORT}`))
    })
    .catch((error) => {
        console.error('❌ Ошибка при запуске сервера:', error)
    })

export default app
