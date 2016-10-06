function slugify(text)
{
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
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

module.exports = {
	slugify: slugify,
	_extends: _extends,
	sanitize: sanitize,
	capitalize: capitalize
}