# YouTranslate - Configuração e Instalação

## 📋 Pré-requisitos

### Software Necessário
- **Node.js** (versão 16 ou superior)
- **npm** (versão 8 ou superior)
- **FFmpeg** (para processamento de áudio/vídeo)

### Instalação do FFmpeg

#### Windows
```bash
# Usando Chocolatey
choco install ffmpeg

# Ou baixe diretamente de: https://ffmpeg.org/download.html
```

#### macOS
```bash
# Usando Homebrew
brew install ffmpeg
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install ffmpeg
```

## 🚀 Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/GMBuzatto/YouTranslate.git
cd YouTranslate
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
# Configuração do Servidor
PORT=3000
NODE_ENV=development

# API Configuration
API_VERSION=v1
CORS_ORIGIN=*

# Groq API Configuration
GROQ_API_KEY=your_groq_api_key_here

# Log Level
LOG_LEVEL=info

# FFmpeg Path (opcional - descomente se necessário)
# FFMPEG_PATH=/usr/local/bin/ffmpeg
# FFPROBE_PATH=/usr/local/bin/ffprobe
```

### 4. Obtenha sua chave da API Groq
1. Acesse [console.groq.com](https://console.groq.com)
2. Crie uma conta ou faça login
3. Gere uma nova API key
4. Substitua `your_groq_api_key_here` pela sua chave real

## 🏃‍♂️ Executando o Projeto

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

### Com watch (desenvolvimento)
```bash
npm run dev:watch
```

## 🎯 Como Usar

### 1. Acesse a Interface Web
Abra seu navegador e vá para: `http://localhost:3000`

### 2. Processar um Vídeo do YouTube
1. Cole a URL do vídeo do YouTube no campo de entrada
2. Selecione o idioma do vídeo original
3. Selecione o idioma para tradução
4. Clique em "🚀 Processar Vídeo"

### 3. Acompanhe o Progresso
O sistema mostrará o progresso em tempo real:
- ⬇️ Download do vídeo
- 🎵 Extração do áudio
- 🎤 Transcrição com IA
- 🌍 Tradução do conteúdo
- 📝 Geração de legendas

### 4. Reproduza com Legendas
Após o processamento, você poderá:
- ▶️ Reproduzir o vídeo com legendas sincronizadas
- 🔤 Mostrar/ocultar legendas
- 📥 Baixar legendas em formato SRT
- 🔄 Processar um novo vídeo

## 📡 API Endpoints

### Vídeo Processing
- `POST /api/v1/video/process` - Processar vídeo do YouTube
- `POST /api/v1/video/validate` - Validar URL do YouTube
- `GET /api/v1/video/job/:jobId/status` - Status do processamento
- `GET /api/v1/video/job/:jobId/result` - Resultado do processamento
- `GET /api/v1/video/:jobId/stream` - Stream do vídeo processado

### Gerenciamento de Jobs
- `GET /api/v1/video/jobs` - Listar todos os jobs
- `DELETE /api/v1/video/job/:jobId` - Deletar job
- `GET /api/v1/video/stats` - Estatísticas dos jobs

### Tradução (Legacy)
- `POST /api/v1/translate` - Traduzir texto
- `POST /api/v1/subtitles` - Gerar legendas
- `POST /api/v1/improve` - Melhorar tradução

## 🔧 Configurações Avançadas

### Limites de Processamento
- **Duração máxima do vídeo**: 30 minutos
- **Tamanho máximo do arquivo de áudio**: 25MB (tier gratuito Groq)
- **Formatos suportados**: MP4, WebM, AVI (vídeo) | WAV, MP3, M4A, FLAC, OGG (áudio)

### Modelos de IA Utilizados
- **Transcrição**: Whisper Large V3 Turbo (Groq)
- **Tradução**: Llama 3 8B/70B (Groq)
- **Geração de Legendas**: Llama 3 8B (Groq)

### Estrutura de Diretórios
```
uploads/
├── videos/     # Vídeos baixados
└── audio/      # Arquivos de áudio extraídos
```

## 🐛 Solução de Problemas

### Erro: "FFmpeg não encontrado"
- Certifique-se de que o FFmpeg está instalado
- Adicione o caminho do FFmpeg às variáveis de ambiente
- No Windows, reinicie o terminal após a instalação

### Erro: "Arquivo muito grande"
- O arquivo de áudio excede 25MB (tier gratuito)
- Tente um vídeo mais curto
- Considere upgrade para tier pago do Groq

### Erro: "URL do YouTube inválida"
- Verifique se a URL está correta
- Certifique-se de que o vídeo é público
- Alguns vídeos podem ter restrições de região

### Erro: "Chave da API Groq inválida"
- Verifique se a chave está correta no arquivo .env
- Confirme se a chave tem permissões adequadas
- Verifique se não excedeu os limites da API

## 📊 Monitoramento

### Logs
Os logs são exibidos no console durante o desenvolvimento. Para produção, configure um sistema de logging adequado.

### Health Check
- `GET /health` - Status do servidor
- `GET /api/v1/status` - Status da API

## 🔒 Segurança

- Helmet.js para headers de segurança
- CORS configurável
- Validação de entrada em todos os endpoints
- Limpeza automática de arquivos temporários

## 🚀 Deploy

### Variáveis de Ambiente para Produção
```env
NODE_ENV=production
PORT=3000
GROQ_API_KEY=your_production_groq_key
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=warn
```

### Docker (Opcional)
```dockerfile
FROM node:18-alpine
RUN apk add --no-cache ffmpeg
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 Licença

ISC License - veja o arquivo LICENSE para detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

Para dúvidas ou problemas:
- Abra uma issue no GitHub
- Consulte a documentação da API Groq
- Verifique os logs do servidor 