@echo off
echo Building Transix with Expo 54 async fixes...

echo.
echo Step 1: Cleaning previous builds...
npx expo install --fix
npx expo prebuild --clean

echo.
echo Step 2: Installing dependencies...
npm install

echo.
echo Step 3: Building for Android...
npx eas build --platform android --profile production

echo.
echo Build completed! The following fixes have been applied:
echo - Disabled New Architecture (temporarily)
echo - Updated Proguard rules for better async support
echo - Added global error handling
echo - Fixed memory leaks in intervals
echo - Added timeout protection for async operations
echo - Updated Metro config for better async preservation

pause
