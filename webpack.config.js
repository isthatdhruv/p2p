// my-p2p-messenger/webpack.config.js
const path = require('path');

module.exports = {
  entry: './src/App.jsx', // Entry point: your main React file
  output: {
    path: path.resolve(__dirname, 'dist'), // Output directory: the 'dist' folder
    filename: 'app.js', // Output filename: 'app.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/, // Process .js and .jsx files
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // Use babel-loader to transpile code
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'], // Presets for React and ES6+
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'], // Resolve .js and .jsx extensions
  },
  mode: 'development', // Set mode to 'development' for now
};