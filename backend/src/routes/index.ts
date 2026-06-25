console.log('✅ 1. index.ts загружен!');

import { NextFunction, Request, Response, Router } from 'express'
import NotFoundError from '../errors/not-found-error'
import auth from '../middlewares/auth'
import authRouter from './auth'
import customerRouter from './customers'
import orderRouter from './order'
import productRouter from './product'
import uploadRouter from './upload'
import userRouter from './users'

const router = Router()
console.log('✅ 2. Router создан!');

router.use('/product', productRouter)
console.log('✅ 3. /product подключён!');

router.use('/auth', authRouter)
console.log('✅ 4. /auth подключён!');

router.use('/orders', orderRouter)
console.log('✅ 5. /orders подключён!');

router.use('/upload', auth, uploadRouter)
console.log('✅ 6. /upload подключён!');

router.use('/customers', customerRouter)
console.log('✅ 7. /customers подключён!');

router.use('/users', userRouter)
console.log('✅ 8. /users подключён!');

router.use((_req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError('Маршрут не найден'))
})

console.log('✅ 9. Все роуты загружены!');

export default router
