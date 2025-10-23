module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            // Required for react-native-reanimated v4 (includes worklets)
            'react-native-reanimated/plugin',
        ],
    };
};
