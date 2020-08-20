const path = require('path');

module.exports = {
    rootDir: '../..',
    roots: ['src'],
    testRegex: 'test.js',
    transform: {
        '\\.js$': ['babel-jest', { configFile: path.join(__dirname, 'babel.config.js') }],
    },
};
