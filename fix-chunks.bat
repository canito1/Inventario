@echo off
echo Fixing ChunkLoadError and Build Issues...
echo.

echo 1. Clearing Next.js cache...
rmdir /s /q .next 2>nul
rmdir /s /q node_modules\.cache 2>nul

echo 2. Clearing browser cache (you may need to do this manually)...
echo    - Press Ctrl+Shift+R to hard refresh
echo    - Or go to DevTools ^> Application ^> Storage ^> Clear storage

echo 3. Rebuilding the application...
npm run build

if %errorlevel% neq 0 (
    echo.
    echo Build failed! Starting development server instead...
    npm run dev
) else (
    echo.
    echo Build successful! Starting development server...
    npm run dev
)

echo.
echo Done!
pause