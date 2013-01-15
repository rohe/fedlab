define(function(require, exports, module) {

	var 
		Class = require('lib/resig'),
		SDPlugin = require('./SDPlugin');
		
	/*
	 * This plugin handles URLencoded SAML parameter, as well as a full url including the encoded
	 * SAML response or request.
	 */
	var SDPluginRedirect = SDPlugin.extend({
		init: function(sd) { 
			this._super(sd, 'redirect');
			sd.registerEncoder('HTTP-Redirect', this);
		},
		detect: function(input) {
			var match = /^[A-Za-z0-9+\/=]+$/gi; 
			input.message = decodeURIComponent(input.message);
			console.log("Checking SDPluginRedirect", input.message, input.message.match(match));
			if (input.message.match(match)) {
				console.log("Matching SDPluginRedirect", this.isDeflated(input));
				return this.isDeflated(input);
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

			this.sd.debug('About to decode HTTP REDIRECT <pre>' + input.message.replace(/</g, '&lt;') + '</pre>');

			input.message = decodeURIComponent(input.message);

			decoded = $.base64.decode(input.message);
			// this.sd.debug('decoded: <pre>' + decoded.replace(/</g, '&lt;') + '</pre>');

			inflated = this.sd.wrapInflate(decoded);
			this.sd.debug('result <pre>' + inflated.replace(/</g, '&lt;') + '</pre>');

			input.message = inflated;

			return input;
		},
		encode: function(input) {
			var deflated, encoded;

			console.log("About to encode", JSON.stringify(input));

			this.sd.debug('About to encode <pre>' + input.message.replace(/</g, '&lt;') + '</pre>');
			deflated = this.sd.wrapDeflate(input.message, 9);
			this.sd.debug('deflated: <pre>' + deflated.replace(/</g, '&lt;') + '</pre>');
			encoded = $.base64.encode(deflated);
			this.sd.debug('Base64 encoded <pre>' + encoded.replace(/</g, '&lt;') + '</pre>');

			input.message = encoded;

			console.log("encoded it was ", JSON.stringify(input));
			return input;
		}
	});
	
	return SDPluginRedirect;
});

