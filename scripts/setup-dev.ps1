# PRAMAANX Development Setup Script
param(
    [switch]$SkipPython,
    [switch]$SkipNode,
    [switch]$SkipDesktop
)

$ErrorActionPreference = 'Stop'

Write-Host "=== PRAMAANX Development Setup ===" -ForegroundColor Cyan

# Check Python
if (-not $SkipPython) {
    Write-Host "`n[1/3] Setting up Python backend..." -ForegroundColor Yellow
    Set-Location "services/api"
    if (-not (Test-Path "venv")) {
        python -m venv venv
    }
    & venv/Scripts/Activate.ps1
    pip install -r requirements.txt
    Set-Location "../.."
}

# Check Node
if (-not $SkipNode) {
    Write-Host "`n[2/3] Setting up Node AI service..." -ForegroundColor Yellow
    Set-Location "services/ai-service"
    npm install
    Set-Location "../.."
}

# Check Desktop
if (-not $SkipDesktop) {
    Write-Host "`n[3/3] Setting up Desktop app..." -ForegroundColor Yellow
    Set-Location "apps/desktop"
    npm install
    Set-Location "../.."
}

Write-Host "`n=== Setup Complete ===" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Copy .env.example to .env and fill in Supabase credentials"
Write-Host "  2. Run: supabase db reset"
Write-Host "  3. Start API: cd services/api; uvicorn app.main:app --reload --port 5000"
Write-Host "  4. Start AI: cd services/ai-service; npm run dev"
Write-Host "  5. Start Desktop: cd apps/desktop; npm run electron:dev"
