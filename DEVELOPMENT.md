# 🛠️ Guia de Desenvolvimento - YouTranslate

Este documento contém informações detalhadas para desenvolvedores que desejam contribuir ou entender melhor a estrutura do projeto.

## 📋 Pré-requisitos

- **Node.js** >= 16.0.0
- **npm** >= 8.0.0
- **TypeScript** conhecimento básico

## 🏗️ Arquitetura do Projeto

### Estrutura de Pastas

```
src/
├── controllers/    # Lógica de negócio
├── middleware/     # Middlewares customizados
├── routes/         # Definição de rotas
├── types/          # Tipos TypeScript
├── utils/          # Utilitários
└── index.ts        # Ponto de entrada
```

### Padrões de Código

#### 1. Controllers
```typescript
import { Request, Response } from 'express';
import { ResponseType } from '@/types';

export const controllerName = (req: Request, res: Response<ResponseType>): void => {
    // Lógica do controller
    res.json({ /* resposta tipada */ });
};
```

#### 2. Types
```typescript
// Sempre exporte interfaces para reutilização
export interface ApiResponse {
    status: string;
    data?: any;
    error?: string;
}
```

#### 3. Routes
```typescript
import { Router } from 'express';
import { controllerName } from '@/controllers/controllerFile';

const router = Router();
router.get('/endpoint', controllerName);
export default router;
```

## 🔧 Scripts de Desenvolvimento

### Comandos Principais

```bash
# Desenvolvimento
npm run dev              # Executa com ts-node
npm run dev:watch        # Executa com auto-reload

# Build
npm run build           # Compila TypeScript
npm run clean          # Remove pasta dist
npm run type-check     # Verifica tipos

# Produção
npm start              # Executa código compilado
```

### Workflow Recomendado

1. **Desenvolvimento**: Use `npm run dev:watch`
2. **Teste de Build**: Use `npm run build`
3. **Verificação de Tipos**: Use `npm run type-check`
4. **Produção**: Use `npm run build && npm start`

## 📝 Convenções de Código

### Nomenclatura

- **Arquivos**: camelCase (ex: `userController.ts`)
- **Interfaces**: PascalCase (ex: `UserResponse`)
- **Funções**: camelCase (ex: `getUserData`)
- **Constantes**: UPPER_SNAKE_CASE (ex: `API_VERSION`)

### Imports

Use sempre path mapping:

```typescript
// ✅ Correto
import { UserType } from '@/types';
import { getConfig } from '@/utils/config';

// ❌ Evite
import { UserType } from '../types';
import { getConfig } from '../utils/config';
```

### Tipagem

- Sempre tipifique parâmetros e retornos
- Use interfaces para objetos complexos
- Prefira `interface` sobre `type` para objetos
- Use `type` para unions e primitivos

```typescript
// ✅ Bom
interface User {
    id: string;
    name: string;
    email: string;
}

type Status = 'active' | 'inactive';

// ✅ Controller tipado
export const getUser = (req: Request, res: Response<User>): void => {
    // implementação
};
```

## 🔍 Debugging

### VS Code

Configuração recomendada para `.vscode/launch.json`:

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Debug TypeScript",
            "type": "node",
            "request": "launch",
            "program": "${workspaceFolder}/src/index.ts",
            "runtimeArgs": ["-r", "ts-node/register", "-r", "tsconfig-paths/register"],
            "env": {
                "NODE_ENV": "development"
            },
            "sourceMaps": true,
            "restart": true,
            "protocol": "inspector"
        }
    ]
}
```

### Logs

Use o sistema de logs configurado:

```typescript
console.log('Info message');
console.error('Error message');
console.warn('Warning message');
```

## 🧪 Testes (Futuro)

### Estrutura Planejada

```
tests/
├── unit/           # Testes unitários
├── integration/    # Testes de integração
├── e2e/           # Testes end-to-end
└── fixtures/      # Dados de teste
```

### Ferramentas Recomendadas

- **Jest** - Framework de testes
- **Supertest** - Testes de API
- **@types/jest** - Tipos para Jest

## 📦 Adicionando Novas Features

### 1. Criar Controller

```typescript
// src/controllers/newFeatureController.ts
import { Request, Response } from 'express';
import { NewFeatureResponse } from '@/types';

export const handleNewFeature = (req: Request, res: Response<NewFeatureResponse>): void => {
    // Implementação
};
```

### 2. Definir Tipos

```typescript
// src/types/index.ts
export interface NewFeatureResponse {
    success: boolean;
    data: any;
}
```

### 3. Criar Rotas

```typescript
// src/routes/newFeature.ts
import { Router } from 'express';
import { handleNewFeature } from '@/controllers/newFeatureController';

const router = Router();
router.post('/new-feature', handleNewFeature);
export default router;
```

### 4. Registrar Rotas

```typescript
// src/routes/index.ts
import newFeatureRoutes from './newFeature';

// ...
router.use('/api/v1', newFeatureRoutes);
```

## 🔒 Segurança

### Headers de Segurança

O projeto usa Helmet.js para headers de segurança automáticos.

### CORS

Configurado para aceitar apenas origens específicas:

```typescript
app.use(cors({
    origin: config.corsOrigin,
    credentials: true
}));
```

### Validação de Entrada

**TODO**: Implementar validação com Zod:

```typescript
import { z } from 'zod';

const UserSchema = z.object({
    name: z.string().min(1),
    email: z.string().email()
});
```

## 🚀 Deploy

### Build para Produção

```bash
npm run build
```

### Variáveis de Ambiente

Certifique-se de configurar:

```env
NODE_ENV=production
PORT=3000
API_VERSION=v1
CORS_ORIGIN=https://yourdomain.com
```

### Docker (Futuro)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
```

## 📚 Recursos Úteis

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature
3. Siga as convenções de código
4. Adicione testes (quando disponível)
5. Faça commit das mudanças
6. Abra um Pull Request

---

💡 **Dica**: Mantenha este documento atualizado conforme o projeto evolui! 