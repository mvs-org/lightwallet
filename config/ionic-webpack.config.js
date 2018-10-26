var webpack = require('webpack');
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
updateEnvironmentFlags();
if (process.env.IONIC_ENV !== 'dev')
    config.output.filename = '[name].[chunkhash].js';

// re-export
module.exports = config;

function updateEnvironmentFlags() {
    String.prototype.capitalizeFirstLetter = function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };

    process.env.IONIC_FLAVOR = (typeof process.env.IONIC_FLAVOR) != "undefined" ?
        process.env.IONIC_FLAVOR : getDefaultFlavorForEnv(process.env.IONIC_ENV);

    process.env.IONIC_BUILDTYPE = (typeof process.env.IONIC_BUILDTYPE) != "undefined" ?
        process.env.IONIC_BUILDTYPE : getDefaultBuildTypeForEnv(process.env.IONIC_ENV);

    process.env.IONIC_VARIANT = (typeof process.env.IONIC_VARIANT) != "undefined" ?
        process.env.IONIC_VARIANT : getAndroidVariant(process.env.IONIC_BUILDTYPE, process.env.IONIC_FLAVOR);

    console.log("Env is " + process.env.IONIC_ENV);
    console.log("Build type is " + process.env.IONIC_BUILDTYPE);
    console.log("Build flavor is " + process.env.IONIC_FLAVOR);
    console.log("Build variant is " + process.env.IONIC_VARIANT);
}

function getDefaultBuildTypeForEnv(env_string) {
    var result = "debug";
    switch (env_string) {
        case "prod":
            result = "release";
            break;
        default:
            result = "debug";
    }
    return result;
}

function getAndroidVariant(buildType, flavor) {
    var result = flavor + buildType.capitalizeFirstLetter();
    return result;
}
// Get the default "build flavor" if one is not specified.  For dev builds, 
// this will be "local" -- since just running "ionic serve" you would expect 
// it to try to connect to a local backend server. For production builds, 
// it will default to the production flavor as a safeguard in case it is not 
// explicitly set. For flavors like "dev" or "test" where you are trying to
// indicate that the app should connect to a shared dev or test backend 
// server, the build flavor will have to be set explicitly in the 
// environment.
function getDefaultFlavorForEnv(env_string) {
    var result = "local";
    switch (env_string) {
        case "prod":
            result = "production";
            break;
        default:
            result = "local";
    }
    return result;
}
