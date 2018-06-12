let fs= require('fs');
var package = require('../package.json');

let version_num=package.version;
console.info("Add version tag "+version_num);
versionize('./src/index.html', './www/index.html', version_num, ['main.js','main.css','vendor.js','polyfills.js','cordova.js']);

function versionize(src_file, target_file, version, targets){
	var content = fs.readFileSync(src_file, 'utf8');
	targets.forEach(target=>{
		content=content.replace(target, target+"?version="+version);
	});
	fs.writeFileSync(target_file, content, 'utf8');
	return content;
}
