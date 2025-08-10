# Automation Hub Core Makefile

.PHONY: help build run test clean generate deps docker

# Default target
help:
	@echo "Available commands:"
	@echo "  build     - Build the application"
	@echo "  run       - Run the application"
	@echo "  test      - Run tests"
	@echo "  clean     - Clean build artifacts"
	@echo "  generate  - Generate GraphQL code"
	@echo "  deps      - Install dependencies"
	@echo "  docker    - Build Docker image"
	@echo "  help      - Show this help message"

# Build the application
build:
	go build -o bin/hub-core cmd/hub-core/main.go

# Run the application
run:
	go run cmd/hub-core/main.go

# Run tests
test:
	go test -v ./...

# Run tests with coverage
test-coverage:
	go test -v -cover ./...

# Clean build artifacts
clean:
	rm -rf bin/
	rm -f graph/generated.go
	rm -f graph/model/models_gen.go

# Generate GraphQL code
generate:
	go run github.com/99designs/gqlgen@latest generate

# Install dependencies
deps:
	go mod download
	go mod tidy

# Build for multiple platforms
build-all:
	GOOS=linux GOARCH=amd64 go build -o bin/hub-core-linux cmd/hub-core/main.go
	GOOS=windows GOARCH=amd64 go build -o bin/hub-core-windows.exe cmd/hub-core/main.go
	GOOS=darwin GOARCH=amd64 go build -o bin/hub-core-darwin cmd/hub-core/main.go

# Docker build
docker:
	docker build -t automation-hub-core .

# Run with hot reload (requires air)
dev:
	air

# Format code
fmt:
	go fmt ./...

# Lint code
lint:
	golangci-lint run

# Install development tools
install-tools:
	go install github.com/cosmtrek/air@latest
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
