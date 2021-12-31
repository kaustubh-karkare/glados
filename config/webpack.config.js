const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const nodeExternals = require('webpack-node-externals');

const path = require('path');

function fromProjectRoot(relativePath) {
    return path.resolve(__dirname, '..', relativePath);
}

function getJSModuleRule() {
    return {
        test: /\.(js|ts)$/,
        use: [
            {
                loader: 'babel-loader',
                options: {
                    configFile: path.join(__dirname, 'babel.config.js'),
                },
            },
        ],
        exclude: /node_modules/,
    };
}

function getStats() {
    return {
        assets: true, // Show generated bundles.
        builtAt: true, // The one signal I actually want.
        children: false,
        entrypoints: false,
        hash: false,
        modules: false, // Show all the modules that are part of this package.
        timings: false,
        version: false,
    };
}

function getClientSideBundle(entryPoint, outputFileName) {
    return {
        mode: 'development',
        entry: fromProjectRoot(entryPoint),
        output: {
            path: fromProjectRoot('dist'),
            filename: outputFileName,
        },
        devServer: {
            hot: true,
        },
        resolve: {
            extensions: ['.js', '.css'],
        },
        module: {
            rules: [
                getJSModuleRule(),
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
            // TODO: Generalize this part.
            new MiniCssExtractPlugin({
                filename: 'index.css',
            }),
            new HtmlWebpackPlugin({
                template: fromProjectRoot('src/client/index.html'),
                favicon: 'src/client/index.ico',
            }),
        ],
        stats: getStats(),
    };
}

function getServerSideBundle(entryPoint, outputFileName) {
    return {
        mode: 'development',
        entry: fromProjectRoot(entryPoint),
        output: {
            path: fromProjectRoot('dist'),
            filename: outputFileName,
        },
        devServer: {
            hot: true,
        },
        resolve: {
            extensions: ['.js'],
        },
        module: {
            rules: [
                getJSModuleRule(),
            ],
        },
        // https://medium.com/tomincode/hiding-critical-dependency-warnings-from-webpack-c76ccdb1f6c1
        plugins: [
            new webpack.ContextReplacementPlugin(
                /src\/server/,
                (data) => {
                    // The following error is expected in actions.js to support Jest.
                    //     Critical dependency: require function is used in a way in
                    //     which dependencies cannot be statically extracted.
                    data.dependencies.forEach((dependency) => {
                        delete dependency.critical;
                    });
                    return data;
                },
            ),
        ],
        stats: getStats(),
        // https://www.npmjs.com/package/webpack-node-externals
        target: 'node',
        externals: [nodeExternals()],
    };
}

module.exports = [
    getClientSideBundle('src/client/index.js', 'client.js'),
    getServerSideBundle('src/server/index.js', 'server.js'),
    getServerSideBundle('src/demo/index.js', 'demo.js'),
];
