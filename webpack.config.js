import path from 'path';
import { __dirname } from './files.js'
import CopyWebpackPlugin from 'copy-webpack-plugin';

export default [
  //////////////////////////////////////////////////////////////////////////////////////
  // server configuration
  ///////////////////////////////////////////////////////////////////////////////////////
  {
    mode: 'development',
    target: 'node', // Da wir einen Express-Server bauen
    entry: './index.js',
    output: {
      filename: 'server.bundle.js',
    },
    module: {
      rules: [
        {
          test: /\.js$/, // Alle .js Dateien werden durch Babel transpiliert
          exclude: /node_modules\/.*/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        }],
    },
    devServer: {
      static: path.join(__dirname, 'dist'),
      port: 3001
    },
    ignoreWarnings: [{
      message: /Critical dependency/
    }],
  },
  ///////////////////////////////////////////////////////////////////////////////////////
  // client configuration
  ///////////////////////////////////////////////////////////////////////////////////////
  {
    mode: 'development',
    target: 'web',
    entry: './public/galery_3d.js',
    output: {
      path: path.resolve(__dirname, 'public/dist'),
      filename: 'client.bundle.js',
    },
    module: {
      rules: [
        {
          test: /\.js$/, // Alle .js Dateien werden durch Babel transpiliert
          exclude: /node_modules\/.*/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        },
        {
          test: /\.css$/, // Alle .css Dateien werden durch css-loader und style-loader verarbeitet
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          { from: path.resolve(__dirname, 'public/resources') }
        ],
      }),
    ],
    devtool: 'source-map'
  }
];


