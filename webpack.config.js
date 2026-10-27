// Webpack config — this replaces Vite / Create React App.
// It bundles src/main.jsx, compiles JSX with Babel, runs Tailwind through PostCSS,
// and copies everything in /public (3D models, Draco decoder) into the build.
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';

  return {
    entry: './src/main.jsx',
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: isProd ? 'static/js/[name].[contenthash:8].js' : 'static/js/[name].js',
      chunkFilename: isProd ? 'static/js/[name].[contenthash:8].chunk.js' : 'static/js/[name].chunk.js',
      publicPath: '/',
      clean: true,
    },
    resolve: { extensions: ['.js', '.jsx'] },
    devtool: isProd ? false : 'eval-cheap-module-source-map',
    module: {
      rules: [
        { test: /\.jsx?$/, exclude: /node_modules/, use: 'babel-loader' },
        {
          test: /\.css$/,
          use: [isProd ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader', 'postcss-loader'],
        },
        { test: /\.(png|jpe?g|webp|svg|mp3|wav)$/i, type: 'asset/resource' },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({ template: './public/index.html', inject: 'body' }),
      new CopyWebpackPlugin({
        patterns: [{ from: 'public', globOptions: { ignore: ['**/index.html'] } }],
      }),
      isProd && new MiniCssExtractPlugin({ filename: 'static/css/[name].[contenthash:8].css' }),
    ].filter(Boolean),
    performance: { hints: false },
    devServer: {
      port: 3000,
      historyApiFallback: true, // lets React Router handle /explore, /cars/:id ...
      hot: true,
      open: false,
      static: { directory: path.resolve(__dirname, 'public') },
      // Requests to /api go to our small Express server (server/index.js)
      proxy: [{ context: ['/api'], target: 'http://localhost:5050' }],
    },
  };
};
