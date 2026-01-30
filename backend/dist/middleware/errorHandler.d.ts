import { Request, Response, NextFunction } from 'express';
export interface CustomError extends Error {
    statusCode?: number;
    status?: string;
    isOperational?: boolean;
    code?: number;
    keyValue?: any;
}
export declare const errorHandler: (err: CustomError, req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=errorHandler.d.ts.map