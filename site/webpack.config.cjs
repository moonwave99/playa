const path = require("path");
const WriteFilePlugin = require("write-file-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const postcssNormalize = require("postcss-normalize");

const config = {
  entry: [
    "./src/client/index.js",
    path.join(__dirname, "src", "client", "css", "style.css"),
  ],
  output: {
    path: path.join(__dirname, "dist"),
    filename: "bundle.js",
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"),
      serveIndex: false,
    },
    historyApiFallback: {
      verbose: true,
      htmlAcceptHeaders: ["text/html", "application/xhtml+xml"],
      rewrites: [
        {
          from: /^\/.*$/,
          to: (context) => {
            const { pathname } = context.parsedUrl;
            return `${
              pathname.endsWith("/") ? pathname.slice(0, -1) : pathname
            }.html`;
          },
        },
      ],
    },
    compress: true,
    port: 9000,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              url: false,
            },
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [postcssNormalize()],
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new WriteFilePlugin(),
    new CopyPlugin({
      patterns: [
        {
          from: "assets",
          to: "",
        },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: "bundle.css",
    }),
  ],
};

module.exports = config;
