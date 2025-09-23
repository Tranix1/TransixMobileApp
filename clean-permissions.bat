@echo off
echo 🧹 Cleaning Android permissions and rebuilding...

REM Remove expo-media-library if it exists
echo 📦 Removing expo-media-library...
npm uninstall expo-media-library

REM Clean node_modules and reinstall
echo 🗑️ Cleaning node_modules...
rmdir /s /q node_modules
del package-lock.json

REM Reinstall dependencies
echo 📥 Reinstalling dependencies...
npm install

REM Clean Android build
echo 🧹 Cleaning Android build...
cd android
gradlew clean
cd ..

REM Clean Expo cache
echo 🧹 Cleaning Expo cache...
npx expo install --fix

echo ✅ Cleanup complete! Now run: npx expo run:android
pause

