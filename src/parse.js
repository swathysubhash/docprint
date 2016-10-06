
var HTTPSnippet = require('httpsnippet');
var cheerio = require('cheerio');

var md = require('markdown-it')({
  html: true,
  linkify: true,
  typographer: true
}).use(require('markdown-it-anchor'), {
	permalink: true
});



var util = require('./util');
var slugify = util.slugify;

module.exports = function parse(result, current, parent) {
	switch(result.element) {
		case 'copy': 
			parent.description = markdown(result.content);
			current = undefined;
			break;
		case 'parseResult' :
			current.type = 'result';
			current.content = sanitize(result.content.map(function(c) { return parse(c, {}, current) }));
			break;
		case 'category':
			var meta = getMeta(result.meta);
			current.type = meta.class;
			switch(current.type) {
				case 'dataStructures':
					var meta = getMeta(result.meta);
					current.type = 'dataStructures';
					current.title = meta.title;
					current.content = parseDatastructures(result.content);
					break;
				default:
					current.id = 'group-' + slugify(meta.title);
					current.title = meta.title;
					current.content = sanitize(result.content.map(function(c) { return parse(c, {}, current) }));
					break;
			}
			break;
		case 'resource':
			var meta = getMeta(result.meta);
			current.type = 'resource';
			current.title = meta.title;
			current.id = 'resource-' + slugify(meta.title);
			current.props = getProps(result.attributes);
			current.content = sanitize(result.content.map(function(c) { return parse(c, {}, current) }));
			break;
		case 'transition':
			var meta = getMeta(result.meta);
			current.type = 'transition';
			current.title = meta.title;
			current.props = getProps(result.attributes);
			current.content = sanitize(result.content.map(function(c) { return parse(c, {}, current) }));
			var method = current.content[0] 
				&& current.content[0].content 
				&& current.content[0].content[0] 
				&& current.content[0].content[0].props 
				&& current.content[0].content[0].props.method;
			current.id = 'transition-' + slugify(meta.title + '-' + method);
			current.xhrContent = xhrContent(current, parent);
			current.snippet = unescape((new HTTPSnippet(current.xhrContent)).convert('shell', 'curl'));
			break;
		case 'dataStructure':
			var meta = getMeta(result.meta);
			current.type = 'dataStructure';
			// current.title = meta.title;
			current.content = result.content;
			var trId = capitalize(current.content[0] && current.content[0].meta && current.content[0].meta.id)
			current.id = 'object-' + slugify(trId);
			current.title = trId + ' Object';
			break;
		case 'httpTransaction':
			var meta = getMeta(result.meta);
			current.type = 'httpTransaction';
			current.title = meta.title;
			current.props = {};
			current.content = sanitize(result.content.map(function(c) { return parse(c, {}, current) }));
			break;
		case 'httpRequest':
			var meta = getMeta(result.meta);
			current.type = 'httpRequest';
			current.title = meta.title;
			current.props =  getProps(result.attributes);
			current.xhr = xhr(current);
			current.content = sanitize(result.content.map(function(c) { return parse(c, {}, current) }));
			break;
		case 'httpResponse':
			var meta = getMeta(result.meta);
			current.type = 'httpResponse';
			current.title = meta.title;
			current.props = getProps(result.attributes);
			current.content = sanitize(result.content.map(function(c) { return parse(c, {}, current) }));
			break;
		case 'asset':
			var meta = getMeta(result.meta);
			if (meta.class === 'messageBody') {
				current.type = 'body';
				current.title = meta.title;
				current.content = result.content;	
			}
			break;
		default:
			// console.log('not doing anything for', result.element)
	}
	return current;
}

function getMeta(meta) {
	meta = meta || {};
	var claz = '';
	if (meta.classes && Array.isArray(meta.classes)) {
		claz = meta.classes[0]
	}
	return {
		class: claz,
		title: meta.title
	}
}

function getProps(props){
	props = props || {};
	var url = props.href;
	var statusCode = props.statusCode;
	var method = props.method;
	var urlParameters = [];
	var headers = [];
	var data = '';
	try {
		props.hrefVariables.content.forEach(function(variable) {
			urlParameters.push({
				description: variable.meta && variable.meta.description,
				key: variable.content && variable.content.key,
				value: variable.content && variable.content.value
			})
		});	
	} catch (e) {
	}
	try {
		props.headers.content.forEach(function(variable) {
			headers.push({
				key: variable.content && variable.content.key,
				value: variable.content && variable.content.value
			})
		});	
	} catch (e) {
	}

	if (props.data && props.data.element === 'dataStructure') {
		data = props.data.content;
		// console.log('@@@', JSON.stringify(props.data, 0 ,2));
		// var content = props.data.content;
		// if (Array.isArray(content)) {
		// 	data = sanitize(props.data.content.map(function(c) { 
		// 		if(c.content) 
		// 			return parseDs(c.content) 
		// 		else 
		// 			return parseDs(c)
		// 	}));
		// } else {
		// 	data = parseDs(props.data.content);
		// }
	}
	return {
		url: url,
		method: method,
		data: data,
		headers: headers,
		statusCode: statusCode,
		urlParameters: urlParameters
	}
	
}

function getCopy(content) {
	try {
		return content.find(function(c) { return c.element === 'copy' }).content;	
	}
	catch (e) {
		console.error('Error while printing content of a copy')
		return '';
	}
}


function xhr(request) {
	return '';
	var obj = {
		method: 'unknwo',
		url: '',
		httpVersion: "unknown",
		cookies: [],
		headers: [],
		queryString: [],
		postData: [],
		headersSize: -1,
		bodySize: -1,
		comment: ''
	};
	var qS = {
        name: "param1",
        value: "value1",
        comment: ""
    };

    var pD = {
    	mimeType: '',
    	params: [{
    		name: '',
    		value: ''
    	}],
    	text : '',
    	comment: ''
    }
}


function parseDatastructures(dataStructures) {
	return dataStructures.map(function(ds) {
		var content = ds.content && ds.content[0];
		var id = content.meta && content.meta.id;
		return { id: id , content: content };
	})
	// var result = {};
	// dataStructures.forEach(function(ds) {
	// 	ds = ds.content[0];
	// 	if (ds.meta && ds.meta.id) {
	// 		result[ds.meta.id] = parseDs(ds.content);
	// 	}
	// });
	// return result;
}


function markdown(description) {
	var mdText = md.render(description);
	var $ = cheerio.load(mdText);
	return {
		text: mdText,
		links: $('.header-anchor').map(function(index, el) { return $(el).attr('href'); }).toArray()
	}
}

function xhrContent(transition, resource) {
	var HOST = 'http://api.myntra.com'
	var httpRequest = transition.content[0] 
				&& transition.content[0].content 
				&& transition.content[0].content[0];
	var requestProps = httpRequest && httpRequest.props;
	requestProps = requestProps || {};
	transProps = transition.props || {};
	var method = requestProps && requestProps.method;
	var urlParameters = _extends(transProps.urlParameters, requestProps.urlParameters);
	var headers = requestProps.headers;
	var postData = httpRequest.content.find(function(c) { return c.type=== 'body' } );
	var mimeType = headers.find(function(c) { return c.type=== 'Content-Type' } ) || 'application/json';
	postData = postData && postData.content;

	var url = requestProps.url || transProps.url, 
		queryStrings=[];

	// TODO ::: Check for existence of url parameters in url
	if (!url && resource.type === 'resource') {
		url = resource.props && resource.props.url;
		if (resource.props.urlParameters) {
			urlParameters = _extends(resource.props.urlParameters, urlParameters) 
		}
	}

	hrefSplits = url && url.split('{?') || [];
	
	if (hrefSplits.length > 1) {
		url = hrefSplits[0];
		queryStrings = hrefSplits[1].replace('}', '').split(',');
	}
	queryStrings = queryStrings.map(function(qs) {
		qs = qs.trim();
		return {
			name: qs,
			value: '{' + qs + '}'
		}
	});

	var originalUrl = url;
	urlParameters.forEach(function(param) {
		var key = param.key && param.key.content;
		var value = param.value && param.value.content;
		if (typeof key !== 'undefined' && typeof value !== 'undefined') {
			if (url.indexOf('{' + key + '}') !== -1) {
				url = url.replaceAll('{' + key + '}', value);
			}
		}
	});
	
	return {
		method: method,
		url: HOST + url,
		originalUrl: HOST + originalUrl,
		httpVersion: 'unknown',
		queryString: queryStrings,
		headers: headers.map(function(h) {
			return {
				name: h.key && h.key.content,
				value: h.value && h.value.content
			}
		}),
		attributes: _extends(transProps.data, requestProps.data),
		urlParameters: urlParameters,
		postData: {
			mimeType: mimeType,
			postData: postData
		},
		headersSize: -1,
		bodySize: -1,
		comment: ''
	}
}


/***


function parseDs(ds) {
	var result = {};
	if (Array.isArray(ds)) {
		ds.forEach(function(d) {
			result = parseDsContent(d);
		})	
	} else {
		result = parseDsContent(ds);
	}
	return result;
}

function parseDsContent(d) {
	var result = {}, i = 0;
	var c = d.content;
	if (!c || (!c.key && !c.value)) {
		result.ref = {};
		result.ref[i++] = {
			ds: d.element
		}
		d.meta && d.meta.id && (result.ref.type = d.meta.id);
	} else if (c.value.element === 'object') {
		result[c.key.content] = {
			key: c.key,
			value: c.value,
			nested: true,
		};
		result[c.key.content].value.content = parseDs(c.value.content);
	} else if (c.key && c.value && c.key.content) {
		result[c.key.content] = {
			key: c.key,
			value: c.value
		}
	}
	return result;
}

**/