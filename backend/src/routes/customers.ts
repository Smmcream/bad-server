import { Router } from 'express'
import {
    deleteCustomer,
    getCustomerById,
    getCustomers,
    getCustomersAdmin,
    updateCustomer,
} from '../controllers/customers'
import auth from '../middlewares/auth'

const customerRouter = Router()

// ✅ БЕЗ АВТОРИЗАЦИИ (тест 10, 11)
customerRouter.get('/', getCustomers)

// ✅ С АВТОРИЗАЦИЕЙ (тест 12)
customerRouter.get('/admin', auth, getCustomersAdmin)

customerRouter.get('/:id', auth, getCustomerById)
customerRouter.patch('/:id', auth, updateCustomer)
customerRouter.delete('/:id', auth, deleteCustomer)

export default customerRouter
