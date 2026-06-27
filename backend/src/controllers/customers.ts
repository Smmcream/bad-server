import { NextFunction, Request, Response } from 'express'
import { FilterQuery } from 'mongoose'
import NotFoundError from '../errors/not-found-error'
import Order from '../models/order'
import User, { IUser } from '../models/user'

const normalizeLimit = (limit: any, defaultLimit: number = 10, maxLimit: number = 10): number => {
    const parsedLimit = Number(limit)
    if (isNaN(parsedLimit) || parsedLimit < 1) return defaultLimit
    return Math.min(parsedLimit, maxLimit)
}

const safeRegexSearch = (search: string) => {
    const searchString = String(search).slice(0, 100)
    const escapedSearch = searchString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(escapedSearch, 'i')
}

// GET /customers
export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Проверка роли: только админы могут видеть всех пользователей
        if (res.locals.user && !res.locals.user.roles.includes('admin')) {
            return res.status(403).json({ message: 'Доступ запрещён' })
        }
        
        const { page = 1, sortField = 'createdAt', sortOrder = 'desc', registrationDateFrom, registrationDateTo, lastOrderDateFrom, lastOrderDateTo, totalAmountFrom, totalAmountTo, orderCountFrom, orderCountTo, search } = req.query
        const limit = normalizeLimit(req.query.limit, 10, 10)
        const filters: FilterQuery<Partial<IUser>> = {}

        if (registrationDateFrom) filters.createdAt = { ...filters.createdAt, $gte: new Date(registrationDateFrom as string) }
        if (registrationDateTo) {
            const endOfDay = new Date(registrationDateTo as string)
            endOfDay.setHours(23, 59, 59, 999)
            filters.createdAt = { ...filters.createdAt, $lte: endOfDay }
        }
        if (lastOrderDateFrom) filters.lastOrderDate = { ...filters.lastOrderDate, $gte: new Date(lastOrderDateFrom as string) }
        if (lastOrderDateTo) {
            const endOfDay = new Date(lastOrderDateTo as string)
            endOfDay.setHours(23, 59, 59, 999)
            filters.lastOrderDate = { ...filters.lastOrderDate, $lte: endOfDay }
        }
        if (totalAmountFrom) filters.totalAmount = { ...filters.totalAmount, $gte: Number(totalAmountFrom) }
        if (totalAmountTo) filters.totalAmount = { ...filters.totalAmount, $lte: Number(totalAmountTo) }
        if (orderCountFrom) filters.orderCount = { ...filters.orderCount, $gte: Number(orderCountFrom) }
        if (orderCountTo) filters.orderCount = { ...filters.orderCount, $lte: Number(orderCountTo) }

        if (search) {
            const searchRegex = safeRegexSearch(search as string)
            const orders = await Order.find({ $or: [{ 'delivery.address': searchRegex }] }, '_id')
            const orderIds = orders.map((order) => order._id)
            filters.$or = [{ name: searchRegex }, { lastOrder: { $in: orderIds } }]
        }

        const sort: { [key: string]: any } = {}
        if (sortField && sortOrder) sort[sortField as string] = sortOrder === 'desc' ? -1 : 1

        const options = { sort, skip: (Number(page) - 1) * limit, limit }
        const users = await User.find(filters, null, options).populate([
            'orders',
            { path: 'lastOrder', populate: { path: 'products' } },
            { path: 'lastOrder', populate: { path: 'customer' } }
        ])
        const totalUsers = await User.countDocuments(filters)
        const totalPages = Math.ceil(totalUsers / limit)

        res.status(200).json({ customers: users, pagination: { totalUsers, totalPages, currentPage: Number(page), pageSize: limit } })
    } catch (error) { next(error) }
}

// GET /customers/admin
export const getCustomersAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page = 1, sortField = 'createdAt', sortOrder = 'desc', registrationDateFrom, registrationDateTo, lastOrderDateFrom, lastOrderDateTo, totalAmountFrom, totalAmountTo, orderCountFrom, orderCountTo, search } = req.query
        const limit = normalizeLimit(req.query.limit, 10, 10)
        const filters: FilterQuery<Partial<IUser>> = {}

        if (registrationDateFrom) filters.createdAt = { ...filters.createdAt, $gte: new Date(registrationDateFrom as string) }
        if (registrationDateTo) {
            const endOfDay = new Date(registrationDateTo as string)
            endOfDay.setHours(23, 59, 59, 999)
            filters.createdAt = { ...filters.createdAt, $lte: endOfDay }
        }
        if (lastOrderDateFrom) filters.lastOrderDate = { ...filters.lastOrderDate, $gte: new Date(lastOrderDateFrom as string) }
        if (lastOrderDateTo) {
            const endOfDay = new Date(lastOrderDateTo as string)
            endOfDay.setHours(23, 59, 59, 999)
            filters.lastOrderDate = { ...filters.lastOrderDate, $lte: endOfDay }
        }
        if (totalAmountFrom) filters.totalAmount = { ...filters.totalAmount, $gte: Number(totalAmountFrom) }
        if (totalAmountTo) filters.totalAmount = { ...filters.totalAmount, $lte: Number(totalAmountTo) }
        if (orderCountFrom) filters.orderCount = { ...filters.orderCount, $gte: Number(orderCountFrom) }
        if (orderCountTo) filters.orderCount = { ...filters.orderCount, $lte: Number(orderCountTo) }

        if (search) {
            const searchRegex = safeRegexSearch(search as string)
            const orders = await Order.find({ $or: [{ 'delivery.address': searchRegex }] }, '_id')
            const orderIds = orders.map((order) => order._id)
            filters.$or = [{ name: searchRegex }, { lastOrder: { $in: orderIds } }]
        }

        const sort: { [key: string]: any } = {}
        if (sortField && sortOrder) sort[sortField as string] = sortOrder === 'desc' ? -1 : 1

        const options = { sort, skip: (Number(page) - 1) * limit, limit }
        const users = await User.find(filters, null, options).populate([
            'orders',
            { path: 'lastOrder', populate: { path: 'products' } },
            { path: 'lastOrder', populate: { path: 'customer' } }
        ])
        const totalUsers = await User.countDocuments(filters)
        const totalPages = Math.ceil(totalUsers / limit)

        res.status(200).json({ customers: users, pagination: { totalUsers, totalPages, currentPage: Number(page), pageSize: limit } })
    } catch (error) { next(error) }
}

// GET /customers/:id
export const getCustomerById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        if (!id) return next(new NotFoundError('ID пользователя не указан'))
        const user = await User.findById(id).populate(['orders', 'lastOrder'])
        if (!user) return next(new NotFoundError('Пользователь не найден'))
        res.status(200).json(user)
    } catch (error) { next(error) }
}

// PATCH /customers/:id
export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        if (!id) return next(new NotFoundError('ID пользователя не указан'))

        const allowedUpdates = ['name', 'email', 'phone']
        const updates: any = {}
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) updates[field] = req.body[field]
        })

        const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
            .orFail(() => new NotFoundError('Пользователь по заданному id отсутствует в базе'))
            .populate(['orders', 'lastOrder'])
        res.status(200).json(updatedUser)
    } catch (error) { next(error) }
}

// DELETE /customers/:id
export const deleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        if (!id) return next(new NotFoundError('ID пользователя не указан'))
        const deletedUser = await User.findByIdAndDelete(id).orFail(() => new NotFoundError('Пользователь по заданному id отсутствует в базе'))
        res.status(200).json(deletedUser)
    } catch (error) { next(error) }
}
