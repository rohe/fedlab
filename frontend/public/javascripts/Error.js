define(function(require, exports, module) {
	

	var Error = function(text) {
		this.message = text;
	}

	Error.prototype.getMessage = function() {
		return this.message;
	}

	return Error;
});
