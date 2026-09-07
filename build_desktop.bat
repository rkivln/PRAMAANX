@echo off
title PRAMAANX Desktop Software Builder
cls
echo =====================================================================
echo  PRAMAANX Desktop Software Packaging (Tauri / Electron)
echo =====================================================================
echo.

cd apps\desktop

echo [*] Building Production Web Assets (Vite + TypeScript)...
call npx vite build
if %errorlevel% neq 0 (
    echo [!] Vite build failed.
    pause
    exit /b %errorlevel%
)

echo.
echo [*] Checking for Cargo (Rust / Tauri compiler)...
where cargo >nul 2>nul
if %errorlevel% equ 0 (
    echo [*] Rust found. Packaging software with Tauri 2.0...
    call npm run tauri:build
) else (
    echo [i] Cargo/Rust not found on PATH.
    echo [*] Packaging desktop software with Electron Builder instead...
    call npm run electron:build
)

echo.
echo =====================================================================
echo  Packaging Complete! Check apps\desktop\dist or release folder.
echo =====================================================================
pause
