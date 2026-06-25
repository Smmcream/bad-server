import { Router } from 'express'
import auth from '../middlewares/auth'
import { getCustomers, getCustomersAdmin } from '../controllers/customers'

const userRouter = Router()

// ✅ GET /users - для обычных пользователей (тест 12)
userRouter.get('/', auth, getCustomers)

// ✅ GET /users/admin - для админов (тест 12)
userRouter.get('/admin', auth, getCustomersAdmin)

export default userRouter
