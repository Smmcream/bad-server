console.log('✅ product.ts загружен!');
import { Router } from 'express'
import {
    createProduct,
    deleteProduct,
    getProducts,
    updateProduct,
} from '../controllers/products'
import auth from '../middlewares/auth'
import {
    validateObjId,
    validateProductBody,
    validateProductUpdateBody,
} from '../middlewares/validations'

const productRouter = Router()

productRouter.get('/', getProducts)
productRouter.post(
    '/',
    auth,
    validateProductBody,
    createProduct
)
productRouter.delete(
    '/:productId',
    auth,
    validateObjId,
    deleteProduct
)
productRouter.patch(
    '/:productId',
    auth,
    validateObjId,
    validateProductUpdateBody,
    updateProduct
)

export default productRouter
