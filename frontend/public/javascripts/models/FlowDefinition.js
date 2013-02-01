define(function(require, exports, module) {

	var
		$ = require('jquery');
		// hogan = require('lib/hogan'),

		// TestExecDisplay = require('./TestExecDisplay');

	require('lib/base64/jquery.base64');
	
	var FlowDefinition = function(obj) {
		for(var k in obj) {
			if (obj.hasOwnProperty(k)) {
				this[k] = obj[k];
			}
		}
		this.sid = FlowDefinition.getSID(this.id);

	}

	/**
	 * Consider input in description to be trusted and to contain html if needed.
	 * @return {[type]} [description]
	 */
	FlowDefinition.prototype.getDescr = function() {
		if (!this.descr) return '';
		return this.descr.replace(/\n/g, "<br />");
	};

	FlowDefinition.prototype.hasDependencies = function() {
		if (!this.depends) return false;
		return (this.depends.length > 0);
	}


	FlowDefinition.prototype.getDependencies = function() {
		var d = [];
		if (!this.depends) return d;
		for(var i = 0; i < this.depends.length; i++) {
			d.push({
				id: this.depends[i],
				sid: FlowDefinition.getSID(this.depends[i])
			});
		}
		return d;
	}

	FlowDefinition.getSID = function(input) {
		return $.base64.encode(input).replace(/=/g, '');
	}


	return FlowDefinition;
});