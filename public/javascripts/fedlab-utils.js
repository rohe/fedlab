(function ($, exports) {

	exports.FedLabUtils = {
		guid: function() {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r, v;
				r = Math.random() * 16 | 0;
				v = c === 'x' ? r : r & 3 | 8;
				return v.toString(16);
			}).toUpperCase();
		}
	};
	
})(jQuery, window);

