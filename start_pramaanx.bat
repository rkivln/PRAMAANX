@echo off
title PRAMAANX — Identity & Document Screening System
cls
echo =====================================================================
echo  PRAMAANX - Identity & Document Verification and Border Screening
echo  Official MVP Setup & Launcher
echo =====================================================================
echo.

echo [*] Step 1: Starting Local AI & Forensic Engine on port 5001...
start "PRAMAANX Local Engine (Port 5001)" cmd /k "cd local-engine && python server.py"

echo [*] Waiting for engine initialization...
timeout /t 3 /nobreak >nul

echo.
echo [*] Step 2: Starting Desktop Application Interface...
cd apps\desktop
start "" http://localhost:5173
npm run dev

pause
