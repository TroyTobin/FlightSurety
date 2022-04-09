const path = require("path");
const webpack = require('webpack')

module.exports = {
  entry:  "./src/dapp/index.js",
  output: {
    path: path.resolve(__dirname, "src/dapp"),
    filename: "main.js"
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },  
  plugins: [
      // https://stackoverflow.com/questions/68707553/uncaught-referenceerror-buffer-is-not-defined
      // Needed otherwise get a "Brocess is not defined" error:
      new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
      }),
      // https://stackoverflow.com/questions/41359504/webpack-bundle-js-uncaught-referenceerror-process-is-not-defined
      // Needed otherwise get a "process is not defined" error:
      new webpack.ProvidePlugin({
          process: 'process/browser',
    }),
  ],
  resolve:
  {
    fallback: {
      "assert": require.resolve("assert/"),
      "crypto": require.resolve("crypto-browserify"),
      "os": require.resolve("os-browserify/browser"),
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "stream": require.resolve("stream-browserify")
    }
  },
  devServer: {
    static: { 
      directory: path.join(__dirname, "src/dapp")
    },
    port: 8000
  },
};
