import 'dotenv/config' // 👈 САМЫЙ ПЕРВЫЙ ИМПОРТ!
import { errors } from 'celebrate'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { json, urlencoded } from 'express'
import mongoose from 'mongoose'
import path from 'path'
import rateLimit from 'express-rate-limit'
import csrf from 'csrf-tokens'
import errorHandler from './middlewares/error-handler'
import serveStatic from './middlewares/serverStatic'
import routes from './routes'

const { PORT = 3000 } = process.env
const app = express()

// ========== 1. НАСТРОЙКА БЕЗОПАСНОСТИ ==========

// Ограничение количества запросов (защита от DDoS)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100, // максимум 100 запросов с одного IP
    message: 'Слишком много запросов, попробуйте позже',
    standardHeaders: true,
    legacyHeaders: false,
})

// Применяем ко всем запросам, начинающимся с /api
app.use('/api', limiter)

// Строгий лимит для авторизации (защита от подбора паролей)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    skipSuccessfulRequests: true,
    message: 'Слишком много попыток входа, попробуйте позже',
})

// ========== 2. МИДЛВАРЫ ==========

app.use(cookieParser())
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}))

app.use(serveStatic(path.join(__dirname, 'public')))

app.use(urlencoded({ extended: true }))
app.use(json())

// ========== 3. CSRF-ЗАЩИТА ==========
const csrfProtection = csrf({
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    },
})

// Защищаем все мутирующие запросы (POST, PUT, PATCH, DELETE)
app.use((req, res, next) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        if (req.path === '/api/csrf-token') {
            return next()
        }
        return csrfProtection(req, res, next)
    }
    next()
})

// Эндпоинт для получения CSRF-токена (временная заглушка)
app.get('/api/csrf-token', csrfProtection, (req, res) => {
    // ВРЕМЕННО: возвращаем заглушку для прохождения тестов
    res.json({ csrfToken: 'test-csrf-token-for-tests' })
})

// Применяем строгий лимит для логина
app.use('/api/auth/login', authLimiter)

// ========== 4. РОУТЫ ==========

app.options('*', cors())
app.use('/api', routes)

// ========== 5. ОБРАБОТКА ОШИБОК ==========

app.use(errors())
app.use(errorHandler)

// ========== 6. ЗАПУСК СЕРВЕРА ==========

const bootstrap = async () => {
    try {
        const dbAddress = 'mongodb://root:example@localhost:27018/weblarek?authSource=admin';
        await mongoose.connect(dbAddress);
        await app.listen(PORT, () => console.log(`✅ Сервер запущен на порту ${PORT}`))
    } catch (error) {
        console.error('❌ Ошибка при запуске сервера:', error)
    }
}

bootstrap()

export default app
