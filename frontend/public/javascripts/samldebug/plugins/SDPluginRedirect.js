define(['./SDPlugin'], function(SDPlugin) {

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
			if (input.message.match(match)) {
				return this.isDeflated(input.message);
			}
			return false;
		},
		isDeflated: function(input) {
			var decoded, inflated;
			decoded = $.base64.decode(input);
			inflated = this.sd.wrapInflate(decoded);
			console.log("Check if SDPluginRedirect is inflated", JSON.stringify(inflated));
			return inflated !== '';
		},
		decode: function(input) {
			var inflated, decoded;

			this.sd.debug('About to decode HTTP REDIRECT <pre>' + input.message.replace(/</g, '&lt;') + '</pre>');

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

