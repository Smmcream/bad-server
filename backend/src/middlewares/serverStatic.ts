import { RequestHandler } from 'express'
import fs from 'fs'
import path from 'path'

export default function serveStatic(baseDir: string): RequestHandler {
    return (req, res, next) => {
        const filePath = path.join(baseDir, req.path)

        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                return next()
            }
            return res.sendFile(filePath, (err) => {
                if (err) {
                    next(err)
                }
            })
        })
    }
}
