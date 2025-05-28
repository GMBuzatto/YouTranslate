import { AppConfig, Environment, LogLevel } from '@/types';

export const getConfig = (): AppConfig => {
    return {
        port: parseInt(process.env.PORT || '3000', 10),
        nodeEnv: (process.env.NODE_ENV as Environment) || 'development',
        apiVersion: process.env.API_VERSION || 'v1',
        corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        logLevel: (process.env.LOG_LEVEL as LogLevel) || 'info'
    };
};

export const isDevelopment = (): boolean => {
    return getConfig().nodeEnv === 'development';
};

export const isProduction = (): boolean => {
    return getConfig().nodeEnv === 'production';
};

export const isTest = (): boolean => {
    return getConfig().nodeEnv === 'test';
}; 