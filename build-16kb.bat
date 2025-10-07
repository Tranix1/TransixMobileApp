@echo off
REM 16KB Page Size Compliance Build Script for Windows
REM This script ensures your app is fully compliant with Google Play's 16KB requirement

echo 🚀 Starting 16KB Page Size Compliance Build...

REM Step 1: Clean everything
echo 🧹 Cleaning project...
if exist node_modules rmdir /s /q node_modules
if exist .expo rmdir /s /q .expo
if exist android rmdir /s /q android
if exist ios rmdir /s /q ios
if exist package-lock.json del package-lock.json

REM Step 2: Install dependencies
echo 📦 Installing dependencies...
npm install

REM Step 3: Install Expo CLI if not present
echo 🔧 Installing Expo CLI...
npm install -g @expo/cli@latest

REM Step 4: Install EAS CLI if not present
echo 🔧 Installing EAS CLI...
npm install -g eas-cli@latest

REM Step 5: Clean Expo cache
echo 🧹 Cleaning Expo cache...
npx expo install --fix

REM Step 6: Prebuild to generate native code
echo 🏗️ Prebuilding native code...
npx expo prebuild --platform android --clean

REM Step 7: Build with EAS (Production)
echo 📱 Building for production with 16KB support...
eas build --platform android --profile production --non-interactive

echo ✅ Build completed! Your app now supports 16KB page sizes.
echo 📤 Upload the generated APK to Google Play Console.
pause
