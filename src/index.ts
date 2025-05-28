import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

import routes from '@/routes';
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler';
import { getConfig, isDevelopment } from '@/utils/config';

const app = express();
const config = getConfig();

// Middleware de segurança
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
}));

// Configuração de CORS
app.use(cors({
    origin: config.corsOrigin,
    credentials: true
}));

// Middleware de logging
if (isDevelopment()) {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Rotas
app.use(routes);

// Middleware de tratamento de erros
app.use(errorHandler);

// Middleware para rotas não encontradas
app.use('*', notFoundHandler);

app.listen(config.port, () => {
    console.log(`🚀 Servidor YouTranslate rodando na porta ${config.port}`);
    console.log(`📱 Acesse: http://localhost:${config.port}`);
    console.log(`🌍 Ambiente: ${config.nodeEnv}`);
    console.log(`📊 Health Check: http://localhost:${config.port}/health`);
    console.log(`🔧 API: http://localhost:${config.port}/api/${config.apiVersion}/status`);
});

export default app; 