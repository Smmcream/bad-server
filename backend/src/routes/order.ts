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

orderRouter.get('/admin', auth, getOrdersAdmin)
orderRouter.post('/', auth, validateOrderBody, createOrder)
orderRouter.post('/order', auth, validateOrderBody, createOrder)
orderRouter.get('/all', auth, getOrdersCurrentUser)        // ← ЭТО ДОЛЖНО БЫТЬ ЗДЕСЬ!
orderRouter.get('/all/me', auth, getOrdersCurrentUser)     // ← И ЭТО ЗДЕСЬ!
orderRouter.get('/me/:orderNumber', auth, getOrderCurrentUserByNumber)

// ✅ ОБЩИЙ РОУТ — В САМОМ КОНЦЕ!
orderRouter.get('/:orderNumber', auth, getOrderByNumber)   // ← ЭТО ПОСЛЕДНЕЕ!
orderRouter.patch('/:orderNumber', auth, updateOrder)
orderRouter.delete('/:id', auth, deleteOrder)

export default orderRouter
