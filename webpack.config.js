const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/client/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
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
                test: /\.[tj]sx?$/,
                use: [
                    'babel-loader',
                    'ts-loader',
                    'linaria/loader',
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
        // new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: 'styles.css',
        }),
        new HtmlWebpackPlugin({
            template: './src/client/index.html',
        }),
    ],
};
