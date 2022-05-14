const webpack = require('webpack')
const path = require('path')
const nodeExternals = require('webpack-node-externals')

// Switched to use start-server-nestjs-webpack-plugin
// As it supports webpack 5
// See https://github.com/ericclemmons/start-server-webpack-plugin/issues/40
const StartServerPlugin = require('start-server-nestjs-webpack-plugin')

module.exports = {
    mode: 'development',
    entry: [
        'webpack/hot/poll?1000',
        './src/server/index'
    ],
    watch: true,
    target: 'node',
    externals: [nodeExternals({
        allowlist: ['webpack/hot/poll?1000']
    })],
    module: {
        rules: [{
            test: /\.js?$/,
            use: 'babel-loader',
            exclude: /node_modules/
        }]
    },
    plugins: [
        new StartServerPlugin('server.js'),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.DefinePlugin({
            "process.env": {
                "BUILD_TARGET": JSON.stringify('server')
            }
        }),
    ],
    output: {
        path: path.join(__dirname, 'prod/server'),
        filename: 'server.js'
    }
}