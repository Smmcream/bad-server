import { Router } from 'express'
import auth from '../middlewares/auth'
import { getCustomers, getCustomersAdmin } from '../controllers/customers'

console.log('✅ users.ts загружен!');

const userRouter = Router()

userRouter.get('/', auth, getCustomers)
userRouter.get('/admin', auth, getCustomersAdmin)

export default userRouter
