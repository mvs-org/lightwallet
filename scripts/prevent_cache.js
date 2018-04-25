let fs= require('fs');
var package = require('../package.json');

let version_num=package.version;
console.info("Add version tag "+version_num);
var index_orig = fs.readFileSync('./src/index.html', 'utf8');
var index_new = index_orig.replace("main.js", "main.js?version="+version_num);
index_new = index_new.replace("main.css", "main.css?version="+version_num);
fs.writeFileSync('./www/index.html', index_new, 'utf8');
