module.exports = {
    plugins: [
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-transform-runtime',
    ],
    presets: [
        '@babel/preset-env',
        '@babel/preset-react',
    ],
    compact: false,
    sourceType: 'unambiguous',
};
