require('dotenv').config()
const ExtractTextPlugin = require("extract-text-webpack-plugin")
var ManifestPlugin = require('webpack-manifest-plugin')
const path = require('path')
const slug = process.env.SLUG
const theme = __dirname + '/wp-content/themes/' + slug + '/'
const webpack = require('webpack')
var BrowserSyncPlugin = require('browser-sync-webpack-plugin');
let domain = process.env.WEBPACK_DOMAIN ||  "localhost"

var bourbon = require('bourbon').includePaths;
var neat = require('bourbon-neat').includePaths;

let base = {
  entry: [
    // bundle the client for webpack-dev-server
    // and connect to the provided endpoint
    theme + 'assets/index.js'
  ],
  output: {
    path: theme,
    filename: 'bundle.js',
    publicPath: 'http://'+ domain + ':8080/'
  },
  resolve:{
    modules: ['./node_modules', theme + '/assets/scripts']
  },

  module: {
    rules: [
      {
        test: /\.jsx$/,
        loader: 'react-hot-loader'
      },
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader',
        query: {
          plugins: ['transform-runtime'],
					presets: ['es2015', 'stage-0', 'react'],
        }
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          use: 'css-loader?importLoaders=1',
        }),
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: [{
               loader: "css-loader"
           }, {
               loader: "postcss-loader"
           }, {
               loader: "sass-loader",
               options: {
                   includePaths: [bourbon, neat]
               }
           }]
        })
      },
      {
        exclude: [
          path.resolve(__dirname, "wp-content/themes/" + slug + "/assets/images")
        ],
        test: /\.(ttf|eot|svg|woff|woff2)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: [
          { loader: `file-loader?name=[name].[ext]&publicPath=/wp-content/themes/` + slug + '/assets/fonts/' }
        ]
      },
      {
        exclude: [
          path.resolve(__dirname, "wp-content/themes/" + slug + "/assets/fonts")
        ],
        test: /\.jpe?g$|\.gif$|\.png$|\.svg$/,
        loader: 'url-loader?limit=1000000'
      }
    ]
  },
  plugins: [

    new ExtractTextPlugin({
      filename: "[name].[contenthash].css",
      disable: process.env.NODE_ENV !== "production"
    }),
    new webpack.ProvidePlugin({
			React: 'react',
			ReactDOM: 'react-dom',
			_: 'lodash'
		}),
    new webpack.ProvidePlugin({
      jQuery: 'jquery',
      $: 'jquery',
      jquery: 'jquery'
    })
  ]
}

if (process.env.NODE_ENV !== "production") {
  base.devServer = {
    contentBase: path.join(__dirname, `wp-content/themes/${slug}/assets`), // boolean | string | array, static file location
    compress: true, // enable gzip compression
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    historyApiFallback: true, // true for index.html upon 404, object for multiple paths
    host: domain,
    hot: true, // hot module replacement. Depends on HotModuleReplacementPlugin
    hotOnly: true,
    https: false, // true for self-signed, object for cert authority
    noInfo: true,
    port: 8080,
    public: domain + ":8080",
    publicPath: "http://" + domain + ":8080"
  }
  base.entry.push('webpack-dev-server/client?http://' + domain + ":8080")
  base.plugins.push(
    new BrowserSyncPlugin(
      // BrowserSync options
      {
        // browse to http://localhost:3000/ during development
        host: 'localhost',
        port: 3000,
        // proxy the Webpack Dev Server endpoint
        // (which should be serving on http://localhost:3100/)
        // through BrowserSync
        proxy: `${process.env.BROWSER_SYNC_PROXY}`,
        files: [
          "wp-content/themes/**/*.php",
          "wp-content/themes/**/*.js"
        ]
      },
      // plugin options
      {
        // prevent BrowserSync from reloading the page
        // and let Webpack Dev Server take care of this
        reload: false
      }
    )
  )
} else {
  base.output.filename = 'bundle.[chunkhash].js'
  base.output.path += "/build"
  base.plugins.push(
    new webpack.optimize.UglifyJsPlugin(),
    new ManifestPlugin(),
    function () {
      this.plugin("done", function (stats) {
        require("fs").writeFileSync(
          path.join(__dirname, "stats.json"),
          JSON.stringify(stats.toJson()));
      })
    }
  )
}

module.exports = base
