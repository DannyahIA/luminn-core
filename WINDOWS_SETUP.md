# Automation Hub Core - Windows Setup Guide

Este guia é específico para usuários Windows que querem executar o Automation Hub Core.

## 🚀 Configuração Rápida

### 1. Pré-requisitos
- [Go 1.22+](https://golang.org/dl/) 
- [Git](https://git-scm.com/downloads)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (opcional)
- Windows PowerShell 5.1+ (já incluído no Windows)

### 2. Verificar Instalação
```powershell
# Verificar Go
go version

# Verificar Git
git --version

# Verificar Docker (opcional)
docker --version
```

### 3. Clonar e Configurar
```powershell
# Clonar repositório
git clone <repository-url>
cd automation-hub

# Instalar dependências
go mod tidy

# Gerar código GraphQL
go run github.com/99designs/gqlgen@latest generate
```

### 4. Executar Aplicação
```powershell
# Método 1: Comando direto
go run cmd/hub-core/main.go

# Método 2: Script helper
.\dev.ps1 run

# Método 3: Com live reload (instalar air primeiro)
go install github.com/cosmtrek/air@latest
.\dev.ps1 run -Watch
```

### 5. Testar API
```powershell
# Executar exemplos
.\examples\api_usage_example.ps1

# Com output detalhado
.\examples\api_usage_example.ps1 -Verbose
```

## 🛠️ Scripts Helper

### Script de Desenvolvimento (`dev.ps1`)

| Comando | Descrição |
|---------|-----------|
| `.\dev.ps1 build` | Compila a aplicação |
| `.\dev.ps1 run` | Executa a aplicação |
| `.\dev.ps1 run -Watch` | Executa com live reload |
| `.\dev.ps1 test` | Executa testes |
| `.\dev.ps1 test -Verbose` | Executa testes com output detalhado |
| `.\dev.ps1 docker-up` | Inicia serviços Docker |
| `.\dev.ps1 docker-down` | Para serviços Docker |
| `.\dev.ps1 clean` | Limpa artefatos de build |
| `.\dev.ps1 deps` | Baixa e organiza dependências |
| `.\dev.ps1 gen` | Gera código GraphQL |
| `.\dev.ps1 help` | Mostra ajuda |

### Script de Exemplos (`examples/api_usage_example.ps1`)

```powershell
# Uso básico
.\examples\api_usage_example.ps1

# Com output detalhado
.\examples\api_usage_example.ps1 -Verbose

# URL customizada
.\examples\api_usage_example.ps1 -ApiUrl "http://localhost:9000/query"
```

## 🐳 Docker no Windows

### Iniciar com Docker Compose
```powershell
# Iniciar todos os serviços
.\dev.ps1 docker-up

# Ou manualmente
docker-compose up -d
```

### Verificar Serviços
```powershell
# Ver containers rodando
docker ps

# Ver logs
docker-compose logs hub-core

# Parar serviços
.\dev.ps1 docker-down
```

## 📊 Monitoramento

Após iniciar com Docker Compose:

- **API GraphQL**: http://localhost:8080
- **Grafana**: http://localhost:3000 (admin/admin)
- **Prometheus**: http://localhost:9090

## 🔧 Configuração Windows

### Variáveis de Ambiente (PowerShell)
```powershell
# Definir variáveis temporárias
$env:SERVER_PORT="9000"
$env:LOG_LEVEL="debug"

# Executar aplicação
go run cmd/hub-core/main.go

# Ou criar arquivo .env
@"
SERVER_PORT=9000
LOG_LEVEL=debug
"@ | Out-File -FilePath .env -Encoding utf8
```

### Build Cross-Platform
```powershell
# Para Linux
$env:GOOS="linux"; $env:GOARCH="amd64"
go build -o bin/hub-core-linux cmd/hub-core/main.go

# Para macOS
$env:GOOS="darwin"; $env:GOARCH="amd64"
go build -o bin/hub-core-darwin cmd/hub-core/main.go

# Reset para Windows
$env:GOOS="windows"; $env:GOARCH="amd64"
go build -o bin/hub-core.exe cmd/hub-core/main.go
```

## ⚡ Live Reload

Para desenvolvimento com recarga automática:

```powershell
# Instalar Air
go install github.com/cosmtrek/air@latest

# Executar com live reload
air

# Ou usar o script helper
.\dev.ps1 run -Watch
```

## 🧪 Testes

```powershell
# Executar todos os testes
.\dev.ps1 test

# Testes com cobertura
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out

# Testes de integração apenas
go test ./tests/integration/...
```

## 🔍 Troubleshooting

### Problemas Comuns

1. **Erro "go: command not found"**
   - Instalar Go e adicionar ao PATH
   - Reiniciar PowerShell

2. **Erro de módulo**
   ```powershell
   go clean -modcache
   go mod tidy
   ```

3. **Porta em uso**
   ```powershell
   # Verificar quem está usando a porta
   netstat -ano | findstr :8080
   
   # Matar processo
   taskkill /PID <PID> /F
   ```

4. **Docker não conecta**
   - Verificar se Docker Desktop está rodando
   - Verificar se WSL2 está configurado

### Performance

Para melhor performance no Windows:

1. **Usar SSD** para o código
2. **Excluir pasta do projeto** do Windows Defender
3. **Usar WSL2** para desenvolvimento (opcional)

## 📝 Próximos Passos

1. Explore o GraphQL Playground em http://localhost:8080
2. Execute os exemplos em `examples/api_usage_example.ps1`
3. Verifique os testes com `.\dev.ps1 test`
4. Configure monitoramento com `.\dev.ps1 docker-up`
5. Desenvolva com live reload usando `.\dev.ps1 run -Watch`
