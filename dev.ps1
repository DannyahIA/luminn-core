# Automation Hub Development Helper Script
# This script provides common development operations for Windows users

param(
    [Parameter(Position=0)]
    [ValidateSet("build", "run", "test", "docker-up", "docker-down", "clean", "deps", "gen", "help")]
    [string]$Command = "help",
    
    [switch]$Verbose,
    [switch]$Watch
)

# Configuration
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$BinaryName = "hub-core.exe"
$BinaryPath = Join-Path $ProjectRoot "bin\$BinaryName"

# Function to write colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Step {
    param([string]$Message)
    Write-Host "[STEP] $Message" -ForegroundColor Blue
}

# Function to check if command exists
function Test-Command {
    param([string]$CommandName)
    return (Get-Command $CommandName -ErrorAction SilentlyContinue) -ne $null
}

# Function to run command with error handling
function Invoke-SafeCommand {
    param(
        [string]$Command,
        [string]$WorkingDirectory = $ProjectRoot,
        [string]$SuccessMessage = "Command completed successfully",
        [string]$ErrorMessage = "Command failed"
    )
    
    if ($Verbose) {
        Write-Host "Executing: $Command" -ForegroundColor Gray
    }
    
    Push-Location $WorkingDirectory
    try {
        Invoke-Expression $Command
        if ($LASTEXITCODE -eq 0) {
            Write-Status $SuccessMessage
            return $true
        } else {
            Write-Error "$ErrorMessage (Exit code: $LASTEXITCODE)"
            return $false
        }
    }
    catch {
        Write-Error "$ErrorMessage - $($_.Exception.Message)"
        return $false
    }
    finally {
        Pop-Location
    }
}

# Check prerequisites
function Test-Prerequisites {
    $missing = @()
    
    if (-not (Test-Command "go")) {
        $missing += "Go (https://golang.org/dl/)"
    }
    
    if (-not (Test-Command "docker")) {
        $missing += "Docker (https://www.docker.com/products/docker-desktop)"
    }
    
    if ($missing.Count -gt 0) {
        Write-Warning "Missing prerequisites:"
        $missing | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
        return $false
    }
    
    return $true
}

# Build the application
function Build-Application {
    Write-Step "Building application..."
    
    # Create bin directory if it doesn't exist
    $binDir = Join-Path $ProjectRoot "bin"
    if (-not (Test-Path $binDir)) {
        New-Item -ItemType Directory -Path $binDir -Force | Out-Null
    }
    
    $buildCmd = "go build -o `"$BinaryPath`" .\cmd\hub-core"
    return Invoke-SafeCommand -Command $buildCmd -SuccessMessage "Build completed successfully" -ErrorMessage "Build failed"
}

# Run the application
function Start-Application {
    if ($Watch) {
        Write-Step "Running application in watch mode..."
        if (Test-Command "air") {
            return Invoke-SafeCommand -Command "air" -SuccessMessage "Application started with air" -ErrorMessage "Failed to start with air"
        } else {
            Write-Warning "Air not found. Install with: go install github.com/cosmtrek/air@latest"
            Write-Step "Falling back to regular run..."
        }
    }
    
    Write-Step "Running application..."
    $runCmd = "go run .\cmd\hub-core\main.go"
    return Invoke-SafeCommand -Command $runCmd -SuccessMessage "Application started" -ErrorMessage "Failed to start application"
}

# Run tests
function Invoke-Tests {
    Write-Step "Running tests..."
    
    if ($Verbose) {
        $testCmd = "go test -v ./..."
    } else {
        $testCmd = "go test ./..."
    }
    
    return Invoke-SafeCommand -Command $testCmd -SuccessMessage "All tests passed" -ErrorMessage "Tests failed"
}

# Start Docker services
function Start-DockerServices {
    Write-Step "Starting Docker services..."
    
    if (-not (Test-Path (Join-Path $ProjectRoot "docker-compose.yml"))) {
        Write-Error "docker-compose.yml not found in project root"
        return $false
    }
    
    $dockerCmd = "docker-compose up -d"
    if ($Verbose) {
        $dockerCmd = "docker-compose up"
    }
    
    return Invoke-SafeCommand -Command $dockerCmd -SuccessMessage "Docker services started" -ErrorMessage "Failed to start Docker services"
}

# Stop Docker services
function Stop-DockerServices {
    Write-Step "Stopping Docker services..."
    $dockerCmd = "docker-compose down"
    return Invoke-SafeCommand -Command $dockerCmd -SuccessMessage "Docker services stopped" -ErrorMessage "Failed to stop Docker services"
}

# Clean build artifacts
function Clear-BuildArtifacts {
    Write-Step "Cleaning build artifacts..."
    
    # Remove binary
    if (Test-Path $BinaryPath) {
        Remove-Item $BinaryPath -Force
        Write-Status "Removed $BinaryPath"
    }
    
    # Clean go cache
    return Invoke-SafeCommand -Command "go clean -cache" -SuccessMessage "Build artifacts cleaned" -ErrorMessage "Failed to clean artifacts"
}

# Download dependencies
function Get-Dependencies {
    Write-Step "Downloading dependencies..."
    
    $success = Invoke-SafeCommand -Command "go mod download" -SuccessMessage "Dependencies downloaded" -ErrorMessage "Failed to download dependencies"
    
    if ($success) {
        Write-Step "Tidying dependencies..."
        $success = Invoke-SafeCommand -Command "go mod tidy" -SuccessMessage "Dependencies tidied" -ErrorMessage "Failed to tidy dependencies"
    }
    
    return $success
}

# Generate GraphQL code
function Invoke-CodeGeneration {
    Write-Step "Generating GraphQL code..."
    
    # Check if gqlgen is installed
    if (-not (Test-Command "gqlgen")) {
        Write-Warning "gqlgen not found. Installing..."
        if (-not (Invoke-SafeCommand -Command "go install github.com/99designs/gqlgen@latest" -SuccessMessage "gqlgen installed" -ErrorMessage "Failed to install gqlgen")) {
            return $false
        }
    }
    
    return Invoke-SafeCommand -Command "go run github.com/99designs/gqlgen generate" -SuccessMessage "GraphQL code generated" -ErrorMessage "Failed to generate GraphQL code"
}

# Show help
function Show-Help {
    Write-Host "Automation Hub Development Helper" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\dev.ps1 <command> [options]" -ForegroundColor White
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Yellow
    Write-Host "  build        Build the application" -ForegroundColor Gray
    Write-Host "  run          Run the application" -ForegroundColor Gray
    Write-Host "  test         Run all tests" -ForegroundColor Gray
    Write-Host "  docker-up    Start Docker services" -ForegroundColor Gray
    Write-Host "  docker-down  Stop Docker services" -ForegroundColor Gray
    Write-Host "  clean        Clean build artifacts" -ForegroundColor Gray
    Write-Host "  deps         Download and tidy dependencies" -ForegroundColor Gray
    Write-Host "  gen          Generate GraphQL code" -ForegroundColor Gray
    Write-Host "  help         Show this help message" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  -Verbose     Show verbose output" -ForegroundColor Gray
    Write-Host "  -Watch       Run in watch mode (where supported)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\dev.ps1 build" -ForegroundColor Gray
    Write-Host "  .\dev.ps1 run -Watch" -ForegroundColor Gray
    Write-Host "  .\dev.ps1 test -Verbose" -ForegroundColor Gray
    Write-Host "  .\dev.ps1 docker-up" -ForegroundColor Gray
}

# Main execution
if (-not (Test-Prerequisites)) {
    exit 1
}

switch ($Command) {
    "build" {
        if (-not (Build-Application)) { exit 1 }
    }
    "run" {
        if (-not (Start-Application)) { exit 1 }
    }
    "test" {
        if (-not (Invoke-Tests)) { exit 1 }
    }
    "docker-up" {
        if (-not (Start-DockerServices)) { exit 1 }
    }
    "docker-down" {
        if (-not (Stop-DockerServices)) { exit 1 }
    }
    "clean" {
        if (-not (Clear-BuildArtifacts)) { exit 1 }
    }
    "deps" {
        if (-not (Get-Dependencies)) { exit 1 }
    }
    "gen" {
        if (-not (Invoke-CodeGeneration)) { exit 1 }
    }
    "help" {
        Show-Help
    }
    default {
        Write-Error "Unknown command: $Command"
        Show-Help
        exit 1
    }
}

Write-Status "Operation completed successfully!"
