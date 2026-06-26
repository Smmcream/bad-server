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
import requireAdmin from '../middlewares/requireAdmin'
import { validateOrderBody } from '../middlewares/validations'

const orderRouter = Router()

// Публичные маршруты
orderRouter.get('/', getOrders)

// ⚠️ ВАЖНО: конкретные маршруты ДО параметризованных!
orderRouter.get('/admin', auth, requireAdmin, getOrdersAdmin)
orderRouter.get('/all', auth, getOrdersCurrentUser)
orderRouter.get('/all/me', auth, getOrdersCurrentUser)
orderRouter.get('/me/:orderNumber', auth, getOrderCurrentUserByNumber)

// Параметризованные маршруты — ПОСЛЕ конкретных
orderRouter.get('/:orderNumber', auth, getOrderByNumber)

// POST, PATCH, DELETE
orderRouter.post('/', validateOrderBody, auth, createOrder)
orderRouter.patch('/:orderNumber', auth, updateOrder)
orderRouter.delete('/:id', auth, requireAdmin, deleteOrder)

export default orderRouter
