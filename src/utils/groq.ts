import Groq from 'groq-sdk';
import fs from 'fs-extra';

// Configuração do cliente Groq
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// Tipos para as respostas do Groq
export interface GroqChatResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
        index: number;
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }>;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

// Função para transcrever áudio usando Groq
export const transcribeAudio = async (audioPath: string): Promise<{
    text: string;
    segments: Array<{
        id: number;
        start: number;
        end: number;
        text: string;
        tokens: number[];
        temperature: number;
        avg_logprob: number;
        compression_ratio: number;
        no_speech_prob: number;
    }>;
    language: string;
    duration: number;
    model: string;
}> => {
    try {
        // Verificar se o arquivo existe
        if (!await fs.pathExists(audioPath)) {
            throw new Error('Arquivo de áudio não encontrado');
        }

        // Criar stream do arquivo
        const audioFile = fs.createReadStream(audioPath);

        // Fazer a transcrição usando Groq
        const transcription = await groq.audio.transcriptions.create({
            file: audioFile,
            model: 'whisper-large-v3-turbo',
            language: 'en', // Pode ser ajustado conforme necessário
            response_format: 'verbose_json',
            timestamp_granularities: ['segment'],
            temperature: 0.0
        });

        // Processar a resposta (cast para any para acessar propriedades específicas)
        const transcriptionData = transcription as any;
        
        return {
            text: transcriptionData.text,
            segments: transcriptionData.segments?.map((segment: any, index: number) => ({
                id: segment.id || index,
                start: segment.start,
                end: segment.end,
                text: segment.text,
                tokens: segment.tokens || [],
                temperature: segment.temperature || 0,
                avg_logprob: segment.avg_logprob || 0,
                compression_ratio: segment.compression_ratio || 0,
                no_speech_prob: segment.no_speech_prob || 0
            })) || [],
            language: transcriptionData.language || 'en',
            duration: transcriptionData.duration || 0,
            model: 'whisper-large-v3-turbo'
        };
    } catch (error) {
        console.error('Erro na transcrição:', error);
        throw new Error(`Erro na transcrição: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
};

// Função para traduzir texto
export const translateText = async (
    text: string, 
    sourceLanguage: string = 'en', 
    targetLanguage: string = 'pt'
): Promise<string> => {
    try {
        const prompt = `Traduza o seguinte texto de ${sourceLanguage} para ${targetLanguage}. 
        Mantenha o contexto e o tom original. Retorne apenas a tradução, sem explicações adicionais.
        
        Texto para traduzir: "${text}"`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            model: 'llama3-8b-8192', // Modelo rápido do Groq
            temperature: 0.3, // Baixa criatividade para tradução mais precisa
            max_tokens: 1000,
        });

        const translation = chatCompletion.choices[0]?.message?.content?.trim();
        
        if (!translation) {
            throw new Error('Nenhuma tradução foi retornada');
        }

        return translation;
    } catch (error) {
        console.error('Erro na tradução:', error);
        throw error;
    }
};

// Função para gerar legendas com timestamps
export const generateSubtitles = async (
    transcription: string,
    videoDuration: number
): Promise<Array<{ start: number; end: number; text: string; translation: string }>> => {
    try {
        const prompt = `Divida o seguinte texto transcrito em legendas apropriadas para um vídeo de ${videoDuration} segundos.
        Cada legenda deve ter no máximo 2 linhas e 42 caracteres por linha.
        Retorne no formato JSON com start (segundos), end (segundos), text (original) e translation (português).
        
        Texto transcrito: "${transcription}"`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            model: 'llama3-8b-8192',
            temperature: 0.2,
            max_tokens: 2000,
        });

        const response = chatCompletion.choices[0]?.message?.content?.trim();
        
        if (!response) {
            throw new Error('Nenhuma resposta foi retornada para geração de legendas');
        }

        // Tentar parsear a resposta JSON
        try {
            return JSON.parse(response);
        } catch (parseError) {
            console.error('Erro ao parsear resposta JSON:', parseError);
            throw new Error('Resposta inválida do modelo de IA');
        }
    } catch (error) {
        console.error('Erro na geração de legendas:', error);
        throw error;
    }
};

// Função para melhorar qualidade da tradução
export const improveTranslation = async (
    originalText: string,
    translation: string,
    context?: string
): Promise<string> => {
    try {
        const prompt = `Melhore a seguinte tradução do inglês para o português, considerando o contexto ${context || 'de vídeo/áudio'}.
        Mantenha o significado original, mas torne a tradução mais natural e fluida em português brasileiro.
        
        Texto original: "${originalText}"
        Tradução atual: "${translation}"
        
        Retorne apenas a tradução melhorada:`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            model: 'llama3-70b-8192', // Modelo mais avançado para melhor qualidade
            temperature: 0.4,
            max_tokens: 500,
        });

        const improvedTranslation = chatCompletion.choices[0]?.message?.content?.trim();
        
        if (!improvedTranslation) {
            throw new Error('Nenhuma melhoria foi retornada');
        }

        return improvedTranslation;
    } catch (error) {
        console.error('Erro na melhoria da tradução:', error);
        throw error;
    }
};

export default groq; 