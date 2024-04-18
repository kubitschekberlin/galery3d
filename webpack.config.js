import path from 'path';
import { __dirname } from './files.js'
import CopyWebpackPlugin from 'copy-webpack-plugin';

export default {
  mode: 'development',
  target: 'web',
  entry: './scripts/three_noserver.js',
  output: {
    path: path.resolve(__dirname, 'public/dist'),
    filename: 'bundle.js',
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
        { from: path.resolve(__dirname, 'resources') }
      ],
    }),
  ],
  devtool: 'source-map'
}



