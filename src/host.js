var host = 'http://{host}/';
module.exports = {
	get: function() {
		return host;
	},
	set: function(h) {
		host = h;
	}
}