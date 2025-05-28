import { Request, Response } from 'express';
import { 
    translateText, 
    generateSubtitles, 
    improveTranslation 
} from '@/utils/groq';
import { 
    TranslateRequest, 
    TranslateResponse,
    GenerateSubtitlesRequest,
    GenerateSubtitlesResponse,
    ImproveTranslationRequest,
    ImproveTranslationResponse
} from '@/types';

// Traduzir texto
export const translate = async (req: Request, res: Response): Promise<void> => {
    try {
        const startTime = Date.now();
        const { text, sourceLanguage = 'en', targetLanguage = 'pt', context }: TranslateRequest = req.body;

        if (!text || text.trim().length === 0) {
            res.status(400).json({
                error: 'Texto é obrigatório',
                message: 'O campo "text" não pode estar vazio'
            });
            return;
        }

        if (text.length > 5000) {
            res.status(400).json({
                error: 'Texto muito longo',
                message: 'O texto deve ter no máximo 5000 caracteres'
            });
            return;
        }

        const translatedText = await translateText(text, sourceLanguage, targetLanguage);
        const processingTime = Date.now() - startTime;

        const response: TranslateResponse = {
            originalText: text,
            translatedText,
            sourceLanguage,
            targetLanguage,
            model: 'llama3-8b-8192',
            tokensUsed: Math.ceil((text.length + translatedText.length) / 4), // Estimativa
            processingTime
        };

        res.json(response);
    } catch (error) {
        console.error('Erro na tradução:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: error instanceof Error ? error.message : 'Erro desconhecido na tradução'
        });
    }
};

// Gerar legendas com tradução
export const createSubtitles = async (req: Request, res: Response): Promise<void> => {
    try {
        const startTime = Date.now();
        const { 
            transcription, 
            videoDuration, 
            maxCharsPerLine = 42, 
            maxLinesPerSubtitle = 2 
        }: GenerateSubtitlesRequest = req.body;

        if (!transcription || transcription.trim().length === 0) {
            res.status(400).json({
                error: 'Transcrição é obrigatória',
                message: 'O campo "transcription" não pode estar vazio'
            });
            return;
        }

        if (!videoDuration || videoDuration <= 0) {
            res.status(400).json({
                error: 'Duração do vídeo inválida',
                message: 'A duração do vídeo deve ser maior que 0'
            });
            return;
        }

        const subtitles = await generateSubtitles(transcription, videoDuration);
        const processingTime = Date.now() - startTime;

        const response: GenerateSubtitlesResponse = {
            subtitles,
            totalSegments: subtitles.length,
            processingTime,
            model: 'llama3-8b-8192'
        };

        res.json(response);
    } catch (error) {
        console.error('Erro na geração de legendas:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: error instanceof Error ? error.message : 'Erro desconhecido na geração de legendas'
        });
    }
};

// Melhorar tradução existente
export const enhanceTranslation = async (req: Request, res: Response): Promise<void> => {
    try {
        const startTime = Date.now();
        const { 
            originalText, 
            currentTranslation, 
            context 
        }: ImproveTranslationRequest = req.body;

        if (!originalText || originalText.trim().length === 0) {
            res.status(400).json({
                error: 'Texto original é obrigatório',
                message: 'O campo "originalText" não pode estar vazio'
            });
            return;
        }

        if (!currentTranslation || currentTranslation.trim().length === 0) {
            res.status(400).json({
                error: 'Tradução atual é obrigatória',
                message: 'O campo "currentTranslation" não pode estar vazio'
            });
            return;
        }

        const improvedTranslation = await improveTranslation(originalText, currentTranslation, context);
        const processingTime = Date.now() - startTime;

        // Simular identificação de melhorias (em um caso real, isso seria mais sofisticado)
        const improvements = [];
        if (improvedTranslation !== currentTranslation) {
            improvements.push('Fluidez melhorada');
            improvements.push('Naturalidade aprimorada');
            if (context) {
                improvements.push('Contexto considerado');
            }
        }

        const response: ImproveTranslationResponse = {
            originalText,
            improvedTranslation,
            previousTranslation: currentTranslation,
            improvements,
            model: 'llama3-70b-8192',
            tokensUsed: Math.ceil((originalText.length + currentTranslation.length + improvedTranslation.length) / 4),
            processingTime
        };

        res.json(response);
    } catch (error) {
        console.error('Erro na melhoria da tradução:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: error instanceof Error ? error.message : 'Erro desconhecido na melhoria da tradução'
        });
    }
};

// Obter idiomas suportados
export const getSupportedLanguages = async (req: Request, res: Response): Promise<void> => {
    try {
        const languages = {
            'en': 'Inglês',
            'pt': 'Português',
            'es': 'Espanhol',
            'fr': 'Francês',
            'de': 'Alemão',
            'it': 'Italiano',
            'ja': 'Japonês',
            'ko': 'Coreano',
            'zh': 'Chinês'
        };

        res.json({
            languages,
            total: Object.keys(languages).length,
            defaultSource: 'en',
            defaultTarget: 'pt'
        });
    } catch (error) {
        console.error('Erro ao obter idiomas:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Erro ao obter lista de idiomas suportados'
        });
    }
};

// Obter modelos disponíveis
export const getAvailableModels = async (req: Request, res: Response): Promise<void> => {
    try {
        const models = {
            'llama3-8b-8192': {
                name: 'Llama 3 8B',
                description: 'Modelo rápido para tradução geral',
                maxTokens: 8192,
                recommended: 'translation'
            },
            'llama3-70b-8192': {
                name: 'Llama 3 70B',
                description: 'Modelo avançado para alta qualidade',
                maxTokens: 8192,
                recommended: 'improvement'
            },
            'mixtral-8x7b-32768': {
                name: 'Mixtral 8x7B',
                description: 'Modelo versátil com contexto longo',
                maxTokens: 32768,
                recommended: 'subtitles'
            },
            'gemma-7b-it': {
                name: 'Gemma 7B IT',
                description: 'Modelo otimizado para instruções',
                maxTokens: 8192,
                recommended: 'general'
            }
        };

        res.json({
            models,
            total: Object.keys(models).length,
            default: 'llama3-8b-8192'
        });
    } catch (error) {
        console.error('Erro ao obter modelos:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Erro ao obter lista de modelos disponíveis'
        });
    }
}; 