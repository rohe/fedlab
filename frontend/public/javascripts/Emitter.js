define(function(require, exports, module) {
		

	var
		$ = require('jquery');

	var Emitter = {
		on: function(type, callback) {
			if (!this._callbacks) this._callbacks = {};
			if (!this._callbacks[type]) this._callbacks[type] = [];
			this._callbacks[type].push(callback);
			return this;
		},
		emit: function(type) {
			var 
				that = this,
				args = arguments;

			if (!this._callbacks) this._callbacks = {};
			if (this._callbacks[type]) {
				$.each(this._callbacks[type], function(i, c) {
					that._callbacks[type][i].apply(this, Array.prototype.slice.call(args, 1))
				});
			}
		}
	};

	return Emitter;

});