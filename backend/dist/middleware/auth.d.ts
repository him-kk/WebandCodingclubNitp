import { Request, Response, NextFunction } from 'express';
export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        email: string;
        role: string;
    };
}
export declare const protect: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const restrictTo: (...roles: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const optionalAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map