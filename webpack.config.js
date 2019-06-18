var MiniCssExtractPlugin = require('mini-css-extract-plugin')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var webpack = require('webpack')
var path = require('path')

module.exports = {
  entry: {
    vendor: [
      'jquery',
      'lodash',
      'bootstrap-sass/assets/fonts/bootstrap/glyphicons-halflings-regular.eot',
      'bootstrap-sass/assets/fonts/bootstrap/glyphicons-halflings-regular.svg',
      'bootstrap-sass/assets/fonts/bootstrap/glyphicons-halflings-regular.ttf',
      'bootstrap-sass/assets/fonts/bootstrap/glyphicons-halflings-regular.woff',
      'bootstrap-sass/assets/fonts/bootstrap/glyphicons-halflings-regular.woff2',
      'bootstrap-sass/assets/javascripts/bootstrap/dropdown.js',
      'font-awesome/css/font-awesome.min.css',
      'angular-loading-bar/build/loading-bar.min.css',
      './bplan/assets/scss/all.scss',
      './bplan/assets/fonts/Arimo-Bold.ttf',
      './bplan/assets/fonts/Arimo-Regular.ttf'
    ],
    angularbundle: [
      'angular',
      'angular-animate',
      'angular-loading-bar'
    ],
    leaflet: [
      'leaflet',
      'mapbox-gl-leaflet',
      'mapbox-gl/dist/mapbox-gl.js',
      'mapbox-gl/src/css/mapbox-gl.css',
      'leaflet/dist/leaflet.css',
      'leaflet.markercluster',
      'leaflet.markercluster/dist/MarkerCluster.css',
    ]
  },
  output: {
    libraryTarget: 'this',
    library: '[name]',
    path: path.resolve('./bplan/static/'),
    publicPath: '/static/',
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.s?css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: [
                require('autoprefixer')
              ]
            }
          },
          {
            loader: 'sass-loader'
          }
        ]
      },
      {
        test: /fonts\/.*\.(svg|woff2?|ttf|eot)(\?.*)?$/,
        loader: 'file-loader',
        options: {
          name: 'fonts/[name].[ext]'
        }
      },
      {
        test: /\.svg$|\.png$/,
        loader: 'file-loader',
        options: {
          name: 'images/[name].[ext]'
        }
      },
      {
        test: require.resolve('jquery'),
        use: [{
          loader: 'expose-loader',
          options: 'jQuery'
        },{
          loader: 'expose-loader',
          options: '$'
        }]
      },
      {
        test: require.resolve('leaflet'),
        use: [{
          loader: 'expose-loader',
          options: 'L'
        },{
          loader: 'expose-loader',
          options: 'leaflet'
        }]
      },
      {
        test: require.resolve('angular'),
        use: [{
          loader: 'expose-loader',
          options: 'angular'
        }
      ]
      },
      {
        test: require.resolve('mapbox-gl'),
        use: [{
          loader: 'expose-loader',
          options: 'mapboxgl'
        }
      ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
    new CopyWebpackPlugin([
      {
        from: './bplan/assets/images/**/*',
        to: 'images/',
        flatten: true
      },
      {
        from: './bplan/assets/js/',
        to: 'js/',
        flatten: false
      }
    ])
  ]
}
