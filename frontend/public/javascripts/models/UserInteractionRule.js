define(function(require, exports, module) {

	var
		$ = require('jquery'),
		syntaxHighlight = require('../lib/syntaxhighlight');
	
	var UserInteractionRule = function(obj) {
		for(var k in obj) {
			if (obj.hasOwnProperty(k)) {
				this[k] = obj[k];
			}
		}

	}

	UserInteractionRule.prototype.controlTypeForm = function() {
		return this.control.type === 'form';
	}

	UserInteractionRule.prototype.controlTypeLink = function() {
		return this.control.type === 'link';
	}
	UserInteractionRule.prototype.getControlSet = function() {
		if (!this.control.set) return '';
		return syntaxHighlight(this.control.set);
	}


	return UserInteractionRule;
});