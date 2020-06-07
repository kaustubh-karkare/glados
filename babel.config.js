module.exports = {
    plugins: [
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-transform-runtime',
    ],
    presets: [
        '@babel/preset-env',
        '@babel/preset-react',
        'linaria/babel',
    ],
    compact: false,
    sourceType: 'unambiguous',
};
