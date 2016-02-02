'use strict';

var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: [
        './src/index'
    ],
    output: {
        path: './dist',
        filename: 'esp-js-devtools.js'
    },
    debug: true,
    devtool: 'source-map',
    module: {
        loaders: [
            {
                loader: "babel-loader",

                // Skip any files outside of your project's `src` directory
                include: [
                    path.resolve(__dirname, "src"),
                ],
                test: /\.jsx?$/,
                query: {
                    presets: ['es2015', 'stage-0', 'react'],
                }
            },
            // LESS
            {
                test: /\.less$/,
                loader: 'style!css!less'
            },
        ]
    },
    devServer: {
        contentBase: './src',
        hot: true,
        inline: true,
        port: 9898
    }
};