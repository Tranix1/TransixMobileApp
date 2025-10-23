const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname, {
    // Enable experimental features for Expo SDK 54
    isCSSEnabled: true,
});

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

// Optimize for production builds while preserving functionality
config.transformer.minifierConfig = {
    // Keep function names for better debugging
    keep_fnames: true,
    // Keep class names for better debugging
    keep_classnames: true,
    // Don't mangle property names that might be used by reflection
    mangle: {
        keep_fnames: true,
        keep_classnames: true,
        // Don't mangle async function names
        reserved: ['async', 'await', 'Promise', 'then', 'catch', 'finally']
    },
    // Preserve async/await patterns
    compress: {
        // Don't compress async functions too aggressively
        keep_fnames: true,
        keep_classnames: true,
        // Preserve async/await syntax
        keep_async: true,
        // Don't inline async functions
        inline: false
    }
};

// Ensure proper source map generation for debugging
config.transformer.enableBabelRCLookup = false;

// Enable require.context support
config.transformer.unstable_allowRequireContext = true;

// Note: experiments like typedRoutes should be configured in app.json, not here

// Ensure proper module resolution for experimental features
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
