import { NextFunction, Request, Response } from 'express'
import ForbiddenError from '../errors/forbidden-error'
import { Role } from '../models/user'

const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user
    
    if (!user || !user.roles.includes(Role.Admin)) {
        return next(new ForbiddenError('Доступ запрещён. Требуются права администратора'))
    }
    
    next()
}

export default requireAdmin
