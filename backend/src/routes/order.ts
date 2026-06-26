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

// ✅ С АВТОРИЗАЦИЕЙ (тест 9) - ИСПОЛЬЗУЕМ getOrdersAdmin
orderRouter.get('/admin', auth, getOrdersAdmin)

// ✅ POST /orders (тест 8)
orderRouter.post('/', auth, validateOrderBody, createOrder)

// ✅ POST /order (для единообразия)
orderRouter.post('/order', auth, validateOrderBody, createOrder)

orderRouter.get('/all', auth, getOrdersCurrentUser)
orderRouter.get('/all/me', auth, getOrdersCurrentUser)
orderRouter.get('/:orderNumber', auth, getOrderByNumber)
orderRouter.get('/me/:orderNumber', auth, getOrderCurrentUserByNumber)
orderRouter.patch('/:orderNumber', auth, updateOrder)
orderRouter.delete('/:id', auth, deleteOrder)

export default orderRouter
