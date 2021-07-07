var MiniCssExtractPlugin = require('mini-css-extract-plugin')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var webpack = require('webpack')
var path = require('path')

module.exports = {
  entry: {
    app: [
      'angular',
      'angular-animate',
      'angular-loading-bar',
      'angular-loading-bar/build/loading-bar.min.css',
      'bootstrap-sass/assets/fonts/bootstrap/glyphicons-halflings-regular.eot',
      'bootstrap-sass/assets/fonts/bootstrap/glyphicons-halflings-regular.svg',
      'bootstrap-sass/assets/fonts/bootstrap/glyphicons-halflings-regular.ttf',
      'bootstrap-sass/assets/fonts/bootstrap/glyphicons-halflings-regular.woff',
      'bootstrap-sass/assets/fonts/bootstrap/glyphicons-halflings-regular.woff2',
      'bootstrap-sass/assets/javascripts/bootstrap/dropdown.js',
      'font-awesome/css/font-awesome.min.css',
      'leaflet',
      'leaflet/dist/leaflet.css',
      'leaflet.markercluster',
      'leaflet.markercluster/dist/MarkerCluster.css',
      'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css',
      'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.min.js',
      'lodash',
      'mapbox-gl',
      'mapbox-gl-leaflet',
      './bplan/assets/scss/all.scss',
      './bplan/assets/fonts/Arimo-Bold.ttf',
      './bplan/assets/fonts/Arimo-Regular.ttf',
      './bplan/assets/js/app/app.js',
      './bplan/assets/js/app/shared/services/placeService.js',
      './bplan/assets/js/app/shared/controllers/viewController.js',
      './bplan/assets/js/app/components/map/mapControllers.js',
      './bplan/assets/js/app/components/list/listControllers.js',
      './bplan/assets/js/app/components/list/listDirectives.js',
      './bplan/assets/js/app/components/map/mapDirectives.js',
      './bplan/assets/js/app/shared/directives/sharedDirectives.js'
    ],
    custom: {
      import: [
        './bplan/assets/js/custom.js'
      ],
      dependOn: 'app'
    }
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
              postcssOptions: {
                plugins: [
                  require('autoprefixer')
                ]
              }
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
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx', '.scss', '.css'],
    alias: {
      jquery$: 'jquery/dist/jquery.min.js'
    },
    // when using `npm link`, dependencies are resolved against the linked
    // folder by default. This may result in dependencies being included twice.
    // Setting `resolve.root` forces webpack to resolve all dependencies
    // against the local directory.
    modules: [path.resolve('./node_modules')]
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      L: 'leaflet',
      mapboxgl: 'mapbox-gl'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
    new CopyWebpackPlugin({
      patterns: [
      {
        from: './bplan/assets/images/**/*',
        to: 'images/[name][ext]',
      },
      {
        from: './bplan/assets/html/',
        to: 'html/',
      }
   ],
    })
  ]
}
