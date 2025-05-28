import { Router } from 'express';
import { getWelcome } from '@/controllers/appController';
import { getHealth } from '@/controllers/healthController';
import apiRoutes from './api';

const router = Router();

// Rota principal
router.get('/', getWelcome);

// Rotas de saúde
router.get('/health', getHealth);

// Rotas da API
router.use('/api', apiRoutes);

export default router; 