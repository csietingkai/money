const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const BUILD_DIR = path.resolve(__dirname, 'build');
const SRC_DIR = path.resolve(__dirname, 'src');

module.exports = () => {
    // call dotenv and it will return an Object with a parsed key
    const env = dotenv.config().parsed;

    // reduce it to a nice object, the same as before
    const envKeys = Object.keys(env).reduce((prev, next) => {
        prev[`process.env.${next}`] = JSON.stringify(env[next]);
        return prev;
    }, {});

    return {
        entry: {
            index: [SRC_DIR + '/index.tsx']
        },
        output: {
            path: BUILD_DIR,
            filename: '[name].bundle.js'
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', 'jsx'],
            modules: [SRC_DIR, 'node_modules'],
            alias: {
                src: SRC_DIR
            }
        },
        module: {
            rules: [
                { test: /\.tsx?$/, loader: 'awesome-typescript-loader' },
                { test: /\.s[ac]ss$/, use: ['style-loader', 'css-loader', 'sass-loader'] },
                { test: /\.css$/, use: ['style-loader', 'css-loader'] },
                {
                    test: /\.(png|jp(e)?g|gif|ico)$/,
                    use: [{
                        loader: 'url-loader',
                        options: {
                            name: './image/[name].[hash].[ext]'
                        }
                    }]
                },
                {
                    test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                    loader: 'url-loader',
                    options: {
                        name: './fonts/[name].[hash].[ext]'
                    }
                }
            ]
        },
        plugins: [
            new HtmlWebpackPlugin({ template: './index.html' }),
            new webpack.DefinePlugin(envKeys)
        ],
        devServer: {
            port: 3000
        }
    }
};
