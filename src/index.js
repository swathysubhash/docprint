
var drafter = require('drafter');
var fs = require('fs');
var pug = require('pug');




try {
  var result = drafter
  				.parseSync(fs.readFileSync(process.cwd() + '/docs/apib/style.apib').toString(), {
  	requireBlueprintName: true
  });
  var output = {};
  parse(result, output);
  
  var dataStructures = (output.content 
  		&& output.content[0]
  		&& output.content[0].content 
  		&& output.content[0].content.find(function(c){ return c.type === 'dataStructures'; } )) || [];
  dataStructures = dataStructures && dataStructures.content;
  var css = require('fs').readFileSync(process.cwd() + '/src/style.css').toString();
  require('fs').writeFileSync(process.cwd() + '/docs/html/index.html',
   pug.renderFile(process.cwd() + '/src/index.pug', 
   	{ 
   		output : output, 
   		css: css, 
   		dataStructures: dataStructures, 
   		capitalize: capitalize 
   	}));
  
} catch (err) {
  console.log(err);
}
