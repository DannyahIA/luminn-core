# Automation Hub Core

O núcleo do Automation Hub, responsável por orquestrar automações e integrações usando arquitetura hexagonal e GraphQL.

## 🏗️ Arquitetura

Este projeto segue a **arquitetura hexagonal** (ports & adapters) com as seguintes camadas:

- **Domain**: Entidades e regras de negócio puras
- **Application**: Casos de uso que orquestram o fluxo
- **Infrastructure**: Implementações concretas (repositórios, executores)
- **Interfaces**: Resolvers GraphQL e controladores

## 🚀 Início Rápido

### Pré-requisitos

- Go 1.22+
- Git
- Docker (opcional, para desenvolvimento com serviços externos)

### Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd automation-hub
```

2. Inicialize o módulo Go e instale dependências:
```bash
go mod init automation-hub
go mod tidy
```

3. Gere o código GraphQL:
```bash
go run github.com/99designs/gqlgen@latest generate
```

4. Execute a aplicação:

**Linux/macOS:**
```bash
go run cmd/hub-core/main.go
```

**Windows (PowerShell):**
```powershell
go run cmd/hub-core/main.go
# Ou use o script helper:
.\dev.ps1 run
```

5. Acesse o GraphQL Playground:
```
http://localhost:8080
```

### Scripts Helper para Windows

Para usuários Windows, foram incluídos scripts PowerShell para facilitar o desenvolvimento:

**Script de desenvolvimento (`dev.ps1`):**
```powershell
# Compilar aplicação
.\dev.ps1 build

# Executar aplicação
.\dev.ps1 run

# Executar testes
.\dev.ps1 test

# Iniciar serviços Docker
.\dev.ps1 docker-up

# Parar serviços Docker
.\dev.ps1 docker-down

# Limpar artefatos
.\dev.ps1 clean

# Baixar dependências
.\dev.ps1 deps

# Gerar código GraphQL
.\dev.ps1 gen

# Ver ajuda
.\dev.ps1 help
```

**Script de exemplo da API (`examples/api_usage_example.ps1`):**
```powershell
# Executar exemplos básicos
.\examples\api_usage_example.ps1

# Executar com saída detalhada
.\examples\api_usage_example.ps1 -Verbose

# Usar URL diferente
.\examples\api_usage_example.ps1 -ApiUrl "http://localhost:9000/query"
```

## 📁 Estrutura do Projeto

```
automation-hub/
├── cmd/
│   └── hub-core/
│       └── main.go                 # Ponto de entrada
├── internal/
│   ├── domain/                     # Entidades e interfaces
│   │   ├── task.go
│   │   ├── workflow.go
│   │   └── interfaces.go
│   ├── application/                # Casos de uso
│   │   ├── task_service.go
│   │   └── workflow_service.go
│   ├── infrastructure/             # Implementações concretas
│   │   ├── task_repository.go
│   │   ├── workflow_repository.go
│   │   ├── executors.go
│   │   └── services.go
│   ├── interfaces/                 # Resolvers GraphQL
│   └── config/                     # Configuração
│       └── config.go
├── graph/                          # Schema e código GraphQL
│   ├── schema.graphqls
│   ├── generated.go                # (gerado)
│   └── resolver.go                 # (gerado)
├── go.mod
├── go.sum
└── gqlgen.yml                      # Configuração do gqlgen
```

## 🔧 Configuração

A aplicação pode ser configurada através de variáveis de ambiente ou arquivo `config.yaml`:

### Variáveis de Ambiente

```bash
# Servidor
SERVER_HOST=localhost
SERVER_PORT=8080
SERVER_READ_TIMEOUT=30
SERVER_WRITE_TIMEOUT=30

# Database (para futuras implementações)
DATABASE_TYPE=memory
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=automation_hub
DATABASE_USER=postgres
DATABASE_PASSWORD=

# Logging
LOGGING_LEVEL=info
LOGGING_FORMAT=json
```

### Arquivo config.yaml (opcional)

```yaml
server:
  host: localhost
  port: 8080
  read_timeout: 30
  write_timeout: 30

database:
  type: memory
  host: localhost
  port: 5432
  name: automation_hub
  user: postgres
  password: ""
  ssl_mode: disable

logging:
  level: info
  format: json
```

## 📊 API GraphQL

### Queries Disponíveis

```graphql
# Buscar todas as tasks
query {
  tasks {
    id
    name
    description
    status
    createdAt
    parameters {
      key
      value
      type
    }
  }
}

# Buscar uma task específica
query {
  task(id: "task-id") {
    id
    name
    status
  }
}

# Buscar todos os workflows
query {
  workflows {
    id
    name
    description
    status
    tasks {
      id
      name
    }
  }
}
```

### Mutations Disponíveis

```graphql
# Criar uma task
mutation {
  createTask(input: {
    name: "Minha Task"
    description: "Descrição da task"
    parameters: [
      {
        key: "param1"
        value: "value1"
        type: STRING
      }
    ]
  }) {
    id
    name
    status
  }
}

# Executar uma task
mutation {
  executeTask(id: "task-id") {
    id
    status
    executedAt
  }
}

# Criar um workflow
mutation {
  createWorkflow(input: {
    name: "Meu Workflow"
    description: "Descrição do workflow"
    taskIds: ["task-id-1", "task-id-2"]
  }) {
    id
    name
    status
  }
}
```

## 🧪 Testes

Para executar os testes:

```bash
go test ./...
```

Para executar com coverage:

```bash
go test -cover ./...
```

## 📦 Build

Para buildar a aplicação:

```bash
go build -o bin/hub-core cmd/hub-core/main.go
```

**Windows (PowerShell):**
```powershell
go build -o bin/hub-core.exe cmd/hub-core/main.go
# Ou usando o script helper:
.\dev.ps1 build
```

Para buildar para diferentes plataformas:

**Linux/macOS:**
```bash
# Linux
GOOS=linux GOARCH=amd64 go build -o bin/hub-core-linux cmd/hub-core/main.go

# Windows
GOOS=windows GOARCH=amd64 go build -o bin/hub-core-windows.exe cmd/hub-core/main.go

# macOS
GOOS=darwin GOARCH=amd64 go build -o bin/hub-core-darwin cmd/hub-core/main.go
```

**Windows (PowerShell):**
```powershell
# Para Linux
$env:GOOS="linux"; $env:GOARCH="amd64"; go build -o bin/hub-core-linux cmd/hub-core/main.go

# Para macOS
$env:GOOS="darwin"; $env:GOARCH="amd64"; go build -o bin/hub-core-darwin cmd/hub-core/main.go

# Reset para Windows
$env:GOOS="windows"; $env:GOARCH="amd64"; go build -o bin/hub-core.exe cmd/hub-core/main.go
```

## 🐳 Docker

Dockerfile exemplo:

```dockerfile
FROM golang:1.22-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o hub-core cmd/hub-core/main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/

COPY --from=builder /app/hub-core .

EXPOSE 8080
CMD ["./hub-core"]
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Próximos Passos

- [ ] Implementar persistência em banco de dados (PostgreSQL/MongoDB)
- [ ] Adicionar autenticação e autorização
- [ ] Implementar sistema de plugins para diferentes tipos de automação
- [ ] Adicionar testes unitários e de integração
- [ ] Implementar subscriptions em tempo real
- [ ] Adicionar métricas e observabilidade
- [ ] Criar interface web/admin
- [ ] Documentar APIs REST complementares

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
