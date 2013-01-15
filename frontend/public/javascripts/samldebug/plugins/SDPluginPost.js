define(function(require, exports, module) {

	var 
		Class = require('lib/resig'),
		SDPlugin = require('./SDPlugin');

	var SDPluginPost = SDPlugin.extend({
		init: function(sd) { 
			this._super(sd, 'post');
			sd.registerEncoder('HTTP-POST', this);
		},
		detect: function(input) {
			var match = /^[A-Za-z0-9+\/=]+$/gi; 
			if (input.message.match(match)) {
				console.log("Detect matches base64");
				return !this.isDeflated(input);
			}
			return false;
		},
		isDeflated: function(input) {
			var decoded, inflated;
			try {
				decoded = $.base64.decode(input.message);
				inflated = this.sd.wrapInflate(decoded);
				console.log("Check if SDPluginPost is influated", decoded, JSON.stringify(inflated));
				return inflated !== '';
			} catch (e) {
				return false;
			}

		},
		decode: function(input) {
			var inflated, decoded;

			this.sd.debug('About to decode  HTTP POST <pre>' + input.message.replace(/</g, '&lt;') + '</pre>');

			decoded = $.base64.decode(input.message);
			this.sd.debug('decoded: <pre>' + decoded.replace(/</g, '&lt;') + '</pre>');

			// inflated = RawDeflate.inflate(decoded);
			// this.sd.debug('inflated encoded <pre>' + inflated.replace(/</g, '&lt;') + '</pre>');
			// 
			input.message = decoded;

			return input;
		},
		encode: function(input) {
			var encoded;
			this.sd.debug('About to encode <pre>' + input.message.replace(/</g, '&lt;') + '</pre>');
			encoded = $.base64.encode(input.message);
			this.sd.debug('Base64 encoded <pre>' + encoded.replace(/</g, '&lt;') + '</pre>');

			input.message = encoded;
			return input;
		}
	});

	return SDPluginPost;
});