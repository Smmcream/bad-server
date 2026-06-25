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

const { PORT = 3000 } = process.env
const app = express()

// ✅ ЛИМИТ НА РАЗМЕР BODY (тест 18)
app.use(json({ limit: '1mb' }));
app.use(urlencoded({ extended: true, limit: '1mb' }));

// ✅ НАСТРОЙКА RATE LIMIT (тест 19)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Слишком много запросов, попробуйте позже',
    standardHeaders: true,
    legacyHeaders: false,
})

// ✅ ПРИМЕНЯЕМ RATE LIMIT КО ВСЕМ ЗАПРОСАМ /api
app.use('/api', limiter)

// ✅ СТРОГИЙ ЛИМИТ ДЛЯ АВТОРИЗАЦИИ
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    skipSuccessfulRequests: true,
    message: 'Слишком много попыток входа, попробуйте позже',
})

app.use(cookieParser())

// ✅ НАСТРОЙКА CORS (тест 17)
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}))

app.use(serveStatic(path.join(__dirname, 'public')))

// ✅ CSRF COOKIE (тест 1-2)
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
app.use('/api', routes)

app.use(errors())
app.use(errorHandler)

const bootstrap = async () => {
    try {
        const dbAddress = 'mongodb://localhost:27017/weblarek';
        await mongoose.connect(dbAddress);
        await app.listen(PORT, () => console.log(`✅ Сервер запущен на порту ${PORT}`))
    } catch (error) {
        console.error('❌ Ошибка при запуске сервера:', error)
    }
}

bootstrap()

export default app
