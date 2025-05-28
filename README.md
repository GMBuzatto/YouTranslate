# 🎬 YouTranslate

<div align="center">

![YouTranslate Logo](https://img.shields.io/badge/🎬-YouTranslate-blue?style=for-the-badge&labelColor=purple)

**Tradutor automático de vídeos: adicione legendas em português ao áudio em inglês sem esforço.**

[![Node.js](https://img.shields.io/badge/Node.js-16+-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-black?style=flat-square&logo=express)](https://expressjs.com/)
[![Groq](https://img.shields.io/badge/Groq-AI-orange?style=flat-square)](https://groq.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

</div>

---

## 🚀 Funcionalidades

<table>
<tr>
<td width="50%">

### 🎯 **Tradução Inteligente**
- **IA Avançada**: Tradução usando modelos Groq (Llama 3, Mixtral, Gemma)
- **Contexto Preservado**: Tradução contextual para maior precisão
- **Múltiplos Idiomas**: Suporte para 9 idiomas diferentes
- **Melhoria Automática**: Aprimoramento de traduções existentes

</td>
<td width="50%">

### 🎬 **Processamento de Vídeo**
- **YouTube Integration**: Download direto de vídeos do YouTube
- **Transcrição Automática**: Whisper AI para speech-to-text
- **Legendas Sincronizadas**: Geração automática com timestamps
- **Interface Moderna**: Web UI responsiva e intuitiva

</td>
</tr>
</table>

### ⚡ **Performance & Segurança**
- **Alta Performance**: Processamento rápido com modelos Groq
- **Processamento Assíncrono**: Jobs em background com status em tempo real
- **Segurança Integrada**: Middleware Helmet e CORS configurado
- **Monitoramento**: Sistema completo de logs e estatísticas

---

## 🛠️ Stack Tecnológica

<div align="center">

| Categoria | Tecnologias |
|-----------|-------------|
| **Backend** | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white) |
| **IA & ML** | ![Groq](https://img.shields.io/badge/Groq-FF6B35?style=flat&logoColor=white) ![Whisper](https://img.shields.io/badge/Whisper-412991?style=flat&logoColor=white) ![Llama](https://img.shields.io/badge/Llama-0467DF?style=flat&logoColor=white) |
| **Mídia** | ![FFmpeg](https://img.shields.io/badge/FFmpeg-007808?style=flat&logo=ffmpeg&logoColor=white) ![YouTube](https://img.shields.io/badge/YouTube_API-FF0000?style=flat&logo=youtube&logoColor=white) |
| **Segurança** | ![Helmet](https://img.shields.io/badge/Helmet-000000?style=flat&logoColor=white) ![CORS](https://img.shields.io/badge/CORS-000000?style=flat&logoColor=white) |
| **Dev Tools** | ![Nodemon](https://img.shields.io/badge/Nodemon-76D04B?style=flat&logo=nodemon&logoColor=white) ![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=flat&logo=eslint&logoColor=white) |

</div>

---

## 📦 Instalação Rápida

### 1️⃣ **Clone e Configure**
```bash
# Clone o repositório
git clone https://github.com/GMBuzatto/YouTranslate.git
cd YouTranslate

# Instale as dependências
npm install

# Configure o ambiente
cp .env.example .env
```

### 2️⃣ **Configure a API do Groq**
1. Acesse [Groq Console](https://console.groq.com/) 🔗
2. Crie uma conta e obtenha sua API key 🔑
3. Adicione no arquivo `.env`:
```env
GROQ_API_KEY=your_actual_groq_api_key_here
PORT=3000
NODE_ENV=development
```

### 3️⃣ **Execute o Projeto**
```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm run build && npm start
```

🎉 **Pronto!** Acesse `http://localhost:3000`

---

## 📡 API Endpoints

### 🏠 **Informações Gerais**
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/` | 🏠 Página inicial com interface web |
| `GET` | `/health` | ❤️ Status de saúde do servidor |
| `GET` | `/api/v1/status` | 📊 Status detalhado da API |

### 🌍 **Tradução de Texto**
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/v1/translate` | 🔄 Traduzir texto |
| `POST` | `/api/v1/subtitles` | 📝 Gerar legendas |
| `POST` | `/api/v1/improve` | ✨ Melhorar tradução |
| `GET` | `/api/v1/languages` | 🌐 Idiomas suportados |
| `GET` | `/api/v1/models` | 🤖 Modelos disponíveis |

### 🎬 **Processamento de Vídeo**
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/v1/video/process` | 🎬 Processar vídeo do YouTube |
| `POST` | `/api/v1/video/validate` | ✅ Validar URL do YouTube |
| `GET` | `/api/v1/video/job/:jobId/status` | 📊 Status do processamento |
| `GET` | `/api/v1/video/job/:jobId/result` | 📄 Resultado do processamento |
| `GET` | `/api/v1/video/:jobId/stream` | 🎥 Stream do vídeo processado |
| `GET` | `/api/v1/video/jobs` | 📋 Listar todos os jobs |
| `DELETE` | `/api/v1/video/job/:jobId` | 🗑️ Deletar job |
| `GET` | `/api/v1/video/stats` | 📈 Estatísticas dos jobs |

---

## 💡 Exemplos de Uso

<details>
<summary><b>🔄 Traduzir Texto</b></summary>

```bash
curl -X POST http://localhost:3000/api/v1/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, how are you today?",
    "sourceLanguage": "en",
    "targetLanguage": "pt",
    "context": "casual conversation"
  }'
```

**Resposta:**
```json
{
  "originalText": "Hello, how are you today?",
  "translatedText": "Olá, como você está hoje?",
  "sourceLanguage": "en",
  "targetLanguage": "pt",
  "model": "llama3-8b-8192"
}
```
</details>

<details>
<summary><b>🎬 Processar Vídeo do YouTube</b></summary>

```bash
curl -X POST http://localhost:3000/api/v1/video/process \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "language": "en",
    "targetLanguage": "pt"
  }'
```

**Resposta:**
```json
{
  "jobId": "job_abc123",
  "status": "processing",
  "message": "Processamento iniciado com sucesso",
  "videoInfo": {
    "title": "Video Title",
    "duration": 180,
    "thumbnail": "https://..."
  }
}
```
</details>

<details>
<summary><b>📊 Verificar Status do Job</b></summary>

```bash
curl http://localhost:3000/api/v1/video/job/job_abc123/status
```

**Resposta:**
```json
{
  "jobId": "job_abc123",
  "status": "translating",
  "progress": 75,
  "totalSegments": 45,
  "translatedSegments": 34,
  "currentSegmentText": "Welcome to this tutorial..."
}
```
</details>

---

## 🤖 Modelos IA Disponíveis

<div align="center">

| Modelo | Descrição | Tokens | Uso Recomendado |
|--------|-----------|--------|-----------------|
| **🦙 Llama 3 8B** | Modelo rápido e eficiente | 8,192 | Tradução geral |
| **🦙 Llama 3 70B** | Modelo avançado de alta qualidade | 8,192 | Melhoria de tradução |
| **🔀 Mixtral 8x7B** | Modelo versátil com contexto longo | 32,768 | Geração de legendas |
| **💎 Gemma 7B IT** | Modelo otimizado para instruções | 8,192 | Uso geral |

</div>

---

## 🌍 Idiomas Suportados

<div align="center">

| Idioma | Código | Flag | Idioma | Código | Flag |
|--------|--------|------|--------|--------|------|
| Inglês | `en` | 🇺🇸 | Alemão | `de` | 🇩🇪 |
| Português | `pt` | 🇧🇷 | Italiano | `it` | 🇮🇹 |
| Espanhol | `es` | 🇪🇸 | Japonês | `ja` | 🇯🇵 |
| Francês | `fr` | 🇫🇷 | Coreano | `ko` | 🇰🇷 |
| Chinês | `zh` | 🇨🇳 | | | |

</div>

---

## 📁 Arquitetura do Projeto

```
YouTranslate/
├── 📂 src/
│   ├── 🎮 controllers/          # Lógica de negócio
│   │   ├── appController.ts     # Controlador principal
│   │   ├── healthController.ts  # Health checks
│   │   ├── translationController.ts # Tradução
│   │   └── videoController.ts   # Processamento de vídeo
│   ├── 🛡️ middleware/           # Middlewares customizados
│   ├── 🛣️ routes/              # Definição de rotas
│   │   ├── api.ts              # Rotas da API
│   │   ├── translation.ts      # Rotas de tradução
│   │   ├── video.ts            # Rotas de vídeo
│   │   └── index.ts            # Router principal
│   ├── 🏷️ types/               # Tipos TypeScript
│   ├── 🔧 utils/               # Utilitários
│   │   ├── config.ts           # Configurações
│   │   ├── groq.ts             # Cliente Groq
│   │   ├── jobManager.ts       # Gerenciador de jobs
│   │   ├── transcription.ts    # Transcrição de áudio
│   │   └── youtube.ts          # Processamento YouTube
│   └── 🚀 index.ts             # Ponto de entrada
├── 🌐 public/                  # Interface web
├── 📦 uploads/                 # Arquivos temporários
│   ├── videos/                 # Vídeos baixados
│   └── audio/                  # Áudio extraído
├── 🏗️ dist/                   # Código compilado
└── 🧪 tests/                  # Testes automatizados
```

---

## ⚙️ Configuração Avançada

### 🔧 **Variáveis de Ambiente**
```env
# 🌐 Servidor
PORT=3000
NODE_ENV=development

# 📡 API
API_VERSION=v1
CORS_ORIGIN=*

# 🤖 Groq AI
GROQ_API_KEY=your_groq_api_key_here

# 📝 Logs
LOG_LEVEL=info

# 🎬 Processamento
MAX_VIDEO_DURATION=1800  # 30 minutos
MAX_FILE_SIZE=25         # 25MB
CHUNK_DURATION=600       # 10 minutos
```

### 🚀 **Scripts Disponíveis**
```bash
npm run build        # 🏗️ Compilar TypeScript
npm start            # 🚀 Iniciar servidor de produção
npm run dev          # 🔥 Servidor com hot reload
npm run dev:watch    # 👀 Servidor com watch mode
npm run clean        # 🧹 Limpar arquivos compilados
npm run type-check   # 🔍 Verificar tipos TypeScript
```

---

## 🚦 Status do Projeto

<div align="center">

### ✅ **Funcionalidades Implementadas**

| Funcionalidade | Status | Descrição |
|----------------|--------|-----------|
| 🏗️ **Configuração do Servidor** | ✅ **Completo** | Express + TypeScript + Middleware |
| 🤖 **Integração Groq SDK** | ✅ **Completo** | Llama 3, Mixtral, Gemma |
| 🔄 **API de Tradução** | ✅ **Completo** | Tradução de texto com contexto |
| 📝 **Geração de Legendas** | ✅ **Completo** | Legendas com timestamps |
| ✨ **Melhoria de Traduções** | ✅ **Completo** | Aprimoramento contextual |
| 🌐 **Interface Web Moderna** | ✅ **Completo** | UI responsiva e intuitiva |
| 🎬 **Upload de Vídeos** | ✅ **Completo** | Processamento YouTube |
| 🎵 **Transcrição de Áudio** | ✅ **Completo** | Whisper AI + chunking |
| 📊 **Sistema de Jobs** | ✅ **Completo** | Processamento assíncrono |
| 📈 **Monitoramento** | ✅ **Completo** | Logs e estatísticas |

</div>

---

## 🤝 Contribuição

<div align="center">

**Contribuições são sempre bem-vindas!** 🎉

</div>

1. 🍴 **Fork** o projeto
2. 🌿 **Crie** uma branch para sua feature
   ```bash
   git checkout -b feature/MinhaNovaFeature
   ```
3. 💾 **Commit** suas mudanças
   ```bash
   git commit -m 'feat: Adiciona nova funcionalidade incrível'
   ```
4. 📤 **Push** para a branch
   ```bash
   git push origin feature/MinhaNovaFeature
   ```
5. 🔄 **Abra** um Pull Request

### 📋 **Diretrizes de Contribuição**
- Use **Conventional Commits** para mensagens
- Mantenha o **código limpo** e **bem documentado**
- Adicione **testes** para novas funcionalidades
- Siga os **padrões TypeScript** do projeto

---

## 📄 Licença

<div align="center">

Este projeto está licenciado sob a **MIT License**.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

</div>

---

## 🆘 Suporte & Comunidade

<div align="center">

**Precisa de ajuda? Estamos aqui para você!** 💪

</div>

### 📚 **Recursos de Ajuda**
1. 📖 **[Documentação Completa](docs/)** - Guias detalhados
2. 🐛 **[Issues Existentes](../../issues)** - Problemas conhecidos
3. ❓ **[Nova Issue](../../issues/new)** - Reporte bugs ou solicite features
4. 💬 **[Discussões](../../discussions)** - Tire dúvidas com a comunidade

### 🔧 **Solução de Problemas Comuns**

<details>
<summary><b>❌ Erro de API Key do Groq</b></summary>

```bash
# Verifique se a chave está configurada
echo $GROQ_API_KEY

# Configure no .env
GROQ_API_KEY=your_actual_key_here
```
</details>

<details>
<summary><b>🎵 Erro no processamento de áudio</b></summary>

```bash
# Instale FFmpeg no sistema
# Ubuntu/Debian
sudo apt install ffmpeg

# macOS
brew install ffmpeg

# Windows
# Baixe de https://ffmpeg.org/download.html
```
</details>

---

## 🙏 Agradecimentos

<div align="center">

**Este projeto não seria possível sem essas tecnologias incríveis:**

[![Groq](https://img.shields.io/badge/Groq-FF6B35?style=for-the-badge&logoColor=white)](https://groq.com/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)

**Agradecimentos especiais para:**
- 🤖 **[Groq](https://groq.com/)** - Pela API de IA ultrarrápida
- 🎵 **[OpenAI Whisper](https://openai.com/whisper)** - Pela transcrição de áudio
- 🦙 **[Meta Llama](https://llama.meta.com/)** - Pelos modelos de linguagem
- 🌐 **[Express.js](https://expressjs.com/)** - Pelo framework web robusto
- 📘 **[TypeScript](https://www.typescriptlang.org/)** - Pela tipagem estática

</div>

---

<div align="center">

**⭐ Se este projeto te ajudou, considere dar uma estrela!**

[![GitHub stars](https://img.shields.io/github/stars/GMBuzatto/YouTranslate?style=social)](https://github.com/GMBuzatto/YouTranslate/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/GMBuzatto/YouTranslate?style=social)](https://github.com/GMBuzatto/YouTranslate/network/members)

**Feito com ❤️ por [GMBuzatto](https://github.com/GMBuzatto)**

</div>
