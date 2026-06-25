import { NextFunction, Request, Response, Router } from 'express'
import NotFoundError from '../errors/not-found-error'

import auth from '../middlewares/auth'
import authRouter from './auth'
import customerRouter from './customers'
import orderRouter from './order'
import uploadRouter from './upload'   // ✅ ИСПРАВЛЕНО!

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

// ✅ ДОБАВЛЯЕМ ОБА ВАРИАНТА: /order и /orders
router.use('/order', auth, orderRouter)
router.use('/orders', auth, orderRouter)
console.log('✅ 7. /order и /orders подключены!');

router.use('/upload', auth, uploadRouter)
console.log('✅ 8. /upload подключён!');

// ✅ ДОБАВЛЯЕМ ОБА ВАРИАНТА: /customers и /customer (если нужно)
router.use('/customers', auth, customerRouter)
console.log('✅ 9. /customers подключён!');

router.use((_req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError('Маршрут не найден'))
})

console.log('✅ 10. Все роуты загружены!');
export default router
