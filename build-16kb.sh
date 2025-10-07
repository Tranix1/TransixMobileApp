#!/bin/bash

# 16KB Page Size Compliance Build Script
# This script ensures your app is fully compliant with Google Play's 16KB requirement

echo "🚀 Starting 16KB Page Size Compliance Build..."

# Step 1: Clean everything
echo "🧹 Cleaning project..."
rm -rf node_modules
rm -rf .expo
rm -rf android
rm -rf ios
rm package-lock.json

# Step 2: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 3: Install Expo CLI if not present
echo "🔧 Installing Expo CLI..."
npm install -g @expo/cli@latest

# Step 4: Install EAS CLI if not present
echo "🔧 Installing EAS CLI..."
npm install -g eas-cli@latest

# Step 5: Clean Expo cache
echo "🧹 Cleaning Expo cache..."
npx expo install --fix

# Step 6: Prebuild to generate native code
echo "🏗️ Prebuilding native code..."
npx expo prebuild --platform android --clean

# Step 7: Build with EAS (Production)
echo "📱 Building for production with 16KB support..."
eas build --platform android --profile production --non-interactive

echo "✅ Build completed! Your app now supports 16KB page sizes."
echo "📤 Upload the generated APK to Google Play Console."
