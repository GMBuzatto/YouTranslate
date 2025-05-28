import { Router } from 'express';
import {
    translate,
    createSubtitles,
    enhanceTranslation,
    getSupportedLanguages,
    getAvailableModels
} from '@/controllers/translationController';

const router = Router();

/**
 * @route POST /api/v1/translate
 * @description Traduzir texto usando Groq
 * @body {text: string, sourceLanguage?: string, targetLanguage?: string, context?: string}
 */
router.post('/translate', translate);

/**
 * @route POST /api/v1/subtitles
 * @description Gerar legendas com tradução a partir de transcrição
 * @body {transcription: string, videoDuration: number, maxCharsPerLine?: number, maxLinesPerSubtitle?: number}
 */
router.post('/subtitles', createSubtitles);

/**
 * @route POST /api/v1/improve
 * @description Melhorar tradução existente
 * @body {originalText: string, currentTranslation: string, context?: string}
 */
router.post('/improve', enhanceTranslation);

/**
 * @route GET /api/v1/languages
 * @description Obter lista de idiomas suportados
 */
router.get('/languages', getSupportedLanguages);

/**
 * @route GET /api/v1/models
 * @description Obter lista de modelos Groq disponíveis
 */
router.get('/models', getAvailableModels);

export default router; 