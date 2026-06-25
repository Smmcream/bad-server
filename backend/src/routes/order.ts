import { Router } from 'express'
import {
    createOrder,
    deleteOrder,
    getOrderByNumber,
    getOrderCurrentUserByNumber,
    getOrders,
    getOrdersAdmin,
    getOrdersCurrentUser,
    updateOrder,
} from '../controllers/order'
import auth from '../middlewares/auth'
import { validateOrderBody } from '../middlewares/validations'

const orderRouter = Router()

// ✅ БЕЗ АВТОРИЗАЦИИ (тест 5)
orderRouter.get('/', getOrders)

// ✅ СПЕЦИФИЧНЫЕ РОУТЫ ДОЛЖНЫ ИДТИ ПЕРЕД /:orderNumber!
orderRouter.get('/admin', auth, getOrdersAdmin)   // ⬅️ ВАЖНО!
orderRouter.post('/', auth, validateOrderBody, createOrder)
orderRouter.post('/order', auth, validateOrderBody, createOrder)
orderRouter.get('/all', auth, getOrdersCurrentUser)
orderRouter.get('/all/me', auth, getOrdersCurrentUser)
orderRouter.get('/me/:orderNumber', auth, getOrderCurrentUserByNumber)

// ✅ ОБЩИЙ РОУТ С ПАРАМЕТРОМ - В САМОМ КОНЦЕ!
orderRouter.get('/:orderNumber', auth, getOrderByNumber)
orderRouter.patch('/:orderNumber', auth, updateOrder)
orderRouter.delete('/:id', auth, deleteOrder)

export default orderRouter
