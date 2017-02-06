const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ENV = process.env.NODE_ENV || 'development'
const isProd = ENV === 'production'
const isDev = ENV === 'development'
const WebpackErrorNotificationPlugin = require('webpack-error-notification')

module.exports = {
  cache: !isProd,
  devtool: isProd ? '#eval' : '#cheap-module-eval-source-map',
  context: path.join(__dirname, 'client'),
  entry: (function () {
    const entries = []
    if (isDev) {
      entries.push(
        'webpack-dev-server/client?http://localhost:8080',
        // bundle the client for webpack-dev-server
        // and connect to the provided endpoint

        'webpack/hot/only-dev-server'
        // bundle the client for hot reloading
        // only- means to only hot reload for successful updates
      )
    }
    return entries.concat('./index.js')
  })(),
  output: {
    path: path.join(__dirname, 'client-dist'),
    filename: '[name].[hash].js',
    publicPath: '/',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        include: /client/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.html$/,
        use: 'file-loader?name=[name].[ext]',
      },
      {
        test: /\.css$/,
        include: /client/,
        use: [
          'style-loader',
          'css-loader?sourceMap&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]',
        ],
      },
      {
        test: /\.css$/,
        exclude: /client/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.(png|jpg|wav)$/,
        use: 'file-loader',
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: 'url-loader?limit=10000&mimetype=application/font-woff',
      },
      {
        test: /\.(woff(2)|ttf|eot|svg|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: 'file-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.js'],
    unsafeCache: true,
  },
  plugins: (function () {
    const plugins = [
      new HtmlWebpackPlugin({
        template: 'index.ejs',
      }),
      new WebpackErrorNotificationPlugin(),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify(ENV),
        },
      }),
    ]

    if (isDev) {
      plugins.push(new webpack.HotModuleReplacementPlugin())// enable HMR globally
      plugins.push(new webpack.NamedModulesPlugin()) // prints more readable module names in the browser console on HMR updates)
    }

    if (isProd) {
      plugins.push(new webpack.optimize.OccurrenceOrderPlugin(false))
      plugins.push(new webpack.optimize.UglifyJsPlugin({
        screwIe8: true,
        compress: {
          warnings: false,
        },
        output: {
          comments: false,
        },
      }))
    }

    return plugins
  }()),
  devServer: {
    contentBase: path.resolve(__dirname, 'web'),
    hot: isDev,
    publicPath: '/',
    historyApiFallback: true,
  },
}
