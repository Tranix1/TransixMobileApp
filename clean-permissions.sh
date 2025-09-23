#!/bin/bash

echo "🧹 Cleaning Android permissions and rebuilding..."

# Remove expo-media-library if it exists
echo "📦 Removing expo-media-library..."
npm uninstall expo-media-library

# Clean node_modules and reinstall
echo "🗑️ Cleaning node_modules..."
rm -rf node_modules
rm -rf package-lock.json

# Reinstall dependencies
echo "📥 Reinstalling dependencies..."
npm install

# Clean Android build
echo "🧹 Cleaning Android build..."
cd android
./gradlew clean
cd ..

# Clean Expo cache
echo "🧹 Cleaning Expo cache..."
npx expo install --fix

echo "✅ Cleanup complete! Now run: npx expo run:android"

