import ytdl from '@distube/ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { YouTubeVideoInfo } from '@/types';

// Configurar o caminho do ffmpeg usando ffmpeg-static
if (ffmpegStatic) {
    console.log('🔧 [YOUTUBE] Configurando ffmpeg path:', ffmpegStatic);
    ffmpeg.setFfmpegPath(ffmpegStatic);
} else {
    console.error('❌ [YOUTUBE] ffmpeg-static não encontrado!');
}

export class YouTubeProcessor {
    private static uploadsDir = path.join(process.cwd(), 'uploads');
    private static videosDir = path.join(this.uploadsDir, 'videos');
    private static audioDir = path.join(this.uploadsDir, 'audio');

    static async initialize(): Promise<void> {
        await fs.ensureDir(this.uploadsDir);
        await fs.ensureDir(this.videosDir);
        await fs.ensureDir(this.audioDir);
    }

    static async getVideoInfo(url: string): Promise<YouTubeVideoInfo> {
        try {
            const info = await ytdl.getInfo(url);
            const videoDetails = info.videoDetails;

            return {
                id: videoDetails.videoId,
                title: videoDetails.title,
                duration: parseInt(videoDetails.lengthSeconds),
                thumbnail: videoDetails.thumbnails[0]?.url || '',
                author: videoDetails.author.name,
                description: videoDetails.description || undefined,
                url: url
            };
        } catch (error) {
            throw new Error(`Erro ao obter informações do vídeo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }

    static async downloadVideo(url: string, jobId: string): Promise<{ videoPath: string, audioPath: string }> {
        await this.initialize();

        const videoPath = path.join(this.videosDir, `${jobId}.mp4`);
        const rawAudioPath = path.join(this.audioDir, `${jobId}_raw.webm`);
        const audioPath = path.join(this.audioDir, `${jobId}.wav`);

        try {
            // Verificar se a URL é válida
            if (!ytdl.validateURL(url)) {
                throw new Error('URL do YouTube inválida');
            }

            // Download do vídeo e áudio em paralelo
            await Promise.all([
                this.downloadVideoFile(url, videoPath),
                this.downloadAudioFile(url, rawAudioPath)
            ]);

            // Converter áudio para WAV
            await this.convertAudioToWav(rawAudioPath, audioPath);

            // Limpar arquivo de áudio temporário
            await this.cleanupFiles([rawAudioPath]);

            return { videoPath, audioPath };
        } catch (error) {
            // Limpar arquivos em caso de erro
            await this.cleanupFiles([videoPath, rawAudioPath, audioPath]);
            throw error;
        }
    }

    private static async downloadVideoFile(url: string, outputPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const stream = ytdl(url, {
                quality: 'highestvideo',
                filter: 'videoandaudio'
            });

            const writeStream = fs.createWriteStream(outputPath);
            
            stream.pipe(writeStream);

            stream.on('error', (error) => {
                reject(new Error(`Erro no download: ${error.message}`));
            });

            writeStream.on('error', (error) => {
                reject(new Error(`Erro ao salvar arquivo: ${error.message}`));
            });

            writeStream.on('finish', () => {
                resolve();
            });
        });
    }

    private static async downloadAudioFile(url: string, outputPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const stream = ytdl(url, {
                quality: 'highestaudio',
                filter: 'audioonly'
            });

            const writeStream = fs.createWriteStream(outputPath);
            
            stream.pipe(writeStream);

            stream.on('error', (error) => {
                reject(new Error(`Erro no download de áudio: ${error.message}`));
            });

            writeStream.on('error', (error) => {
                reject(new Error(`Erro ao salvar arquivo de áudio: ${error.message}`));
            });

            writeStream.on('finish', () => {
                resolve();
            });
        });
    }

    private static async convertAudioToWav(inputPath: string, outputPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .toFormat('wav')
                .audioChannels(1)
                .audioFrequency(16000)
                .on('end', () => {
                    resolve();
                })
                .on('error', (error) => {
                    reject(new Error(`Erro na conversão de áudio: ${error.message}`));
                })
                .save(outputPath);
        });
    }

    static async cleanupFiles(filePaths: string[]): Promise<void> {
        for (const filePath of filePaths) {
            try {
                if (await fs.pathExists(filePath)) {
                    await fs.remove(filePath);
                }
            } catch (error) {
                console.warn(`Erro ao remover arquivo ${filePath}:`, error);
            }
        }
    }

    static generateJobId(): string {
        return uuidv4();
    }

    static getVideoPath(jobId: string): string {
        return path.join(this.videosDir, `${jobId}.mp4`);
    }

    static getAudioPath(jobId: string): string {
        return path.join(this.audioDir, `${jobId}.wav`);
    }

    static async fileExists(filePath: string): Promise<boolean> {
        return await fs.pathExists(filePath);
    }

    static async getFileSize(filePath: string): Promise<number> {
        const stats = await fs.stat(filePath);
        return stats.size;
    }

    static formatDuration(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    static validateYouTubeUrl(url: string): boolean {
        return ytdl.validateURL(url);
    }

    static extractVideoId(url: string): string | null {
        try {
            return ytdl.getVideoID(url);
        } catch {
            return null;
        }
    }
} 