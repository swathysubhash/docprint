var hljs = require('highlight.js');

function slugify(text) {
  return encodeURI(text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[\]\[\!\"\#\$\%\&\'\(\)\*\+\,\.\/\:\;\<\=\>\?\@\\\^\_\{\|\}\~]/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, ''));
}

var _extends = Object.assign || function (target) { 
	for (var i = 1; i < arguments.length; i++) { 
		var source = arguments[i];
		for (var key in source) {
			if (Object.prototype.hasOwnProperty.call(source, key)) {
				target[key] = source[key]; 
			} 
		} 
	} 
	return target;
};

function sanitize(arr) {
	return arr.filter(function(a) {return a});
}

function capitalize(string) {
	return string && string.charAt(0).toUpperCase() + string.slice(1);
}
	
function at(o, path, def) {
    var pointer = o,
        failed = false;

    if (!o || !path) {
        return o;
    }
    path.split('.').forEach(function(p) {
        if (pointer[p] !== null && pointer[p] !== undefined && !failed) {
            pointer = pointer[p];
        } else {
            failed = true;
        }
    });
    return failed ? (o[path] || def) : pointer;
}


function stripSlash(str) {
    if(str.substr(-1) === '/') {
        return str.substr(0, str.length - 1);
    }
    return str;
}

function highlight(str, lang) {
	try {
	return '<pre class="hljs"><code>' +
		hljs.highlightAuto(str, ['JavaScript', 'JSON', 'HTTP', 'Java', 'Python', 'Ruby', 'PHP']).value +
		'</code></pre>';
	} catch (__) {}
    return str;
}


module.exports = {
	slugify: slugify,
	_extends: _extends,
	sanitize: sanitize,
	capitalize: capitalize,
	at: at,
	stripSlash: stripSlash,
	highlight: highlight
}