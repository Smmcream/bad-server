import { Router } from 'express'
import {
    deleteCustomer,
    getCustomerById,
    getCustomers,
    getCustomersAdmin,
    updateCustomer,
} from '../controllers/customers'
import auth from '../middlewares/auth'
import requireAdmin from '../middlewares/requireAdmin'

const customerRouter = Router()

// Публичные маршруты
customerRouter.get('/', getCustomers)

// Маршруты для админов
customerRouter.get('/admin', auth, requireAdmin, getCustomersAdmin)

// Маршруты для авторизованных пользователей
customerRouter.get('/:id', auth, getCustomerById)
customerRouter.patch('/:id', auth, updateCustomer)
customerRouter.delete('/:id', auth, requireAdmin, deleteCustomer)

export default customerRouter
