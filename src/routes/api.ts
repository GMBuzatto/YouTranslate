import { Router } from 'express';
import { getApiStatus } from '@/controllers/healthController';
import { getConfig } from '@/utils/config';
import translationRoutes from './translation';
import videoRoutes from './video';

const router = Router();
const config = getConfig();

// Rotas da API v1
router.get(`/${config.apiVersion}/status`, getApiStatus);

// Rotas de tradução com versionamento
router.use(`/${config.apiVersion}`, translationRoutes);

// Rotas de vídeo com versionamento
router.use(`/${config.apiVersion}/video`, videoRoutes);

// Futuras rotas da API
// router.use('/v2', v2Routes);

export default router; 