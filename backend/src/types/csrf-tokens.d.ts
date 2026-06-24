declare module 'csrf-tokens' {
    import { Request, Response, NextFunction } from 'express';

    interface CsrfOptions {
        cookie?: {
            httpOnly?: boolean;
            secure?: boolean;
            sameSite?: 'lax' | 'strict' | 'none';
        };
    }

    function csrf(options?: CsrfOptions): (req: Request, res: Response, next: NextFunction) => void;

    export = csrf;
}

declare global {
    namespace Express {
        interface Request {
            csrfToken(): string;
        }
    }
}
