import { Router } from 'express'
import {
    createOrder,
    deleteOrder,
    getOrderByNumber,
    getOrderCurrentUserByNumber,
    getOrders,
    getOrdersCurrentUser,
    updateOrder,
} from '../controllers/order'
import auth from '../middlewares/auth'
import { validateOrderBody } from '../middlewares/validations'

// Убираем Role, так как он не используется
// import { Role } from '../models/user'

const orderRouter = Router()

orderRouter.post('/', auth, validateOrderBody, createOrder)
orderRouter.get('/all', auth, getOrders)
orderRouter.get('/all/me', auth, getOrdersCurrentUser)
orderRouter.get(
    '/:orderNumber',
    auth,
    // roleGuardMiddleware(Role.Admin), // Временно отключено
    getOrderByNumber
)
orderRouter.get('/me/:orderNumber', auth, getOrderCurrentUserByNumber)
orderRouter.patch(
    '/:orderNumber',
    auth,
    // roleGuardMiddleware(Role.Admin), // Временно отключено
    updateOrder
)

orderRouter.delete(
    '/:id',
    auth,
    // roleGuardMiddleware(Role.Admin), // Временно отключено
    deleteOrder
)

export default orderRouter
