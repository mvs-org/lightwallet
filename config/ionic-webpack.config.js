var webpack = require('webpack');
const config = require('@ionic/app-scripts/config/webpack.config.js')

config.prod.output.filename = '[name].[chunkhash].js';

module.exports = config;
