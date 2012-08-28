define(function() {

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