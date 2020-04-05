const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals')
const path = require('path');

const {
  NODE_ENV = 'development',
} = process.env;

const babelrc = {
  presets: [
    [
      "@babel/preset-env",
      {
        "useBuiltIns": "entry",
        "targets": "> 0.25%, not dead"
      }
    ]
  ] 
}

const babelLoader = {
  test: /\.m?js$/,
  include: [
    path.resolve(__dirname, "src")
  ],
  exclude: [
    path.resolve(__dirname, "node_modules")
  ],
  use: {
    loader: "babel-loader",
    options: babelrc
  }
}

const webpackRules = [
  babelLoader
]

module.exports = {
  mode: NODE_ENV,
  target: 'node',
  externals: [nodeExternals()],
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js'
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: webpackRules
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    compress: true,
    port: 9000
  }
}
