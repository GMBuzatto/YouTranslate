import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '@/types';
import { isDevelopment } from '@/utils/config';

export const errorHandler = (
    err: Error, 
    req: Request, 
    res: Response<ErrorResponse>, 
    next: NextFunction
): void => {
    console.error('Error:', err.stack);
    
    if (isDevelopment()) {
        res.status(500).json({
            error: 'Algo deu errado!',
            message: err.message,
            ...(err.stack && { stack: err.stack })
        });
    } else {
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
};

export const notFoundHandler = (req: Request, res: Response<ErrorResponse>): void => {
    res.status(404).json({
        error: 'Rota não encontrada',
        path: req.originalUrl,
        method: req.method
    });
}; 