define(function(require, exports, module) {
	
	var 
		syntaxHighlight = require('../lib/syntaxhighlight');

	var TestItemResult = function(obj) {
		for(var k in obj) {
			if (obj.hasOwnProperty(k)) this[k] = obj[k];
		}
	}
	TestItemResult.prototype.getStatusTag = function () {
		if (typeof this.status === undefined || this.status === null) return "info";
		switch(this.status) {
			case 0: return "info";
			case 1: return "success";
			case 2: return "warning";
			case 3: return "error";
			case 4: return "critical";
			default: return "info";
		}
	}

	TestItemResult.prototype.getMessage = function() {
		if (!this.message) return '';
		return this.message;
	}
	TestItemResult.prototype.getMessageSyntaxHighlighted = function() {
		if (!this.message) return '';
		return syntaxHighlight(this.message);
	}
	TestItemResult.prototype.hasMessage = function() {
		return !!(this.message);
	}
	TestItemResult.prototype.hasMessageClass = function() {
		return this.hasMessage() ? 'hasMessage' : '';
	}

	return TestItemResult;

});

