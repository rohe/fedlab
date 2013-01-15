define(function(require, exports, module) {

	var Class = require('lib/resig');

	var SDPlugin = Class.extend({
		init: function(sd, type) {
			this.sd = sd;
			this.type = type;
		},
		detect: function() {
			alert("Not implemented");
		},
		getType: function() {
			return this.type;
		}
	});

	return SDPlugin;
});