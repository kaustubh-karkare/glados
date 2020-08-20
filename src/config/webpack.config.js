const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const path = require('path');

function fromProjectRoot(relativePath) {
    return path.resolve(__dirname, '../..', relativePath);
}

module.exports = {
    mode: 'development',
    entry: fromProjectRoot('src/client/index.js'),
    output: {
        path: fromProjectRoot('dist'),
        filename: 'index.js',
        publicPath: '/',
    },
    devServer: {
        hot: true,
    },
    resolve: {
        extensions: ['.js', '.css'],
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            configFile: path.join(__dirname, 'babel.config.js'),
                        },
                    },
                    /*
                    {
                        loader: 'ts-loader',
                        options: {
                            context: path.resolve(__dirname, '../..'),
                            configFile: path.join(__dirname, 'tsconfig.json'),
                        },
                    },
                    */
                ],
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    // The css-loader interprets @import and url()
                    // like import/require() and will resolve them.
                    'css-loader',
                ],
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'index.css',
        }),
        new HtmlWebpackPlugin({
            template: fromProjectRoot('src/client/index.html'),
        }),
    ],
    stats: {
        assets: false,
        builtAt: true, // the one signal I actually want
        children: false,
        entrypoints: false,
        hash: false,
        modules: false,
        timings: false,
        version: false,
    },
};
