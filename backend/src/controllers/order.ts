import { NextFunction, Request, Response } from 'express'
import { FilterQuery, Error as MongooseError, Types } from 'mongoose'
import BadRequestError from '../errors/bad-request-error'
import NotFoundError from '../errors/not-found-error'
import Order, { IOrder } from '../models/order'
import Product, { IProduct } from '../models/product'
import User from '../models/user'

// GET /orders - публичный
export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page = 1, sortField = 'createdAt', sortOrder = 'desc', status, totalAmountFrom, totalAmountTo, orderDateFrom, orderDateTo, search } = req.query

        let limit = Number(req.query.limit) || 10
        if (limit > 10) limit = 10
        if (limit < 1) limit = 10

        const filters: FilterQuery<Partial<IOrder>> = {}

        if (status) {
            if (typeof status === 'string') {
                filters.status = status
            } else if (typeof status === 'object') {
                const safeStatus: any = {}
                for (const [key, value] of Object.entries(status)) {
                    if (typeof value === 'string') {
                        safeStatus[key] = value
                    }
                }
                Object.assign(filters, safeStatus)
            }
        }

        if (totalAmountFrom) filters.totalAmount = { ...filters.totalAmount, $gte: Number(totalAmountFrom) }
        if (totalAmountTo) filters.totalAmount = { ...filters.totalAmount, $lte: Number(totalAmountTo) }
        if (orderDateFrom) filters.createdAt = { ...filters.createdAt, $gte: new Date(orderDateFrom as string) }
        if (orderDateTo) filters.createdAt = { ...filters.createdAt, $lte: new Date(orderDateTo as string) }

        if (search) {
            const searchStr = String(search).slice(0, 100)
            const escaped = searchStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            filters.$or = [
                { 'delivery.address': { $regex: escaped, $options: 'i' } },
                { payment: { $regex: escaped, $options: 'i' } }
            ]
        }

        const sort: { [key: string]: any } = {}
        if (sortField && sortOrder) {
            const safeFields = ['createdAt', 'totalAmount', 'status']
            if (safeFields.includes(sortField as string)) {
                sort[sortField as string] = sortOrder === 'desc' ? -1 : 1
            }
        }

        const options = { sort, skip: (Number(page) - 1) * limit, limit }
        const orders = await Order.find(filters, null, options).populate('products').populate('customer')
        const totalOrders = await Order.countDocuments(filters)
        const totalPages = Math.ceil(totalOrders / limit)

        return res.status(200).json({ orders, pagination: { totalOrders, totalPages, currentPage: Number(page), pageSize: limit } })
    } catch (error) {
        return next(error)
    }
}

// GET /orders/admin - админ
export const getOrdersAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page = 1, sortField = 'createdAt', sortOrder = 'desc', status, totalAmountFrom, totalAmountTo, orderDateFrom, orderDateTo, search } = req.query

        let limit = Number(req.query.limit) || 10
        if (limit > 10) limit = 10
        if (limit < 1) limit = 10

        const filters: FilterQuery<Partial<IOrder>> = {}

        if (status && typeof status === 'string') filters.status = status
        if (totalAmountFrom) filters.totalAmount = { ...filters.totalAmount, $gte: Number(totalAmountFrom) }
        if (totalAmountTo) filters.totalAmount = { ...filters.totalAmount, $lte: Number(totalAmountTo) }
        if (orderDateFrom) filters.createdAt = { ...filters.createdAt, $gte: new Date(orderDateFrom as string) }
        if (orderDateTo) filters.createdAt = { ...filters.createdAt, $lte: new Date(orderDateTo as string) }

        if (search) {
            const searchStr = String(search).slice(0, 100)
            const escaped = searchStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            filters.$or = [
                { 'delivery.address': { $regex: escaped, $options: 'i' } },
                { payment: { $regex: escaped, $options: 'i' } }
            ]
        }

        const sort: { [key: string]: any } = {}
        if (sortField && sortOrder) {
            const safeFields = ['createdAt', 'totalAmount', 'status']
            if (safeFields.includes(sortField as string)) {
                sort[sortField as string] = sortOrder === 'desc' ? -1 : 1
            }
        }

        const options = { sort, skip: (Number(page) - 1) * limit, limit }
        const orders = await Order.find(filters, null, options).populate('products').populate('customer')
        const totalOrders = await Order.countDocuments(filters)
        const totalPages = Math.ceil(totalOrders / limit)

        return res.status(200).json({ orders, pagination: { totalOrders, totalPages, currentPage: Number(page), pageSize: limit } })
    } catch (error) {
        return next(error)
    }
}

// POST /orders
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { items, payment, email, phone, address, total, comment } = req.body

        const order = await Order.create({
            products: items,
            payment,
            email: String(email),
            phone: String(phone),
            delivery: { address: String(address) },
            totalAmount: Number(total),
            comment: comment ? String(comment) : '',
            customer: res.locals.user._id,
        })

        await User.findByIdAndUpdate(res.locals.user._id, { $push: { orders: order._id } })
        return res.status(201).json(order)
    } catch (error) {
        if (error instanceof MongooseError.ValidationError) return next(new BadRequestError(error.message))
        return next(error)
    }
}

// GET /orders/all
export const getOrdersCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = res.locals.user
        const filter = user.roles.includes('admin') ? {} : { customer: user._id }
        const orders = await Order.find(filter).populate('products')
        return res.status(200).json({ orders, pagination: { pageSize: orders.length } })
    } catch (error) {
        return next(error)
    }
}

// GET /orders/:orderNumber
export const getOrderByNumber = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const order = await Order.findById(req.params.orderNumber).populate('products').populate('customer').orFail(() => new NotFoundError('Заказ не найден'))
        return res.status(200).json(order)
    } catch (error) {
        if (error instanceof MongooseError.CastError) return next(new BadRequestError('Передан не валидный ID заказа'))
        return next(error)
    }
}

// GET /orders/me/:orderNumber
export const getOrderCurrentUserByNumber = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const order = await Order.findOne({ _id: req.params.orderNumber, customer: res.locals.user._id }).populate('products').orFail(() => new NotFoundError('Заказ не найден'))
        return res.status(200).json(order)
    } catch (error) {
        if (error instanceof MongooseError.CastError) return next(new BadRequestError('Передан не валидный ID заказа'))
        return next(error)
    }
}

// PATCH /orders/:orderNumber
export const updateOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(req.params.orderNumber, req.body, { new: true, runValidators: true }).orFail(() => new NotFoundError('Заказ не найден')).populate('products').populate('customer')
        return res.status(200).json(updatedOrder)
    } catch (error) {
        if (error instanceof MongooseError.CastError) return next(new BadRequestError('Передан не валидный ID заказа'))
        return next(error)
    }
}

// DELETE /orders/:id
export const deleteOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const deletedOrder = await Order.findByIdAndDelete(req.params.id).orFail(() => new NotFoundError('Заказ по заданному id отсутствует в базе')).populate(['customer', 'products'])
        return res.status(200).json(deletedOrder)
    } catch (error) {
        if (error instanceof MongooseError.CastError) return next(new BadRequestError('Передан не валидный ID заказа'))
        return next(error)
    }
}
