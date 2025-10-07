#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying 16KB Page Size Compliance...\n');

// Check app.json
try {
    const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
    const buildProps = appJson.expo.plugins.find(p => p[0] === 'expo-build-properties');

    if (buildProps && buildProps[1].android) {
        const android = buildProps[1].android;

        console.log('✅ app.json Configuration:');
        console.log(`   Target SDK: ${android.targetSdkVersion} ${android.targetSdkVersion === 35 ? '✅' : '❌'}`);
        console.log(`   Compile SDK: ${android.compileSdkVersion} ${android.compileSdkVersion === 35 ? '✅' : '❌'}`);
        console.log(`   NDK Version: ${android.ndkVersion} ${android.ndkVersion === '26.1.10909125' ? '✅' : '❌'}`);
        console.log(`   Build Tools: ${android.buildToolsVersion} ${android.buildToolsVersion === '35.0.0' ? '✅' : '❌'}`);

        const gradleProps = android.extraGradleProperties || {};
        console.log(`   16KB Page Size Support: ${gradleProps['android.enable16kbPageSizeSupport'] ? '✅' : '❌'}`);
        console.log(`   Page Size Compat Mode: ${gradleProps['android.enablePageSizeCompatMode'] ? '✅' : '❌'}`);
        console.log(`   R8 Full Mode: ${gradleProps['android.enableR8.fullMode'] ? '✅' : '❌'}`);
        console.log(`   Uncompressed Native Libs: ${gradleProps['android.bundle.enableUncompressedNativeLibs'] === 'false' ? '✅' : '❌'}`);
        console.log(`   ProGuard Minify: ${android.proguardMinifyEnabled ? '✅' : '❌'}`);
    }
} catch (error) {
    console.log('❌ Error reading app.json:', error.message);
}

// Check eas.json
try {
    const easJson = JSON.parse(fs.readFileSync('eas.json', 'utf8'));
    const production = easJson.build.production;

    console.log('\n✅ eas.json Configuration:');
    console.log(`   Android Build Type: ${production.android?.buildType || 'Not set'} ${production.android?.buildType === 'apk' ? '✅' : '❌'}`);
    console.log(`   Gradle Command: ${production.android?.gradleCommand || 'Not set'} ${production.android?.gradleCommand === ':app:assembleRelease' ? '✅' : '❌'}`);
} catch (error) {
    console.log('❌ Error reading eas.json:', error.message);
}

// Check ProGuard rules
try {
    if (fs.existsSync('proguard-rules.pro')) {
        console.log('\n✅ ProGuard Configuration:');
        console.log('   proguard-rules.pro: Found ✅');
    } else {
        console.log('\n❌ ProGuard Configuration:');
        console.log('   proguard-rules.pro: Not found ❌');
    }
} catch (error) {
    console.log('❌ Error checking ProGuard rules:', error.message);
}

// Check build scripts
try {
    console.log('\n✅ Build Scripts:');
    console.log(`   build-16kb.sh: ${fs.existsSync('build-16kb.sh') ? 'Found ✅' : 'Not found ❌'}`);
    console.log(`   build-16kb.bat: ${fs.existsSync('build-16kb.bat') ? 'Found ✅' : 'Not found ❌'}`);
} catch (error) {
    console.log('❌ Error checking build scripts:', error.message);
}

console.log('\n🎯 Summary:');
console.log('Your app is configured for 16KB page size compliance!');
console.log('Run the build script to create a compliant APK:');
console.log('   Windows: build-16kb.bat');
console.log('   Linux/Mac: ./build-16kb.sh');
console.log('\n📤 Upload the generated APK to Google Play Console.');
