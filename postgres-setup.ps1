# PostgreSQL Setup and Migration Script for Bank Hub
# This script helps setup PostgreSQL and migrate data from SQLite

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("setup", "migrate", "start", "stop", "status", "help")]
    [string]$Action = "help"
)

$ErrorActionPreference = "Stop"

function Show-Help {
    Write-Host "PostgreSQL Setup and Migration Script" -ForegroundColor Green
    Write-Host ""
    Write-Host "Usage: .\postgres-setup.ps1 -Action <action>" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Actions:" -ForegroundColor Cyan
    Write-Host "  setup   - Start PostgreSQL container and create schema"
    Write-Host "  migrate - Migrate data from SQLite to PostgreSQL"
    Write-Host "  start   - Start PostgreSQL services"
    Write-Host "  stop    - Stop PostgreSQL services"
    Write-Host "  status  - Check PostgreSQL services status"
    Write-Host "  help    - Show this help message"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Cyan
    Write-Host "  .\postgres-setup.ps1 -Action setup"
    Write-Host "  .\postgres-setup.ps1 -Action migrate"
    Write-Host ""
}

function Test-DockerRunning {
    try {
        $null = docker version 2>$null
        return $true
    }
    catch {
        Write-Host "Docker is not running or not installed!" -ForegroundColor Red
        Write-Host "Please install Docker Desktop and make sure it's running." -ForegroundColor Yellow
        return $false
    }
}

function Start-PostgresServices {
    Write-Host "Starting PostgreSQL services..." -ForegroundColor Green
    
    if (-not (Test-DockerRunning)) {
        return $false
    }
    
    try {
        docker-compose -f docker-compose.postgres.yml up -d
        Write-Host "PostgreSQL services started successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Services:" -ForegroundColor Cyan
        Write-Host "  PostgreSQL: localhost:5432" -ForegroundColor Yellow
        Write-Host "  PgAdmin: http://localhost:8080" -ForegroundColor Yellow
        Write-Host "    Email: admin@bankhub.local"
        Write-Host "    Password: admin123"
        Write-Host ""
        Write-Host "Database Connection:" -ForegroundColor Cyan
        Write-Host "  Host: localhost"
        Write-Host "  Port: 5432"
        Write-Host "  Database: bankhub"
        Write-Host "  User: bankhub_user"
        Write-Host "  Password: bankhub_secure_password_2024"
        return $true
    }
    catch {
        Write-Host "Error starting PostgreSQL services: $_" -ForegroundColor Red
        return $false
    }
}

function Stop-PostgresServices {
    Write-Host "Stopping PostgreSQL services..." -ForegroundColor Yellow
    
    try {
        docker-compose -f docker-compose.postgres.yml down
        Write-Host "PostgreSQL services stopped successfully!" -ForegroundColor Green
    }
    catch {
        Write-Host "Error stopping PostgreSQL services: $_" -ForegroundColor Red
    }
}

function Get-PostgresStatus {
    Write-Host "Checking PostgreSQL services status..." -ForegroundColor Cyan
    
    try {
        docker-compose -f docker-compose.postgres.yml ps
    }
    catch {
        Write-Host "Error checking services status: $_" -ForegroundColor Red
    }
}

function Wait-ForPostgres {
    Write-Host "Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
    
    $maxAttempts = 30
    $attempt = 0
    
    do {
        $attempt++
        try {
            $result = docker exec bankhub_postgres pg_isready -U bankhub_user -d bankhub 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "PostgreSQL is ready!" -ForegroundColor Green
                return $true
            }
        }
        catch {
            # Continue trying
        }
        
        if ($attempt -lt $maxAttempts) {
            Write-Host "Attempt $attempt/$maxAttempts - PostgreSQL not ready yet, waiting 2 seconds..." -ForegroundColor Yellow
            Start-Sleep -Seconds 2
        }
    } while ($attempt -lt $maxAttempts)
    
    Write-Host "PostgreSQL did not become ready within timeout!" -ForegroundColor Red
    return $false
}

function Setup-PostgreSQL {
    Write-Host "Setting up PostgreSQL for Bank Hub..." -ForegroundColor Green
    Write-Host ""
    
    # Start services
    if (-not (Start-PostgresServices)) {
        return $false
    }
    
    # Wait for PostgreSQL to be ready
    if (-not (Wait-ForPostgres)) {
        Write-Host "PostgreSQL setup failed - database not ready!" -ForegroundColor Red
        return $false
    }
    
    Write-Host ""
    Write-Host "PostgreSQL setup completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Update your bank-hub application connection string:"
    Write-Host "   postgresql://bankhub_user:bankhub_secure_password_2024@localhost:5432/bankhub"
    Write-Host ""
    Write-Host "2. Install PostgreSQL driver:"
    Write-Host "   pip install psycopg2-binary"
    Write-Host ""
    Write-Host "3. Run migration to transfer data:"
    Write-Host "   .\postgres-setup.ps1 -Action migrate"
    Write-Host ""
    
    return $true
}

function Migrate-Data {
    Write-Host "Migrating data from SQLite to PostgreSQL..." -ForegroundColor Green
    Write-Host ""
    
    # Check if PostgreSQL is running
    $status = docker ps --filter "name=bankhub_postgres" --format "{{.Status}}"
    if (-not $status -or $status -notlike "*Up*") {
        Write-Host "PostgreSQL container is not running!" -ForegroundColor Red
        Write-Host "Please run: .\postgres-setup.ps1 -Action setup" -ForegroundColor Yellow
        return $false
    }
    
    # Check if migration script exists
    if (-not (Test-Path "scripts\migrate_sqlite_to_postgres.py")) {
        Write-Host "Migration script not found!" -ForegroundColor Red
        Write-Host "Expected: scripts\migrate_sqlite_to_postgres.py" -ForegroundColor Yellow
        return $false
    }
    
    # Check if SQLite database exists
    if (-not (Test-Path "..\bank-hub\bankhub.db")) {
        Write-Host "SQLite database not found!" -ForegroundColor Red
        Write-Host "Expected: ..\bank-hub\bankhub.db" -ForegroundColor Yellow
        return $false
    }
    
    try {
        # Run migration script
        Write-Host "Running migration script..." -ForegroundColor Yellow
        python scripts\migrate_sqlite_to_postgres.py
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "Data migration completed successfully!" -ForegroundColor Green
        } else {
            Write-Host "Migration script failed!" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "Error running migration script: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "Make sure Python is installed and psycopg2-binary package is available:" -ForegroundColor Yellow
        Write-Host "pip install psycopg2-binary" -ForegroundColor Cyan
        return $false
    }
    
    return $true
}

# Main script execution
switch ($Action) {
    "setup" {
        Setup-PostgreSQL
    }
    "migrate" {
        Migrate-Data
    }
    "start" {
        Start-PostgresServices
    }
    "stop" {
        Stop-PostgresServices
    }
    "status" {
        Get-PostgresStatus
    }
    "help" {
        Show-Help
    }
    default {
        Show-Help
    }
}
