var HTTPSnippet = require('httpsnippet');
var cheerio = require('cheerio');
var util = require('./util');
var host = require('./host');

var slugify = util.slugify;
var _extends = util._extends;
var sanitize = util.sanitize;
var capitalize = util.capitalize;
var highlight = util.highlight;
var at = util.at;
var markdownIt = require('markdown-it');

var md = markdownIt({
	html: true,
	linkify: true,
	typographer: true
}).use(require('markdown-it-anchor'), {
	permalink: true
});

module.exports = function parse(result, current, parent) {
	switch(result.element) {
		case 'copy': 
			parent.description = markdown(result.content);
			current = undefined;
			break;
		case 'parseResult' :
			current.type = 'result';
			current.content = sanitize(
				result.content.map(
					function(c) { 
						return parse(c, {}, current) 
					}
				)
			);
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
					current.id = 'group-' + slugify(meta.title || parent.title);
					current.title = meta.title;
					current.content = sanitize(
						result.content.map(
							function(c) {
								return parse(c, {}, current)
							}
						)
					);
					break;
			}
			break;
		case 'resource':
			var meta = getMeta(result.meta);
			current.type = 'resource';
			current.title = meta.title;
			current.id = 'resource-' + slugify(meta.title);
			current.props = getProps(result.attributes);
			current.content = sanitize(
				result.content.map(
					function(c) {
						return parse(c, {}, current)
					}
				)
			);
			break;
		case 'transition':
			var meta = getMeta(result.meta);
			current.type = 'transition';
			current.title = meta.title;
			current.props = getProps(result.attributes);
			current.content = sanitize(result.content.map(function(c) { return parse(c, {}, current) }));
			var method = at(current, 'content.0.content.0.props.method'); 
			current.id = 'transition-' + slugify(meta.title + '-' + method);
			current.xhrContent = xhrContent(current, parent);
			current.snippet = unescape((new HTTPSnippet(current.xhrContent)).convert('shell', 'curl'));
			current.snippets = [];

			var lang = [{ 
				name: 'curl',
				target: 'shell',
				type: 'curl'
			},{
				name: 'node',
				target: 'node',
				type: 'request'
			}, {
				name: 'python',
				target: 'python',
				type: 'python3'
			},{
				name: 'java',
				target: 'java',
				type: 'okhttp'
			}, {
				name: 'ruby',
				target: 'ruby',
				type: 'native'
			}, {
				name: 'php',
				target: 'php',
				type: 'ext-curl'
			}, {
				name: 'go',
				target: 'go',
				type: 'native'
			}];
			
			lang.forEach(function(l) {
				current.snippets[l.name] = highlight(
					unescape((new HTTPSnippet(current.xhrContent)).convert(l.target, l.type)));
			});

			break;
		case 'dataStructure':
			var meta = getMeta(result.meta);
			current.type = 'dataStructure';
			current.content = result.content;
			var trId = capitalize(current.content[0] && current.content[0].meta && current.content[0].meta.id)
            if (trId) {
			    current.id = 'object-' + slugify(trId);
			    current.title = trId + ' Object';
            }
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
				current.content = highlight(result.content);	
			}
			break;
		default:
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
				wfn : variable.meta && variable.meta.description,
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

function parseDatastructures(dataStructures) {
	return dataStructures.map(function(ds) {
		var content = ds.content && ds.content[0];
		var id = content.meta && content.meta.id;
		return { id: id , content: content };
	})
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
	var HOST = host.get();
	var httpRequest = at(transition, 'content.0.content.0'); 
	var requestProps = httpRequest && httpRequest.props;
	requestProps = requestProps || {};
	transProps = transition.props || {};
	var method = requestProps && requestProps.method;
	var urlParameters = _extends(transProps.urlParameters, requestProps.urlParameters);
	var headers = requestProps.headers;
	var postData = httpRequest.content.find(function(c) { return c.type=== 'body' } );
	var mimeType = headers.find(function(c) { 
		return c.type=== 'Content-Type' 
	} ) || 'application/json';
	postData = postData && postData.content;
	var url = requestProps.url || transProps.url, 
		queryStrings=[];


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
