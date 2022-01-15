// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WorkboxWebpackPlugin = require("workbox-webpack-plugin");
const { DefinePlugin } = require("webpack");

const isProduction = process.env.NODE_ENV == "production";

const stylesHandler = 'style-loader';

const config = {
  resolve: {
    extensions: [".js",".jsx",".ts",".tsx"],
    alias: {
      BannersPath: path.resolve(__dirname, '../../../Assets/Banners')
    }
  },
  entry: "./src/app.js",
  output: {
    library: {type: 'system'},
    path: path.resolve(__dirname, "dist"),
    filename: 'bundle.js',
  },
  target: "node",
  plugins: [
    new HtmlWebpackPlugin({
      template: "index.html",
    }),

    new DefinePlugin({
      'process.env.BANNERS_PATH': JSON.stringify(path.join(__dirname, '../../../Assets/Banners')),
      'HEADERS_PATH': JSON.stringify(path.join(__dirname, '../../../Assets/Headers')),
    }),

    // Add your plugins here
    // Learn more about plugins from https://webpack.js.org/configuration/plugins/
  ],
  module: {
    rules: [
      {
        test: /\.(css)$/i,
        use: [stylesHandler, 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.(js|jsx)$/i,
        loader: "babel-loader",
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: "asset",
      },
      {
        test: /\.(vdf|acf)$/i,
        loader: "raw-loader"
      },
      {
        test: /\.(png|jp(e*)g|svg|gif)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: 'images/[hash]-[name].[ext]',
            },
          },
        ],
      },
    ],
  },
};

module.exports = () => {
  if (isProduction) {
    config.mode = "production";

    config.plugins.push(new WorkboxWebpackPlugin.GenerateSW());
  } else {
    config.mode = "development";
  }
  return config;
};
