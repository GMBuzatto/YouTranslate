import { Request, Response } from 'express';
import { WelcomeResponse } from '@/types';
import { getConfig } from '@/utils/config';

export const getWelcome = (req: Request, res: Response<WelcomeResponse>): void => {
    const config = getConfig();
    
    res.json({
        message: 'Bem-vindo ao YouTranslate! 🎬',
        description: 'Tradutor automático de vídeos: adicione legendas em português ao áudio em inglês sem esforço',
        version: '1.0.0',
        environment: config.nodeEnv,
        endpoints: {
            health: '/health',
            api: `/api/${config.apiVersion}`
        }
    });
}; 