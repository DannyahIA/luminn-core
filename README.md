### Aura Project

---

# Aura Core
Aura is a modular personal automation hub designed to centralize and manage data, orchestrating intelligent workflows across various services. Built on a hexagonal architecture with lightweight microservices, the Core acts as the central brain, ensuring business logic remains independent of external integrations. It provides a robust, scalable, and secure foundation for all personal automation needs, accessible via web panels, mobile apps, and voice assistants like Alexa.

## 🏗️ Architecture

This project follows **hexagonal architecture** (ports & adapters) with the following layers:

- **Domain**: Pure business entities and rules
- **Application**: Use cases that orchestrate the flow
- **Infrastructure**: Concrete implementations (repositories, executors)
- **Interfaces**: GraphQL resolvers and controllers

## 🚀 Quick Start

### Prerequisites

- Go 1.22+
- Git
- Docker (optional, for development with external services)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/DannyahIA/aura-core.git
cd aura-core
```

2. Initialize Go module and install dependencies:
```bash
go mod tidy
```

3. Generate GraphQL code:
```bash
go run github.com/99designs/gqlgen@latest generate
```

4. Run the application:

**Linux/macOS:**
```bash
go run cmd/hub-core/main.go
```

**Windows (PowerShell):**
```powershell
go run cmd/hub-core/main.go
# Or use the helper script:
.\dev.ps1 run
```

5. Access the GraphQL Playground:
```
http://localhost:8080
```

### Windows Helper Scripts

For Windows users, PowerShell scripts are included to facilitate development:

**Development script (`dev.ps1`):**
```powershell
# Build application
.\dev.ps1 build

# Run application
.\dev.ps1 run

# Run tests
.\dev.ps1 test

# Start Docker services
.\dev.ps1 docker-up

# Stop Docker services
.\dev.ps1 docker-down

# Clean artifacts
.\dev.ps1 clean

# Download dependencies
.\dev.ps1 deps

# Generate GraphQL code
.\dev.ps1 gen

# Show help
.\dev.ps1 help
```

**API example script (`examples/api_usage_example.ps1`):**
```powershell
# Run basic examples
.\examples\api_usage_example.ps1

# Run with detailed output
.\examples\api_usage_example.ps1 -Verbose

# Use different URL
.\examples\api_usage_example.ps1 -ApiUrl "http://localhost:9000/query"
```

## 📁 Project Structure

```
automation-hub-core/
├── cmd/
│   └── hub-core/
│       └── main.go                 # Entry point
├── internal/
│   ├── domain/                     # Entities and interfaces
│   │   ├── task.go
│   │   ├── workflow.go
│   │   └── interfaces.go
│   ├── application/                # Use cases
│   │   ├── task_service.go
│   │   └── workflow_service.go
│   ├── infrastructure/             # Concrete implementations
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

# Database (for future implementations)
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

### config.yaml file (optional)

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

### Available Queries

```graphql
# Get all tasks
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

# Get a specific task
query {
  task(id: "task-id") {
    id
    name
    status
  }
}

# Get all workflows
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

### Available Mutations

```graphql
# Create a task
mutation {
  createTask(input: {
    name: "My Task"
    description: "Task description"
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

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Next Steps

- [ ] Implement database persistence (PostgreSQL/MongoDB)
- [ ] Add authentication and authorization
- [ ] Implement plugin system for different automation types
- [ ] Add unit and integration tests
- [ ] Implement real-time subscriptions
- [ ] Add metrics and observability
- [ ] Create web/admin interface
- [ ] Document complementary REST APIs

## 📄 License

This project is under the MIT license. See the `LICENSE` file for more details.
