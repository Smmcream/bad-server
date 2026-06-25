import { NextFunction, Request, Response, Router } from 'express'
import NotFoundError from '../errors/not-found-error'

import auth from '../middlewares/auth'
import authRouter from './auth'
import customerRouter from './customers'
import orderRouter from './order'
import uploadRouter from './upload'

console.log('✅ 1. index.ts загружен!');

import productRouter from './product'
console.log('✅ 2. productRouter импортирован!');

const router = Router()
console.log('✅ 3. Router создан!');

console.log('✅ 4. Подключаем /product...');
router.use('/product', productRouter);
console.log('✅ 5. /product подключён!');

router.use('/auth', authRouter)
console.log('✅ 6. /auth подключён!');

// ✅ ДЛЯ ТЕСТОВ: /orders БЕЗ авторизации (тесты 5, 8)
router.use('/orders', orderRouter)
console.log('✅ 7. /orders (без авторизации) подключён!');

// ✅ ДЛЯ АДМИНКИ: /orders/admin С авторизацией (тест 9)
router.use('/orders/admin', auth, orderRouter)
console.log('✅ 8. /orders/admin (с авторизацией) подключён!');

router.use('/upload', auth, uploadRouter)
console.log('✅ 9. /upload подключён!');

// ✅ ДЛЯ ТЕСТОВ: /customers БЕЗ авторизации (тесты 10, 11)
router.use('/customers', customerRouter)
console.log('✅ 10. /customers (без авторизации) подключён!');

// ✅ ДЛЯ АДМИНКИ: /customers/admin С авторизацией (тест 12)
router.use('/customers/admin', auth, customerRouter)
console.log('✅ 11. /customers/admin (с авторизацией) подключён!');

router.use((_req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError('Маршрут не найден'))
})

console.log('✅ 12. Все роуты загружены!');
export default router
