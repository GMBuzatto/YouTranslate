# 🎬 YouTranslate

Tradutor automático de vídeos: adicione legendas em português ao áudio em inglês sem esforço.

## 🚀 Funcionalidades

- **🎯 Tradução Automática**: Tradução de texto usando IA avançada (Groq)
- **📝 Geração de Legendas**: Criação automática de legendas com timestamps
- **🔧 Melhoria de Tradução**: Aprimoramento de traduções existentes
- **🌍 Multilíngue**: Suporte para múltiplos idiomas
- **⚡ Alta Performance**: Processamento rápido com modelos Groq
- **🛡️ Seguro**: Middleware de segurança integrado

## 🛠️ Tecnologias

- **Backend**: Node.js + TypeScript + Express.js
- **IA**: Groq SDK (Llama 3, Mixtral, Gemma)
- **Segurança**: Helmet, CORS
- **Desenvolvimento**: Nodemon, ts-node
- **Qualidade**: ESLint, TypeScript strict mode

## 📦 Instalação

1. **Clone o repositório**:
```bash
git clone <repository-url>
cd YouTranslate
```

2. **Instale as dependências**:
```bash
npm install
```

3. **Configure as variáveis de ambiente**:
```bash
cp .env.example .env
```

4. **Configure sua chave da API do Groq**:
   - Acesse [Groq Console](https://console.groq.com/)
   - Crie uma conta e obtenha sua API key
   - Adicione no arquivo `.env`:
```env
GROQ_API_KEY=your_actual_groq_api_key_here
```

## 🚀 Uso

### Desenvolvimento
```bash
npm run dev          # Servidor com hot reload
npm run dev:watch    # Servidor com watch mode
```

### Produção
```bash
npm run build        # Compilar TypeScript
npm start           # Iniciar servidor
```

### Outros comandos
```bash
npm run clean        # Limpar arquivos compilados
npm run type-check   # Verificar tipos TypeScript
```

## 📡 API Endpoints

### Informações Gerais
- `GET /` - Página inicial
- `GET /health` - Status do servidor
- `GET /api/v1/status` - Status da API

### Tradução
- `POST /api/v1/translate` - Traduzir texto
- `POST /api/v1/subtitles` - Gerar legendas
- `POST /api/v1/improve` - Melhorar tradução
- `GET /api/v1/languages` - Idiomas suportados
- `GET /api/v1/models` - Modelos disponíveis

### Exemplos de Uso

#### Traduzir Texto
```bash
curl -X POST http://localhost:3000/api/v1/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, how are you?",
    "sourceLanguage": "en",
    "targetLanguage": "pt"
  }'
```

#### Gerar Legendas
```bash
curl -X POST http://localhost:3000/api/v1/subtitles \
  -H "Content-Type: application/json" \
  -d '{
    "transcription": "Hello everyone, welcome to this video...",
    "videoDuration": 120
  }'
```

#### Melhorar Tradução
```bash
curl -X POST http://localhost:3000/api/v1/improve \
  -H "Content-Type: application/json" \
  -d '{
    "originalText": "Hello, how are you?",
    "currentTranslation": "Olá, como você está?",
    "context": "casual conversation"
  }'
```

## 🤖 Modelos Groq Disponíveis

- **Llama 3 8B**: Modelo rápido para tradução geral
- **Llama 3 70B**: Modelo avançado para alta qualidade
- **Mixtral 8x7B**: Modelo versátil com contexto longo
- **Gemma 7B IT**: Modelo otimizado para instruções

## 🌍 Idiomas Suportados

- 🇺🇸 Inglês (en)
- 🇧🇷 Português (pt)
- 🇪🇸 Espanhol (es)
- 🇫🇷 Francês (fr)
- 🇩🇪 Alemão (de)
- 🇮🇹 Italiano (it)
- 🇯🇵 Japonês (ja)
- 🇰🇷 Coreano (ko)
- 🇨🇳 Chinês (zh)

## 📁 Estrutura do Projeto

```
YouTranslate/
├── src/
│   ├── controllers/     # Controladores da API
│   ├── middleware/      # Middlewares personalizados
│   ├── routes/         # Definição de rotas
│   ├── types/          # Tipos TypeScript
│   ├── utils/          # Utilitários e configurações
│   └── index.ts        # Ponto de entrada
├── public/             # Arquivos estáticos
├── dist/              # Arquivos compilados
├── tests/             # Testes (futuro)
└── docs/              # Documentação
```

## 🔧 Configuração

### Variáveis de Ambiente

```env
# Servidor
PORT=3000
NODE_ENV=development

# API
API_VERSION=v1
CORS_ORIGIN=*

# Groq
GROQ_API_KEY=your_groq_api_key_here

# Logs
LOG_LEVEL=info
```

## 🚦 Status do Projeto

- ✅ Configuração básica do servidor
- ✅ Integração com Groq SDK
- ✅ API de tradução de texto
- ✅ Geração de legendas
- ✅ Melhoria de traduções
- ✅ Interface web moderna
- 🔄 Upload de vídeos (em desenvolvimento)
- 🔄 Transcrição de áudio (planejado)
- 🔄 Banco de dados (planejado)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

Se você encontrar algum problema ou tiver dúvidas:

1. Verifique a [documentação](docs/)
2. Procure em [Issues existentes](../../issues)
3. Crie uma [Nova Issue](../../issues/new)

## 🙏 Agradecimentos

- [Groq](https://groq.com/) pela API de IA rápida
- [Express.js](https://expressjs.com/) pelo framework web
- [TypeScript](https://www.typescriptlang.org/) pela tipagem estática
