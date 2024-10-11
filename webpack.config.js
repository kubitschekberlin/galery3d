import path from 'path';
import CopyWebpackPlugin from 'copy-webpack-plugin';

export default [
  {
    mode: 'development',
    target: 'node',
    entry: './index.js',
    output: {
      filename: 'server.bundle.js',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          }
        },
        {
          test: /\.handlebars$/,
          use: ['html-loader', 'handlebars-loader']
        }
      ],
    },
    devServer: {
      static: path.join(__dirname, 'dist'),
      port: 3001
    },
    ignoreWarnings: [{
      message: /Critical dependency/
    }],
  },
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
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.handlebars$/,
          use: ['html-loader', 'handlebars-loader']
        }
      ],
    },
    resolve: {
      extensions: ['.js', '.json', '.handlebars'],
      mainFields: ['browser', 'module', 'main']
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
