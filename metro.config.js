const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add support for path mapping
config.resolver.alias = {
    '@': path.resolve(__dirname, './'),
};

// Add support for additional file extensions
config.resolver.assetExts.push(
    // Add any additional asset extensions here
);

// Ensure proper module resolution
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;
