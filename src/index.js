require('./patch');

var drafter = require('drafter');
var fs = require('fs');
var pug = require('pug');
var parse = require('./parse');
var mkdir = require('mkdirp');
var util = require('./util');
var host = require('./host');


var slugify = util.slugify;
var at = util.at;
var capitalize = util.capitalize;
var stripSlash = util.stripSlash;

module.exports = function(options) {
	options = options || {};
	var filePath = stripSlash(options.filepath),
		destFolder = stripSlash(options.destination || filePath),
		header = options.header,
		headerhtml = options.headerhtml,
		cssFile = options.css,
		customCSS;

	if (cssFile) {
		customCSS = fs.readFileSync(cssFile).toString();
	}
	if(header) {
		headerhtml = fs.readFileSync(header).toString();
	}

	try {
	  	var result = drafter.parseSync(fs.readFileSync(filePath).toString(), {
	  		requireBlueprintName: true
	  	});
	  	setHost(result);
	  	var output = {};
	  	parse(result, output);
	  
		var dataStructures = at(output, 'content.0.content');
		dataStructures = dataStructures && dataStructures.find(function(c){ return c.type === 'dataStructures'; } ) || [];
		dataStructures = dataStructures && dataStructures.content;

		var css = fs.readFileSync(process.cwd() + '/src/css/style.css').toString();
		var langs = ['curl', 'node', 'python', 'java', 'ruby', 'php', 'go'];

		langs.forEach(function(l) {
			mkdir.sync(destFolder + '/' + l);
			require('fs').writeFileSync(destFolder + '/' + l +  '/index.html', 
				pug.renderFile(process.cwd() + '/src/jade/index.pug', { 
					output : output, 
					css: css, 
					headerContent: headerhtml,
					customCSS: customCSS,
					dataStructures: dataStructures, 
					capitalize: capitalize, 
					lang: l
			}));
		});
	} catch (err) {
	  console.log(err, err.stack);
	}

}

function setHost(result) {
	var metas = at(result, 'content.0.attributes.meta');
	var hostMeta = metas.find(function(m) {
		return at(m, 'content.key.content') === 'HOST';
	});stripSlash
	host.set(stripSlash(at(hostMeta, 'content.value.content')) || 'http://{host}');
}

