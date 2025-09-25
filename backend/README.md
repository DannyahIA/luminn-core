# Backend - Automation Hub 🚀

Backend GraphQL moderno em **Node.js/TypeScript** para o Automation Hub, substituindo a implementação em Go para melhor produtividade e integração com o ecossistema.

## 🛠️ Stack Tecnológica

- **Node.js** + **TypeScript** - Runtime e tipagem
- **Apollo Server** - GraphQL server
- **Type-GraphQL** - Schema-first GraphQL com decorators  
- **Prisma** - ORM type-safe
- **PostgreSQL** - Banco de dados
- **Express** - Framework web
- **JWT** - Autenticação
- **bcrypt** - Hash de senhas

## 🚀 Quick Start

### 1. Instalar Dependências
```powershell
.\backend-manager.ps1 -Action install
```

### 2. Configurar Banco de Dados
```powershell
# Iniciar PostgreSQL (se ainda não estiver rodando)
.\db-manager.ps1 -Action setup

# Fazer push do schema
.\backend-manager.ps1 -Action migrate
```

### 3. Iniciar Desenvolvimento
```powershell
.\backend-manager.ps1 -Action dev
```

Acesse:
- **GraphQL Playground**: http://localhost:4000/graphql
- **Health Check**: http://localhost:4000/health

## 📋 Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `install` | Instalar dependências |
| `dev` | Servidor de desenvolvimento |
| `build` | Build para produção |
| `start` | Iniciar servidor produção |
| `test` | Executar testes |
| `lint` | Executar ESLint |
| `studio` | Abrir Prisma Studio |
| `migrate` | Executar migrações |
| `docker-build` | Build imagem Docker |
| `docker-run` | Executar container |

## 🗂️ Estrutura do Projeto

```
backend/
├── src/
│   ├── index.ts              # Entry point
│   ├── db/
│   │   └── prisma.ts         # Database client
│   ├── resolvers/            # GraphQL resolvers
│   │   ├── AuthResolver.ts   # Autenticação
│   │   ├── UserResolver.ts   # Usuários
│   │   ├── BankResolver.ts   # Bancos
│   │   └── TransactionResolver.ts # Transações
│   └── types/
│       └── context.ts        # GraphQL context
├── dist/                     # Build output
├── package.json             # Dependencies & scripts
├── tsconfig.json            # TypeScript config
├── Dockerfile              # Container config
└── .env                    # Environment variables
```

## 🔧 Configuração

### Environment Variables (`.env`)
```env
# Server
PORT=4000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://bankhub_user:bankhub_secure_password_2024@localhost:5432/bankhub"

# Auth
JWT_SECRET="your-super-secret-jwt-key"

# CORS
FRONTEND_URL="http://localhost:3000"
```

## 📊 GraphQL Schema

### 🔐 Autenticação
```graphql
# Registro
mutation Register {
  register(
    name: "João Silva"
    email: "joao@email.com"
    password: "123456"
    phoneNumber: "+5511999999999"
  ) {
    accessToken
    user {
      id
      name
      email
    }
  }
}

# Login
mutation Login {
  login(email: "joao@email.com", password: "123456") {
    accessToken
    user {
      id
      name
      email
    }
  }
}
```

### 👤 Usuários
```graphql
# Listar usuários
query Users {
  users {
    id
    name
    email
    phoneNumber
    createdAt
  }
}

# Buscar usuário
query User {
  user(id: "user-id") {
    id
    name
    email
  }
}
```

### 🏦 Bancos
```graphql
# Bancos do usuário
query BanksByUser {
  banksByUser(userId: "user-id") {
    id
    name
    createdAt
  }
}

# Criar banco
mutation CreateBank {
  createBank(userId: "user-id", name: "Banco do Brasil") {
    id
    name
  }
}
```

### 💰 Transações
```graphql
# Transações do usuário
query TransactionsByUser {
  transactionsByUser(userId: "user-id") {
    id
    type
    amount
    description
    transactionDate
  }
}

# Criar transação
mutation CreateTransaction {
  createTransaction(
    bankId: "bank-id"
    type: "CREDIT"
    amount: 1500.00
    currency: "BRL"
    description: "Salário"
    transactionDate: "2024-08-01T00:00:00Z"
  ) {
    id
    amount
    description
  }
}
```

## 🐳 Docker

### Build e Run
```powershell
# Build da imagem
.\backend-manager.ps1 -Action docker-build

# Executar container
.\backend-manager.ps1 -Action docker-run
```

### Docker Compose
```powershell
# Iniciar todos os serviços (backend + database)
docker-compose up -d

# Logs
docker-compose logs -f backend
```

## 🧪 Testes

```powershell
# Executar todos os testes
.\backend-manager.ps1 -Action test

# Testes em watch mode
cd backend
pnpm test:watch
```

## 🔍 Debugging

### Development
```powershell
# Servidor com hot reload
.\backend-manager.ps1 -Action dev

# Verificar health
curl http://localhost:4000/health
```

### Logs
```bash
# Ver logs do container
docker-compose logs -f backend

# Logs em tempo real
docker logs -f automation_hub_backend
```

## 🚀 Deploy

### Produção Local
```powershell
# Build
.\backend-manager.ps1 -Action build

# Start produção
.\backend-manager.ps1 -Action start
```

### Docker Deploy
```bash
# Build para produção
docker build -t automation-hub-backend .

# Deploy
docker run -d -p 4000:4000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="..." \
  automation-hub-backend
```

## 🔧 Desenvolvimento

### Adicionar Nova Funcionalidade

1. **Criar Resolver**:
```typescript
// src/resolvers/NewResolver.ts
@Resolver()
export class NewResolver {
  @Query(() => String)
  hello(): string {
    return "Hello World!"
  }
}
```

2. **Registrar no Schema**:
```typescript
// src/index.ts
const schema = await buildSchema({
  resolvers: [
    // ... outros resolvers
    NewResolver
  ]
})
```

3. **Testar**:
```powershell
.\backend-manager.ps1 -Action dev
# Acesse http://localhost:4000/graphql
```

## 🔒 Segurança

- **JWT** para autenticação
- **bcrypt** para hash de senhas
- **CORS** configurado
- **Environment variables** para secrets
- **Validação** de entrada com class-validator

## 📚 Recursos

- [Apollo Server Docs](https://www.apollographql.com/docs/apollo-server/)
- [Type-GraphQL Docs](https://typegraphql.com/)
- [Prisma Docs](https://www.prisma.io/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Backend moderno e produtivo para Automation Hub!** ⚡
