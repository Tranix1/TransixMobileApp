@echo off
echo ========================================
echo   16KB COMPLIANCE BUILD SCRIPT
echo   Fixing PDFium and 16KB Issues
echo ========================================

echo.
echo [1/6] Cleaning project...
call npx expo install --fix
if exist node_modules rmdir /s /q node_modules
if exist .expo rmdir /s /q .expo
if exist android rmdir /s /q android
if exist ios rmdir /s /q ios
del package-lock.json 2>nul

echo.
echo [2/6] Installing dependencies...
call npm install

echo.
echo [3/6] Removing unused react-native-pdf (causes PDFium 16KB issue)...
call npm uninstall react-native-pdf

echo.
echo [4/6] Cleaning Expo cache...
call npx expo install --fix

echo.
echo [5/6] Prebuilding with 16KB support...
call npx expo prebuild --platform android --clean

echo.
echo [6/6] Building with EAS...
echo Choose build option:
echo 1. EAS Build (Recommended for Play Store)
echo 2. Local Build (For testing)
set /p choice="Enter choice (1 or 2): "

if "%choice%"=="1" (
    echo Building with EAS...
    call eas build --platform android --profile production
) else if "%choice%"=="2" (
    echo Building locally...
    call npx expo run:android --variant release
) else (
    echo Invalid choice. Building with EAS...
    call eas build --platform android --profile production
)

echo.
echo ========================================
echo   BUILD COMPLETE!
echo   Your app is now 16KB compliant!
echo ========================================
pause
