define(function(require, exports, module) {

	var
		$ = require('jquery');
		// hogan = require('lib/hogan'),

		// TestExecDisplay = require('./TestExecDisplay');

	
	var FlowDefinition = function(obj) {
		for(var k in obj) {
			if (obj.hasOwnProperty(k)) {
				this[k] = obj[k];
			}
		}
	}
	FlowDefinition.prototype.hasDependencies = function() {
		if (!this.depends) return false;
		return (this.depends.length > 0);
	}
	FlowDefinition.prototype.getDescr = function() {
		if (this.descr) return '';
		return this.descr.replace(/\n/g, "<br />");
	};

	return FlowDefinition;
});