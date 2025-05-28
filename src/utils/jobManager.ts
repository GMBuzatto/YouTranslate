import { VideoProcessingJob, YouTubeVideoInfo, TranscriptionResult, SubtitleSegment } from '@/types';
import { YouTubeProcessor } from './youtube';
import { AudioTranscriber } from './transcription';
import { translateText } from './groq';

export class JobManager {
    private static jobs: Map<string, VideoProcessingJob> = new Map();

    static createJob(videoInfo: YouTubeVideoInfo): VideoProcessingJob {
        const jobId = YouTubeProcessor.generateJobId();
        console.log('📝 [JOBMANAGER] Criando novo job:', jobId);
        
        const job: VideoProcessingJob = {
            id: jobId,
            videoInfo,
            status: 'downloading',
            progress: 0,
            createdAt: new Date()
        };

        this.jobs.set(jobId, job);
        console.log('✅ [JOBMANAGER] Job criado e armazenado:', {
            id: job.id,
            title: videoInfo.title,
            duration: videoInfo.duration
        });
        return job;
    }

    static getJob(jobId: string): VideoProcessingJob | undefined {
        console.log('🔍 [JOBMANAGER] Buscando job:', jobId);
        const job = this.jobs.get(jobId);
        if (job) {
            console.log('✅ [JOBMANAGER] Job encontrado:', {
                id: job.id,
                status: job.status,
                progress: job.progress
            });
        } else {
            console.warn('⚠️ [JOBMANAGER] Job não encontrado:', jobId);
        }
        return job;
    }

    static updateJob(jobId: string, updates: Partial<VideoProcessingJob>): void {
        console.log('🔄 [JOBMANAGER] Atualizando job:', jobId, updates);
        const job = this.jobs.get(jobId);
        if (job) {
            Object.assign(job, updates);
            this.jobs.set(jobId, job);
            console.log('✅ [JOBMANAGER] Job atualizado:', {
                id: job.id,
                status: job.status,
                progress: job.progress
            });
        } else {
            console.error('❌ [JOBMANAGER] Tentativa de atualizar job inexistente:', jobId);
        }
    }

    static async processVideo(
        url: string, 
        language: string = 'en', 
        targetLanguage: string = 'pt'
    ): Promise<string> {
        console.log('🚀 [JOBMANAGER] Iniciando processamento de vídeo');
        console.log('📋 [JOBMANAGER] Parâmetros:', { url, language, targetLanguage });
        
        let jobId: string;
        
        try {
            console.log('📺 [JOBMANAGER] Obtendo informações do vídeo...');
            // 1. Obter informações do vídeo
            const videoInfo = await YouTubeProcessor.getVideoInfo(url);
            console.log('✅ [JOBMANAGER] Informações do vídeo obtidas:', videoInfo);
            
            const job = this.createJob(videoInfo);
            jobId = job.id;
            console.log('📝 [JOBMANAGER] Job criado:', jobId);

            await this.processVideoWithExistingJob(jobId, url, language, targetLanguage);
            return jobId;

        } catch (error) {
            console.error('💥 [JOBMANAGER] Erro durante o processamento:', error);
            if (jobId!) {
                console.log('❌ [JOBMANAGER] Marcando job como erro:', jobId);
                this.updateJob(jobId, { 
                    status: 'error', 
                    error: error instanceof Error ? error.message : 'Erro desconhecido',
                    completedAt: new Date()
                });
            }
            throw error;
        }
    }

    static async processVideoWithExistingJob(
        jobId: string,
        url: string, 
        language: string = 'en', 
        targetLanguage: string = 'pt'
    ): Promise<void> {
        console.log('🚀 [JOBMANAGER] Iniciando processamento de vídeo com job existente:', jobId);
        console.log('📋 [JOBMANAGER] Parâmetros:', { url, language, targetLanguage });
        
        try {
            console.log('⬇️ [JOBMANAGER] Iniciando download do vídeo...');
            // 2. Download do vídeo e extração de áudio
            this.updateJob(jobId, { 
                status: 'downloading', 
                progress: 10 
            });

            const { videoPath, audioPath } = await YouTubeProcessor.downloadVideo(url, jobId);
            console.log('✅ [JOBMANAGER] Download concluído:', { videoPath, audioPath });
            
            this.updateJob(jobId, { 
                status: 'extracting_audio', 
                progress: 30,
                videoPath,
                audioPath 
            });

            console.log('🎵 [JOBMANAGER] Iniciando transcrição do áudio...');
            // 3. Transcrição do áudio
            this.updateJob(jobId, { 
                status: 'transcribing', 
                progress: 50 
            });

            const transcription = await AudioTranscriber.transcribeAudio({
                audioPath,
                language,
                response_format: 'verbose_json',
                timestamp_granularities: ['segment']
            });
            console.log('✅ [JOBMANAGER] Transcrição concluída:', {
                text: transcription.text.substring(0, 100) + '...',
                segments: transcription.segments.length
            });

            this.updateJob(jobId, { 
                status: 'translating', 
                progress: 70,
                transcription 
            });

            console.log('🌍 [JOBMANAGER] Iniciando tradução e geração de legendas...');
            // 4. Tradução e geração de legendas
            let subtitles: SubtitleSegment[] = [];
            
            if (language !== targetLanguage) {
                console.log('🔄 [JOBMANAGER] Criando legendas a partir dos segmentos de transcrição...');
                // Usar segmentos da transcrição diretamente
                subtitles = transcription.segments.map(segment => ({
                    start: segment.start,
                    end: segment.end,
                    text: segment.text,
                    translation: '' // Será preenchido abaixo
                }));
                console.log('✅ [JOBMANAGER] Legendas criadas:', subtitles.length, 'segmentos');

                // Atualizar job com informações dos segmentos
                this.updateJob(jobId, { 
                    totalSegments: subtitles.length,
                    translatedSegments: 0
                });

                console.log('🔄 [JOBMANAGER] Traduzindo segmentos de legenda...');
                // Traduzir cada segmento de legenda
                for (let i = 0; i < subtitles.length; i++) {
                    const subtitle = subtitles[i];
                    if (subtitle) {
                        try {
                            // Atualizar progresso antes de traduzir
                            const segmentProgress = 70 + Math.floor((i / subtitles.length) * 20); // 70% a 90%
                            this.updateJob(jobId, { 
                                progress: segmentProgress,
                                translatedSegments: i,
                                currentSegmentText: subtitle.text.substring(0, 50) + (subtitle.text.length > 50 ? '...' : '')
                            });

                            const translatedSegment = await translateText(
                                subtitle.text, 
                                language, 
                                targetLanguage
                            );
                            subtitle.translation = translatedSegment;
                            console.log(`✅ [JOBMANAGER] Segmento ${i + 1}/${subtitles.length} traduzido`);
                            
                            // Atualizar progresso após traduzir
                            this.updateJob(jobId, { 
                                translatedSegments: i + 1
                            });
                        } catch (translationError) {
                            console.error(`❌ [JOBMANAGER] Erro ao traduzir segmento ${i + 1}:`, translationError);
                            // Em caso de erro, usar o texto original
                            subtitle.translation = subtitle.text;
                            
                            // Ainda assim atualizar o progresso
                            this.updateJob(jobId, { 
                                translatedSegments: i + 1
                            });
                        }
                    }
                }
            } else {
                console.log('📝 [JOBMANAGER] Idiomas iguais, usando transcrição direta...');
                // Se não precisar traduzir, usar transcrição direta
                subtitles = transcription.segments.map(segment => ({
                    start: segment.start,
                    end: segment.end,
                    text: segment.text,
                    translation: segment.text
                }));
                console.log('✅ [JOBMANAGER] Legendas criadas diretamente:', subtitles.length, 'segmentos');
                
                // Atualizar job com informações dos segmentos
                this.updateJob(jobId, { 
                    totalSegments: subtitles.length,
                    translatedSegments: subtitles.length
                });
            }

            console.log('🎬 [JOBMANAGER] Finalizando processamento...');
            this.updateJob(jobId, { 
                status: 'generating_subtitles', 
                progress: 90 
            });

            // 5. Finalizar job
            this.updateJob(jobId, { 
                status: 'completed', 
                progress: 100,
                completedAt: new Date(),
                subtitles 
            });

            console.log('✅ [JOBMANAGER] Processamento concluído com sucesso:', jobId);

        } catch (error) {
            console.error('💥 [JOBMANAGER] Erro durante o processamento:', error);
            this.updateJob(jobId, { 
                status: 'error', 
                error: error instanceof Error ? error.message : 'Erro desconhecido',
                completedAt: new Date()
            });
            throw error;
        }
    }

    static async getJobResult(jobId: string): Promise<{
        videoUrl: string;
        subtitles: SubtitleSegment[];
        videoInfo: YouTubeVideoInfo;
        transcription: TranscriptionResult;
    } | null> {
        const job = this.getJob(jobId);
        
        if (!job || job.status !== 'completed' || !job.subtitles || !job.transcription) {
            return null;
        }

        // Gerar URL local para o vídeo
        const videoUrl = `/api/v1/video/${jobId}/stream`;

        return {
            videoUrl,
            subtitles: job.subtitles,
            videoInfo: job.videoInfo,
            transcription: job.transcription
        };
    }

    static getAllJobs(): VideoProcessingJob[] {
        return Array.from(this.jobs.values());
    }

    static getJobsByStatus(status: VideoProcessingJob['status']): VideoProcessingJob[] {
        return Array.from(this.jobs.values()).filter(job => job.status === status);
    }

    static deleteJob(jobId: string): boolean {
        const job = this.jobs.get(jobId);
        if (job) {
            // Limpar arquivos associados
            if (job.videoPath || job.audioPath) {
                YouTubeProcessor.cleanupFiles([
                    job.videoPath || '',
                    job.audioPath || ''
                ].filter(Boolean));
            }
            
            this.jobs.delete(jobId);
            return true;
        }
        return false;
    }

    static cleanupOldJobs(maxAgeHours: number = 24): number {
        const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
        let deletedCount = 0;

        for (const [jobId, job] of this.jobs.entries()) {
            if (job.createdAt < cutoffTime) {
                this.deleteJob(jobId);
                deletedCount++;
            }
        }

        return deletedCount;
    }

    static getJobStats(): {
        total: number;
        byStatus: Record<VideoProcessingJob['status'], number>;
        averageProcessingTime: number;
    } {
        const jobs = Array.from(this.jobs.values());
        const total = jobs.length;

        const byStatus: Record<VideoProcessingJob['status'], number> = {
            downloading: 0,
            extracting_audio: 0,
            transcribing: 0,
            translating: 0,
            generating_subtitles: 0,
            completed: 0,
            error: 0
        };

        let totalProcessingTime = 0;
        let completedJobs = 0;

        for (const job of jobs) {
            byStatus[job.status]++;
            
            if (job.completedAt && job.status === 'completed') {
                totalProcessingTime += job.completedAt.getTime() - job.createdAt.getTime();
                completedJobs++;
            }
        }

        const averageProcessingTime = completedJobs > 0 
            ? totalProcessingTime / completedJobs / 1000 // em segundos
            : 0;

        return {
            total,
            byStatus,
            averageProcessingTime
        };
    }
} 