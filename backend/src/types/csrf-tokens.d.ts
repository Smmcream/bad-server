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

    namespace csrf {
        function tokenize(secret: string, salt: string): string;
        function verify(secret: string, token: string): boolean;
    }

    export = csrf;
}

// Расширяем интерфейс Request для поддержки csrfToken
declare global {
    namespace Express {
        interface Request {
            csrfToken(): string;
        }
    }
}
