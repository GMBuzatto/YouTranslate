import { Request, Response } from 'express';
import { 
    YouTubeVideoRequest, 
    ProcessVideoResponse, 
    JobStatusResponse,
    VideoPlayerData 
} from '@/types';
import { YouTubeProcessor } from '@/utils/youtube';
import { JobManager } from '@/utils/jobManager';
import fs from 'fs-extra';
import path from 'path';

// Processar vídeo do YouTube
export const processYouTubeVideo = async (req: Request, res: Response): Promise<void> => {
    console.log('🚀 [BACKEND] Recebida requisição para processar vídeo');
    console.log('📋 [BACKEND] Dados da requisição:', req.body);
    
    try {
        const { url, language = 'en', targetLanguage = 'pt' }: YouTubeVideoRequest = req.body;

        console.log('🔍 [BACKEND] Validando parâmetros:', { url, language, targetLanguage });

        // Validar URL
        if (!url || !url.trim()) {
            console.error('❌ [BACKEND] URL vazia ou inválida');
            res.status(400).json({
                error: 'URL é obrigatória',
                message: 'O campo "url" não pode estar vazio'
            });
            return;
        }

        if (!YouTubeProcessor.validateYouTubeUrl(url)) {
            console.error('❌ [BACKEND] URL do YouTube inválida:', url);
            res.status(400).json({
                error: 'URL inválida',
                message: 'A URL fornecida não é uma URL válida do YouTube'
            });
            return;
        }

        console.log('📺 [BACKEND] Obtendo informações do vídeo...');
        // Obter informações básicas do vídeo
        const videoInfo = await YouTubeProcessor.getVideoInfo(url);
        console.log('📄 [BACKEND] Informações do vídeo obtidas:', videoInfo);

        // Verificar duração do vídeo (limite de 30 minutos para evitar processamento muito longo)
        if (videoInfo.duration > 1800) {
            console.error('❌ [BACKEND] Vídeo muito longo:', videoInfo.duration, 'segundos');
            res.status(400).json({
                error: 'Vídeo muito longo',
                message: 'O vídeo deve ter no máximo 30 minutos de duração'
            });
            return;
        }

        console.log('⚙️ [BACKEND] Iniciando processamento assíncrono...');
        // Criar job primeiro
        const job = JobManager.createJob(videoInfo);
        const jobId = job.id;
        console.log('✅ [BACKEND] Job criado com sucesso:', jobId);

        // Enviar resposta imediatamente
        const response: ProcessVideoResponse = {
            jobId,
            status: 'processing',
            message: 'Processamento iniciado com sucesso',
            videoInfo
        };

        console.log('📤 [BACKEND] Enviando resposta:', response);
        res.status(202).json(response);

        // Iniciar processamento assíncrono (não aguardar)
        JobManager.processVideoWithExistingJob(jobId, url, language, targetLanguage)
            .catch((error: Error) => {
                console.error('💥 [BACKEND] Erro no processamento assíncrono:', error);
                JobManager.updateJob(jobId, { 
                    status: 'error', 
                    error: error instanceof Error ? error.message : 'Erro desconhecido',
                    completedAt: new Date()
                });
            });

    } catch (error) {
        console.error('💥 [BACKEND] Erro no processamento do vídeo:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: error instanceof Error ? error.message : 'Erro desconhecido no processamento'
        });
    }
};

// Verificar status do job
export const getJobStatus = async (req: Request, res: Response): Promise<void> => {
    console.log('📊 [BACKEND] Recebida requisição para verificar status do job');
    
    try {
        const { jobId } = req.params;
        console.log('🔍 [BACKEND] Job ID solicitado:', jobId);

        if (!jobId) {
            console.error('❌ [BACKEND] Job ID não fornecido');
            res.status(400).json({
                error: 'Job ID é obrigatório',
                message: 'O parâmetro "jobId" é necessário'
            });
            return;
        }

        console.log('🔍 [BACKEND] Buscando job no JobManager...');
        const job = JobManager.getJob(jobId);

        if (!job) {
            console.error('❌ [BACKEND] Job não encontrado:', jobId);
            res.status(404).json({
                error: 'Job não encontrado',
                message: 'O job especificado não foi encontrado'
            });
            return;
        }

        console.log('📄 [BACKEND] Job encontrado:', {
            id: job.id,
            status: job.status,
            progress: job.progress,
            error: job.error
        });

        const response: JobStatusResponse = {
            jobId: job.id,
            status: job.status,
            progress: job.progress,
            message: job.status === 'error' ? job.error : undefined,
            error: job.error || undefined
        };

        // Adicionar informações de segmentos se disponíveis
        if (job.totalSegments !== undefined) {
            response.totalSegments = job.totalSegments;
        }
        if (job.translatedSegments !== undefined) {
            response.translatedSegments = job.translatedSegments;
        }
        if (job.currentSegmentText !== undefined) {
            response.currentSegmentText = job.currentSegmentText;
        }

        // Se o job estiver completo, incluir o resultado
        if (job.status === 'completed') {
            console.log('✅ [BACKEND] Job completado, obtendo resultado...');
            const result = await JobManager.getJobResult(jobId);
            if (result) {
                console.log('📄 [BACKEND] Resultado obtido com sucesso');
                response.result = result;
            } else {
                console.warn('⚠️ [BACKEND] Job completado mas resultado não encontrado');
            }
        }

        console.log('📤 [BACKEND] Enviando resposta do status:', response);
        res.json(response);

    } catch (error) {
        console.error('💥 [BACKEND] Erro ao verificar status do job:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Erro ao verificar status do processamento'
        });
    }
};

// Obter resultado do processamento
export const getVideoResult = async (req: Request, res: Response): Promise<void> => {
    try {
        const { jobId } = req.params;

        if (!jobId) {
            res.status(400).json({
                error: 'Job ID é obrigatório',
                message: 'O parâmetro "jobId" é necessário'
            });
            return;
        }

        const result = await JobManager.getJobResult(jobId);

        if (!result) {
            res.status(404).json({
                error: 'Resultado não encontrado',
                message: 'O resultado do processamento não foi encontrado ou ainda não está pronto'
            });
            return;
        }

        res.json(result);

    } catch (error) {
        console.error('Erro ao obter resultado:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Erro ao obter resultado do processamento'
        });
    }
};

// Stream do vídeo processado
export const streamVideo = async (req: Request, res: Response): Promise<void> => {
    try {
        const { jobId } = req.params;

        if (!jobId) {
            res.status(400).json({
                error: 'Job ID é obrigatório',
                message: 'O parâmetro "jobId" é necessário'
            });
            return;
        }

        const job = JobManager.getJob(jobId);

        if (!job || !job.videoPath) {
            res.status(404).json({
                error: 'Vídeo não encontrado',
                message: 'O vídeo especificado não foi encontrado'
            });
            return;
        }

        const videoPath = job.videoPath;

        // Verificar se o arquivo existe
        if (!await fs.pathExists(videoPath)) {
            res.status(404).json({
                error: 'Arquivo não encontrado',
                message: 'O arquivo de vídeo não foi encontrado no servidor'
            });
            return;
        }

        const stat = await fs.stat(videoPath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            // Suporte para streaming com range requests
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parts[0] ? parseInt(parts[0], 10) : 0;
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            const file = fs.createReadStream(videoPath, { start, end });
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/mp4',
            };
            res.writeHead(206, head);
            file.pipe(res);
        } else {
            // Stream completo
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            };
            res.writeHead(200, head);
            fs.createReadStream(videoPath).pipe(res);
        }

    } catch (error) {
        console.error('Erro no streaming do vídeo:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Erro ao fazer streaming do vídeo'
        });
    }
};

// Listar todos os jobs
export const listJobs = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status } = req.query;

        let jobs;
        if (status && typeof status === 'string') {
            jobs = JobManager.getJobsByStatus(status as any);
        } else {
            jobs = JobManager.getAllJobs();
        }

        // Remover informações sensíveis dos jobs
        const sanitizedJobs = jobs.map(job => ({
            id: job.id,
            videoInfo: job.videoInfo,
            status: job.status,
            progress: job.progress,
            createdAt: job.createdAt,
            completedAt: job.completedAt,
            error: job.error
        }));

        res.json({
            jobs: sanitizedJobs,
            total: sanitizedJobs.length
        });

    } catch (error) {
        console.error('Erro ao listar jobs:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Erro ao listar jobs'
        });
    }
};

// Deletar job
export const deleteJob = async (req: Request, res: Response): Promise<void> => {
    try {
        const { jobId } = req.params;

        if (!jobId) {
            res.status(400).json({
                error: 'Job ID é obrigatório',
                message: 'O parâmetro "jobId" é necessário'
            });
            return;
        }

        const deleted = JobManager.deleteJob(jobId);

        if (!deleted) {
            res.status(404).json({
                error: 'Job não encontrado',
                message: 'O job especificado não foi encontrado'
            });
            return;
        }

        res.json({
            message: 'Job deletado com sucesso',
            jobId
        });

    } catch (error) {
        console.error('Erro ao deletar job:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Erro ao deletar job'
        });
    }
};

// Obter estatísticas dos jobs
export const getJobStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const stats = JobManager.getJobStats();
        res.json(stats);

    } catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Erro ao obter estatísticas dos jobs'
        });
    }
};

// Validar URL do YouTube
export const validateYouTubeUrl = async (req: Request, res: Response): Promise<void> => {
    console.log('🔍 [BACKEND] Recebida requisição para validar URL');
    console.log('📋 [BACKEND] Dados da validação:', req.body);
    
    try {
        const { url } = req.body;

        if (!url) {
            console.error('❌ [BACKEND] URL não fornecida na validação');
            res.status(400).json({
                error: 'URL é obrigatória',
                message: 'O campo "url" é necessário'
            });
            return;
        }

        console.log('🔍 [BACKEND] Validando URL:', url);
        const isValid = YouTubeProcessor.validateYouTubeUrl(url);
        console.log('📊 [BACKEND] Resultado da validação básica:', isValid);
        
        if (isValid) {
            try {
                console.log('📺 [BACKEND] Obtendo informações do vídeo para validação...');
                const videoInfo = await YouTubeProcessor.getVideoInfo(url);
                console.log('✅ [BACKEND] Informações obtidas com sucesso:', videoInfo);
                res.json({
                    valid: true,
                    videoInfo
                });
            } catch (error) {
                console.error('❌ [BACKEND] Erro ao obter informações do vídeo:', error);
                res.json({
                    valid: false,
                    error: 'Não foi possível obter informações do vídeo'
                });
            }
        } else {
            console.error('❌ [BACKEND] URL do YouTube inválida');
            res.json({
                valid: false,
                error: 'URL do YouTube inválida'
            });
        }

    } catch (error) {
        console.error('💥 [BACKEND] Erro na validação da URL:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Erro ao validar URL'
        });
    }
}; 