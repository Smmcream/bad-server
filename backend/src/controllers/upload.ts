import { NextFunction, Request, Response } from 'express'
import { constants } from 'http2'
import BadRequestError from '../errors/bad-request-error'
import path from 'path'
import fs, { mkdirSync } from 'fs'
import crypto from 'crypto'

export const uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.file) {
        return next(new BadRequestError('Файл не загружен'))
    }

    try {
        // ✅ БЕЗОПАСНОЕ ИМЯ ФАЙЛА (тест 13)
        const ext = path.extname(req.file.originalname);
        const randomName = crypto.randomBytes(16).toString('hex') + ext;
        const newPath = path.join(__dirname, '../public/uploads', randomName);

        // ✅ СОЗДАЁМ ПАПКУ, ЕСЛИ ЕЁ НЕТ
        const dir = path.dirname(newPath);
        if (!fs.existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }

        // ✅ ПРОВЕРКА РАЗМЕРА (тесты 14, 15)
        if (req.file.size < 2 * 1024) {
            return next(new BadRequestError('Файл слишком маленький (минимум 2kb)'));
        }
        if (req.file.size > 10 * 1024 * 1024) {
            return next(new BadRequestError('Файл слишком большой (максимум 10mb)'));
        }

        // ✅ ПРОВЕРКА МЕТАДАННЫХ (тест 16)
        const allowedMimeTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp'];
        if (!allowedMimeTypes.includes(req.file.mimetype)) {
            return next(new BadRequestError('Недопустимый тип файла. Только изображения'));
        }

        // Перемещаем файл
        fs.renameSync(req.file.path, newPath);

        const fileName = process.env.UPLOAD_PATH
            ? `/${process.env.UPLOAD_PATH}/${randomName}`
            : `/${randomName}`

        return res.status(constants.HTTP_STATUS_CREATED).send({
            fileName,
            originalName: req.file?.originalname,
        })
    } catch (error) {
        return next(error)
    }
}

export default {}
