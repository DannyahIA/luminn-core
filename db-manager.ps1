# Prisma Studio Manager for Automation Hub
# This script manages Prisma Studio for database access (Go/GraphQL backend)

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("setup", "studio", "push", "migrate", "reset", "status", "logs", "help")]
    [string]$Action = "help"
)

$ErrorActionPreference = "Stop"
$DatabaseModule = "modules\database"

function Show-Help {
    Write-Host "Prisma Studio Manager for Automation Hub" -ForegroundColor Green
    Write-Host ""
    Write-Host "Usage: .\db-manager.ps1 -Action <action>" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Actions:" -ForegroundColor Cyan
    Write-Host "  setup     - Setup PostgreSQL and Prisma Studio"
    Write-Host "  studio    - Open Prisma Studio (database admin UI)"
    Write-Host "  push      - Push schema changes to database"
    Write-Host "  migrate   - Create database migration"
    Write-Host "  reset     - Reset database schema (⚠️  use with caution)"
    Write-Host "  status    - Check database status"
    Write-Host "  logs      - Show database logs"
    Write-Host "  help      - Show this help message"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Cyan
    Write-Host "  .\db-manager.ps1 -Action setup"
    Write-Host "  .\db-manager.ps1 -Action studio"
    Write-Host ""
    Write-Host "Note: This only manages database access. Your Go backend handles all logic." -ForegroundColor Yellow
    Write-Host ""
}

function Test-Prerequisites {
    # Check if Docker is running
    try {
        $null = docker version 2>$null
    }
    catch {
        Write-Host "❌ Docker is not running!" -ForegroundColor Red
        Write-Host "Please start Docker Desktop and try again." -ForegroundColor Yellow
        return $false
    }

    # Check if database module exists
    if (-not (Test-Path $DatabaseModule)) {
        Write-Host "❌ Database module not found at: $DatabaseModule" -ForegroundColor Red
        return $false
    }

    # Check if pnpm is installed
    try {
        $null = pnpm --version 2>$null
    }
    catch {
        Write-Host "❌ pnpm is not installed!" -ForegroundColor Red
        Write-Host "Install with: npm install -g pnpm" -ForegroundColor Yellow
        return $false
    }

    return $true
}

function Setup-Database {
    Write-Host "🚀 Setting up PostgreSQL and Prisma Studio..." -ForegroundColor Green
    
    if (-not (Test-Prerequisites)) {
        return $false
    }

    try {
        # Start PostgreSQL services
        Write-Host "📦 Starting PostgreSQL services..." -ForegroundColor Yellow
        docker-compose up -d postgres pgadmin

        # Wait for PostgreSQL to be ready
        Write-Host "⏳ Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
        $maxAttempts = 30
        $attempt = 0
        
        do {
            $attempt++
            try {
                $result = docker exec automation_hub_postgres pg_isready -U bankhub_user -d bankhub 2>$null
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "✅ PostgreSQL is ready!" -ForegroundColor Green
                    break
                }
            }
            catch {
                # Continue trying
            }
            
            if ($attempt -lt $maxAttempts) {
                Start-Sleep -Seconds 2
            }
        } while ($attempt -lt $maxAttempts)

        if ($attempt -eq $maxAttempts) {
            Write-Host "❌ PostgreSQL did not start within timeout!" -ForegroundColor Red
            return $false
        }

        # Install Prisma dependencies
        Write-Host "📥 Installing Prisma..." -ForegroundColor Yellow
        Set-Location $DatabaseModule
        pnpm install

        # Generate Prisma client
        Write-Host "🔧 Generating Prisma client..." -ForegroundColor Yellow
        pnpm db:generate

        Set-Location "..\..\"

        Write-Host ""
        Write-Host "✅ Setup completed!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Services available:" -ForegroundColor Cyan
        Write-Host "  📊 PostgreSQL: localhost:5432" -ForegroundColor Yellow
        Write-Host "  🌐 PgAdmin: http://localhost:8081" -ForegroundColor Yellow
        Write-Host "     Email: admin@automation-hub.local"
        Write-Host "     Password: admin123"
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "  .\db-manager.ps1 -Action studio  # Open Prisma Studio"
        Write-Host ""
        Write-Host "Your Go backend should connect to:" -ForegroundColor Yellow
        Write-Host "  postgresql://bankhub_user:bankhub_secure_password_2024@localhost:5432/bankhub"
        Write-Host ""
        
        return $true
    }
    catch {
        Write-Host "❌ Setup failed: $_" -ForegroundColor Red
        Set-Location "..\..\" -ErrorAction SilentlyContinue
        return $false
    }
}

function Open-Studio {
    Write-Host "🎨 Opening Prisma Studio..." -ForegroundColor Green
    
    if (-not (Test-Path "$DatabaseModule\.env")) {
        Write-Host "❌ Database not setup! Run: .\db-manager.ps1 -Action setup" -ForegroundColor Red
        return $false
    }

    try {
        Set-Location $DatabaseModule
        Write-Host "🌐 Starting Prisma Studio at http://localhost:5555" -ForegroundColor Yellow
        Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Note: This is read-only access. Use your Go backend for data modifications." -ForegroundColor Yellow
        pnpm studio
    }
    catch {
        Write-Host "❌ Failed to start Prisma Studio: $_" -ForegroundColor Red
    }
    finally {
        Set-Location "..\..\"
    }
}

function Push-Schema {
    Write-Host "📊 Pushing schema to database..." -ForegroundColor Green
    
    try {
        Set-Location $DatabaseModule
        pnpm db:push
        Write-Host "✅ Schema pushed successfully!" -ForegroundColor Green
        Write-Host "Note: Update your Go models accordingly." -ForegroundColor Yellow
    }
    catch {
        Write-Host "❌ Schema push failed: $_" -ForegroundColor Red
    }
    finally {
        Set-Location "..\..\"
    }
}

function Create-Migration {
    Write-Host "🔄 Creating database migration..." -ForegroundColor Green
    
    try {
        Set-Location $DatabaseModule
        
        $migrationName = Read-Host "Enter migration name (or press Enter for auto-generated)"
        if ([string]::IsNullOrWhiteSpace($migrationName)) {
            pnpm db:migrate
        } else {
            pnpm exec prisma migrate dev --name $migrationName
        }
        
        Write-Host "✅ Migration completed!" -ForegroundColor Green
        Write-Host "Note: Update your Go models to match the new schema." -ForegroundColor Yellow
    }
    catch {
        Write-Host "❌ Migration failed: $_" -ForegroundColor Red
    }
    finally {
        Set-Location "..\..\"
    }
}

function Reset-Database {
    Write-Host "⚠️  WARNING: This will destroy all data and reset schema!" -ForegroundColor Red
    Write-Host "Your Go backend will need to recreate the schema." -ForegroundColor Yellow
    $confirm = Read-Host "Type 'RESET' to confirm"
    
    if ($confirm -ne "RESET") {
        Write-Host "❌ Reset cancelled" -ForegroundColor Yellow
        return $false
    }

    try {
        Set-Location $DatabaseModule
        Write-Host "🗑️  Resetting database..." -ForegroundColor Yellow
        pnpm db:reset
        Write-Host "✅ Database reset completed!" -ForegroundColor Green
        Write-Host "Don't forget to recreate tables with your Go backend." -ForegroundColor Yellow
    }
    catch {
        Write-Host "❌ Reset failed: $_" -ForegroundColor Red
    }
    finally {
        Set-Location "..\..\"
    }
}

function Get-Status {
    Write-Host "📊 Checking database status..." -ForegroundColor Cyan
    
    try {
        Write-Host ""
        Write-Host "Docker Services:" -ForegroundColor Yellow
        docker-compose ps postgres pgadmin
        
        Write-Host ""
        Write-Host "PostgreSQL Connection:" -ForegroundColor Yellow
        $result = docker exec automation_hub_postgres pg_isready -U bankhub_user -d bankhub 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ PostgreSQL is healthy" -ForegroundColor Green
        } else {
            Write-Host "❌ PostgreSQL is not responding" -ForegroundColor Red
        }
        
        Write-Host ""
        Write-Host "Prisma Setup:" -ForegroundColor Yellow
        if (Test-Path "$DatabaseModule\.env") {
            Write-Host "✅ Environment configured" -ForegroundColor Green
        } else {
            Write-Host "❌ Environment not configured" -ForegroundColor Red
        }
        
        if (Test-Path "$DatabaseModule\node_modules") {
            Write-Host "✅ Prisma installed" -ForegroundColor Green
        } else {
            Write-Host "❌ Prisma not installed" -ForegroundColor Red
        }

        Write-Host ""
        Write-Host "Connection String for Go Backend:" -ForegroundColor Yellow
        Write-Host "postgresql://bankhub_user:bankhub_secure_password_2024@localhost:5432/bankhub" -ForegroundColor Cyan
    }
    catch {
        Write-Host "❌ Status check failed: $_" -ForegroundColor Red
    }
}

function Show-Logs {
    Write-Host "📋 Showing PostgreSQL logs..." -ForegroundColor Cyan
    
    try {
        docker-compose logs -f postgres
    }
    catch {
        Write-Host "❌ Failed to show logs: $_" -ForegroundColor Red
    }
}

# Main script execution
switch ($Action) {
    "setup" { Setup-Database }
    "studio" { Open-Studio }
    "push" { Push-Schema }
    "migrate" { Create-Migration }
    "reset" { Reset-Database }
    "status" { Get-Status }
    "logs" { Show-Logs }
    "help" { Show-Help }
    default { Show-Help }
}
