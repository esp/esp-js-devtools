'use strict';

var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: [
        './src/index'
    ],
    output: {
        libraryTarget: 'umd',
        sourcePrefix: '    ',
        library: 'esp',
        path: './dist/',
        filename: 'esp-js-devtools.js'
    },
    debug: true,
    devtool: 'inline-source-map',
    module: {
        loaders: [
            {
                test: /vendor\/.+\.(jsx|js)$/,
                loader: 'imports?jQuery=jquery,$=jquery,this=>window'
            },
            {
                loader: "babel-loader",

                // Skip any files outside of your project's `src` directory
                include: [
                    path.resolve(__dirname, "src"),
                ],
                test: /\.jsx?$/,
                query: {
                    presets: ['es2015', 'stage-0'],
                    plugins: ['transform-runtime', 'transform-decorators-legacy']
                }
            },
            {
                test: /\.(css|less)$/,
                loader: 'style-loader!css-loader!less-loader'
            },
            {
                test: /\.(otf|eot|png|svg|ttf|woff|woff2)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'file-loader?name=[path][name].[ext]?[hash]&mimetype=application/font-woff'
            }
        ]
    }
};