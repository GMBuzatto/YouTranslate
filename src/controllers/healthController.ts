import { Request, Response } from 'express';
import { HealthResponse, ApiStatusResponse } from '@/types';
import { getConfig } from '@/utils/config';

export const getHealth = (req: Request, res: Response<HealthResponse>): void => {
    const config = getConfig();
    
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.nodeEnv,
        version: '1.0.0'
    });
};

export const getApiStatus = (req: Request, res: Response<ApiStatusResponse>): void => {
    const config = getConfig();
    
    res.json({
        service: 'YouTranslate API',
        status: 'running',
        version: config.apiVersion,
        timestamp: new Date().toISOString()
    });
}; 