// Tipos de resposta da API
export interface HealthResponse {
    status: string;
    timestamp: string;
    uptime: number;
    environment: string;
    version: string;
}

export interface ApiStatusResponse {
    service: string;
    status: string;
    version: string;
    timestamp: string;
}

export interface WelcomeResponse {
    message: string;
    description: string;
    version: string;
    environment: string;
    endpoints: {
        health: string;
        api: string;
    };
}

export interface ErrorResponse {
    error: string;
    message?: string;
    stack?: string;
    path?: string;
    method?: string;
}

// Tipos de configuração
export interface AppConfig {
    port: number;
    nodeEnv: string;
    apiVersion: string;
    corsOrigin: string;
    logLevel: string;
}

// Tipos para upload de vídeo
export interface VideoUpload {
    id: string;
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    uploadedAt: Date;
    status: 'pending' | 'processing' | 'completed' | 'error';
}

// Tipos para tradução com Groq
export interface TranslationJob {
    id: string;
    videoId?: string;
    sourceLanguage: string;
    targetLanguage: string;
    status: 'pending' | 'transcribing' | 'translating' | 'completed' | 'error';
    progress: number;
    createdAt: Date;
    completedAt?: Date;
    originalText?: string;
    translatedText?: string;
    model?: string;
    tokensUsed?: number;
}

// Tipos para legendas
export interface Subtitle {
    id: string;
    startTime: number;
    endTime: number;
    text: string;
    translatedText?: string;
}

export interface SubtitleSegment {
    start: number;
    end: number;
    text: string;
    translation: string;
}

// Tipos para requisições de tradução
export interface TranslateRequest {
    text: string;
    sourceLanguage?: string;
    targetLanguage?: string;
    context?: string;
}

export interface TranslateResponse {
    originalText: string;
    translatedText: string;
    sourceLanguage: string;
    targetLanguage: string;
    model: string;
    tokensUsed: number;
    processingTime: number;
}

// Tipos para geração de legendas
export interface GenerateSubtitlesRequest {
    transcription: string;
    videoDuration: number;
    maxCharsPerLine?: number;
    maxLinesPerSubtitle?: number;
}

export interface GenerateSubtitlesResponse {
    subtitles: SubtitleSegment[];
    totalSegments: number;
    processingTime: number;
    model: string;
}

// Tipos para melhoria de tradução
export interface ImproveTranslationRequest {
    originalText: string;
    currentTranslation: string;
    context?: string;
}

export interface ImproveTranslationResponse {
    originalText: string;
    improvedTranslation: string;
    previousTranslation: string;
    improvements: string[];
    model: string;
    tokensUsed: number;
    processingTime: number;
}

// Tipos para estatísticas de uso
export interface UsageStats {
    totalTranslations: number;
    totalTokensUsed: number;
    averageProcessingTime: number;
    mostUsedModel: string;
    languagePairs: Record<string, number>;
}

// Tipos de ambiente
export type Environment = 'development' | 'production' | 'test';

// Tipos de log
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

// Tipos de modelos Groq disponíveis
export type GroqModel = 
    | 'llama3-8b-8192' 
    | 'llama3-70b-8192' 
    | 'mixtral-8x7b-32768' 
    | 'gemma-7b-it';

// Tipos de idiomas suportados
export type SupportedLanguage = 
    | 'en' // Inglês
    | 'pt' // Português
    | 'es' // Espanhol
    | 'fr' // Francês
    | 'de' // Alemão
    | 'it' // Italiano
    | 'ja' // Japonês
    | 'ko' // Coreano
    | 'zh'; // Chinês

// Tipos para YouTube Video Processing
export interface YouTubeVideoRequest {
    url: string;
    language?: string;
    targetLanguage?: string;
}

export interface YouTubeVideoInfo {
    id: string;
    title: string;
    duration: number;
    thumbnail: string;
    author: string;
    description?: string | undefined;
    url: string;
}

export interface VideoProcessingJob {
    id: string;
    videoInfo: YouTubeVideoInfo;
    status: 'downloading' | 'extracting_audio' | 'transcribing' | 'translating' | 'generating_subtitles' | 'completed' | 'error';
    progress: number;
    createdAt: Date;
    completedAt?: Date;
    error?: string;
    audioPath?: string;
    videoPath?: string;
    transcription?: TranscriptionResult;
    subtitles?: SubtitleSegment[];
    totalSegments?: number;
    translatedSegments?: number;
    currentSegmentText?: string;
}

export interface TranscriptionResult {
    text: string;
    segments: TranscriptionSegment[];
    language: string;
    duration: number;
    model: string;
}

export interface TranscriptionSegment {
    id: number;
    start: number;
    end: number;
    text: string;
    tokens: number[];
    temperature: number;
    avg_logprob: number;
    compression_ratio: number;
    no_speech_prob: number;
}

export interface AudioTranscriptionRequest {
    audioPath: string;
    language?: string;
    model?: string;
    prompt?: string | undefined;
    response_format?: 'json' | 'text' | 'verbose_json';
    temperature?: number;
    timestamp_granularities?: ('word' | 'segment')[];
}

export interface VideoPlayerData {
    videoUrl: string;
    subtitles: SubtitleSegment[];
    videoInfo: YouTubeVideoInfo;
    transcription: TranscriptionResult;
}

export interface ProcessVideoResponse {
    jobId: string;
    status: string;
    message: string;
    videoInfo?: YouTubeVideoInfo;
}

export interface JobStatusResponse {
    jobId: string;
    status: string;
    progress: number;
    message?: string | undefined;
    error?: string | undefined;
    result?: VideoPlayerData;
    totalSegments?: number;
    translatedSegments?: number;
    currentSegmentText?: string;
} 