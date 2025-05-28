import { transcribeAudio as groqTranscribeAudio } from './groq';
import fs from 'fs-extra';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from '@ffprobe-installer/ffprobe';
import { TranscriptionResult, AudioTranscriptionRequest } from '@/types';

// Configurar o caminho do ffmpeg usando ffmpeg-static
if (ffmpegStatic) {
    ffmpeg.setFfmpegPath(ffmpegStatic);
    console.log('🔧 [TRANSCRIPTION] Configurando ffmpeg path:', ffmpegStatic);
}

// Configurar o caminho do ffprobe usando ffprobe-installer
if (ffprobeStatic.path) {
    ffmpeg.setFfprobePath(ffprobeStatic.path);
    console.log('🔧 [TRANSCRIPTION] Configurando ffprobe path:', ffprobeStatic.path);
}

export class AudioTranscriber {
    private static readonly DEFAULT_MODEL = 'whisper-large-v3-turbo';
    private static readonly MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB para tier gratuito
    private static readonly CHUNK_DURATION = 600; // 10 minutos por chunk (em segundos)

    static async transcribeAudio(request: AudioTranscriptionRequest): Promise<TranscriptionResult> {
        const {
            audioPath,
            language = 'en',
            model = this.DEFAULT_MODEL,
            response_format = 'verbose_json',
            temperature = 0,
        } = request;

        try {
            // Verificar se o arquivo existe
            if (!await fs.pathExists(audioPath)) {
                throw new Error('Arquivo de áudio não encontrado');
            }

            // Verificar tamanho do arquivo
            const fileStats = await fs.stat(audioPath);
            console.log(`📊 [TRANSCRIPTION] Tamanho do arquivo: ${(fileStats.size / (1024 * 1024)).toFixed(2)}MB`);

            if (fileStats.size <= this.MAX_FILE_SIZE) {
                console.log('✅ [TRANSCRIPTION] Arquivo dentro do limite, processando diretamente');
                // Arquivo pequeno o suficiente, processar diretamente
                const transcription = await groqTranscribeAudio(audioPath);
                return {
                    text: transcription.text,
                    segments: transcription.segments,
                    language: transcription.language,
                    duration: transcription.duration,
                    model: transcription.model
                };
            } else {
                console.log('⚠️ [TRANSCRIPTION] Arquivo muito grande, dividindo em chunks');
                // Arquivo muito grande, dividir em chunks
                return await this.transcribeAudioInChunks(audioPath, language, model, response_format, temperature);
            }

        } catch (error) {
            throw new Error(`Erro na transcrição: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }

    private static async transcribeAudioInChunks(
        audioPath: string,
        language: string,
        model: string,
        response_format: string,
        temperature: number
    ): Promise<TranscriptionResult> {
        const tempDir = path.join(path.dirname(audioPath), 'chunks');
        await fs.ensureDir(tempDir);

        try {
            console.log('🔪 [TRANSCRIPTION] Dividindo áudio em chunks...');
            
            // Obter duração do áudio
            const duration = await this.getAudioDuration(audioPath);
            console.log(`⏱️ [TRANSCRIPTION] Duração total: ${duration} segundos`);

            // Calcular número de chunks necessários
            const numChunks = Math.ceil(duration / this.CHUNK_DURATION);
            console.log(`📦 [TRANSCRIPTION] Criando ${numChunks} chunks de ${this.CHUNK_DURATION} segundos cada`);

            // Dividir o áudio em chunks
            const chunkPaths = await this.splitAudioIntoChunks(audioPath, tempDir, numChunks);
            console.log(`✅ [TRANSCRIPTION] ${chunkPaths.length} chunks criados`);

            // Transcrever cada chunk
            const allSegments: any[] = [];
            let fullText = '';
            let totalDuration = 0;

            for (let i = 0; i < chunkPaths.length; i++) {
                const chunkPath = chunkPaths[i];
                const chunkStartTime = i * this.CHUNK_DURATION;
                
                console.log(`🎵 [TRANSCRIPTION] Transcrevendo chunk ${i + 1}/${chunkPaths.length}...`);
                
                try {
                    if (!chunkPath) {
                        throw new Error('Chunk path is undefined');
                    }
                    const chunkTranscription = await groqTranscribeAudio(chunkPath);
                    
                    // Ajustar timestamps dos segmentos para o tempo global
                    const adjustedSegments = chunkTranscription.segments.map(segment => ({
                        ...segment,
                        start: segment.start + chunkStartTime,
                        end: segment.end + chunkStartTime
                    }));

                    allSegments.push(...adjustedSegments);
                    fullText += (fullText ? ' ' : '') + chunkTranscription.text;
                    totalDuration = Math.max(totalDuration, chunkTranscription.duration + chunkStartTime);
                    
                    console.log(`✅ [TRANSCRIPTION] Chunk ${i + 1} transcrito: ${chunkTranscription.text.substring(0, 50)}...`);
                } catch (chunkError) {
                    console.error(`❌ [TRANSCRIPTION] Erro no chunk ${i + 1}:`, chunkError);
                    // Continuar com os outros chunks mesmo se um falhar
                }
            }

            console.log(`🎉 [TRANSCRIPTION] Transcrição completa: ${allSegments.length} segmentos, ${fullText.length} caracteres`);

            return {
                text: fullText,
                segments: allSegments,
                language: language,
                duration: totalDuration,
                model: model
            };

        } finally {
            // Limpar arquivos temporários
            console.log('🧹 [TRANSCRIPTION] Limpando arquivos temporários...');
            await fs.remove(tempDir);
        }
    }

    private static async splitAudioIntoChunks(audioPath: string, tempDir: string, numChunks: number): Promise<string[]> {
        const chunkPaths: string[] = [];
        const duration = await this.getAudioDuration(audioPath);

        for (let i = 0; i < numChunks; i++) {
            const startTime = i * this.CHUNK_DURATION;
            const chunkPath = path.join(tempDir, `chunk_${i.toString().padStart(3, '0')}.wav`);
            
            await this.extractAudioSegment(audioPath, chunkPath, startTime, this.CHUNK_DURATION);
            chunkPaths.push(chunkPath);
        }

        return chunkPaths;
    }

    private static async extractAudioSegment(
        inputPath: string, 
        outputPath: string, 
        startTime: number, 
        duration: number
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .seekInput(startTime)
                .duration(duration)
                .noVideo() // Remove vídeo, mantém apenas áudio
                .audioChannels(1)
                .audioFrequency(16000)
                .format('wav')
                .on('end', () => {
                    resolve();
                })
                .on('error', (error) => {
                    reject(new Error(`Erro ao extrair segmento de áudio: ${error.message}`));
                })
                .save(outputPath);
        });
    }

    static async getAudioDuration(audioPath: string): Promise<number> {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(audioPath, (err, metadata) => {
                if (err) {
                    reject(new Error(`Erro ao obter duração do áudio: ${err.message}`));
                    return;
                }
                
                const duration = metadata.format.duration || 0;
                resolve(duration);
            });
        });
    }

    static validateAudioFile(audioPath: string): boolean {
        const supportedExtensions = ['.wav', '.mp3', '.m4a', '.flac', '.ogg'];
        const extension = audioPath.toLowerCase().substring(audioPath.lastIndexOf('.'));
        return supportedExtensions.includes(extension);
    }

    static formatTimestamp(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 1000);

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
    }

    static analyzeTranscriptionQuality(segments: any[]): {
        averageConfidence: number;
        lowConfidenceSegments: number;
        silenceDetected: number;
        overallQuality: 'excellent' | 'good' | 'fair' | 'poor';
    } {
        if (!segments || segments.length === 0) {
            return {
                averageConfidence: 0,
                lowConfidenceSegments: 0,
                silenceDetected: 0,
                overallQuality: 'poor'
            };
        }

        const avgLogProbs = segments.map(s => s.avg_logprob || 0);
        const noSpeechProbs = segments.map(s => s.no_speech_prob || 0);

        const averageConfidence = avgLogProbs.reduce((sum, prob) => sum + Math.abs(prob), 0) / avgLogProbs.length;
        const lowConfidenceSegments = avgLogProbs.filter(prob => prob < -0.5).length;
        const silenceDetected = noSpeechProbs.filter(prob => prob > 0.5).length;

        let overallQuality: 'excellent' | 'good' | 'fair' | 'poor';
        if (averageConfidence < 0.2 && lowConfidenceSegments < segments.length * 0.1) {
            overallQuality = 'excellent';
        } else if (averageConfidence < 0.4 && lowConfidenceSegments < segments.length * 0.2) {
            overallQuality = 'good';
        } else if (averageConfidence < 0.6 && lowConfidenceSegments < segments.length * 0.4) {
            overallQuality = 'fair';
        } else {
            overallQuality = 'poor';
        }

        return {
            averageConfidence,
            lowConfidenceSegments,
            silenceDetected,
            overallQuality
        };
    }
} 