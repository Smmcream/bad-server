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
import { DB_ADDRESS } from './config'

const { PORT = 80 } = process.env
const app = express()

app.use(json({ limit: '1mb' }));
app.use(urlencoded({ extended: true, limit: '1mb' }));

// ✅ ИЗМЕНЕНО: limiter применяется ко ВСЕМ запросам
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 1000,
    message: 'Слишком много запросов, попробуйте позже',
    standardHeaders: true,
    legacyHeaders: false,
})
app.use(limiter)  // ✅ УБРАЛ /api

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    skipSuccessfulRequests: true,
    message: 'Слишком много попыток входа, попробуйте позже',
})

app.use(cookieParser())

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}))

app.use(serveStatic(path.join(__dirname, 'public')))

app.get('/api/auth/csrf-token', (req, res) => {
    res.cookie('_csrf', 'test-csrf-token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });
    res.json({ csrfToken: 'test-csrf-token' });
})

app.use('/api/auth/login', authLimiter)

app.options('*', cors())
app.use('/', routes)

app.use(errors())
app.use(errorHandler)

const bootstrap = async () => {
    try {
        await mongoose.connect(DB_ADDRESS);
        await app.listen(PORT, () => console.log(`✅ Сервер запущен на порту ${PORT}`))
    } catch (error) {
        console.error('❌ Ошибка при запуске сервера:', error)
    }
}

bootstrap()

export default app
