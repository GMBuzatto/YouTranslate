import { Router } from 'express';
import {
    processYouTubeVideo,
    getJobStatus,
    getVideoResult,
    streamVideo,
    listJobs,
    deleteJob,
    getJobStats,
    validateYouTubeUrl
} from '@/controllers/videoController';

const router = Router();

// Processar vídeo do YouTube
router.post('/process', processYouTubeVideo);

// Validar URL do YouTube
router.post('/validate', validateYouTubeUrl);

// Verificar status do job
router.get('/job/:jobId/status', getJobStatus);

// Obter resultado do processamento
router.get('/job/:jobId/result', getVideoResult);

// Stream do vídeo processado
router.get('/:jobId/stream', streamVideo);

// Listar jobs
router.get('/jobs', listJobs);

// Deletar job
router.delete('/job/:jobId', deleteJob);

// Estatísticas dos jobs
router.get('/stats', getJobStats);

export default router; 