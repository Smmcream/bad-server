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

// Маршруты для админов
orderRouter.get('/admin', auth, requireAdmin, getOrdersAdmin)

// Маршруты для авторизованных пользователей
orderRouter.post('/', auth, validateOrderBody, createOrder)
orderRouter.get('/all', auth, getOrdersCurrentUser)
orderRouter.get('/all/me', auth, getOrdersCurrentUser)
orderRouter.get('/:orderNumber', auth, getOrderByNumber)
orderRouter.get('/me/:orderNumber', auth, getOrderCurrentUserByNumber)
orderRouter.patch('/:orderNumber', auth, updateOrder)
orderRouter.delete('/:id', auth, requireAdmin, deleteOrder)

export default orderRouter
