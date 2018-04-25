var webpack  = require('webpack');
const config = require('@ionic/app-scripts/config/webpack.config.js')

// Here we override the dev and prod configs
// by adding .[chunkhash] to the output filename
//
// If the code for the chunk changes, so will the filename
// and browser will use the new chunk instead of the cached chunk
//
// Note that main.js and vendor.js will also become 
// main.[chunkhash].js and vendor.[chunkhash].js respectively
// so either change that in the index.html
// or another strategy of your choosing to deal with that separately
//
// In one projects I'm working on, a script in our package.json copies
// main.[chunkhash].js to main.js
// Then, our html template is updated our overarching build script to be
// `<script src="main.js?v=xx.xx"></script>`
//
config.output.filename = '[name].[chunkhash].js'

// re-export
module.exports = config
