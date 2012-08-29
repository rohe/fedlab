define(['./SDPlugin'], function(SDPlugin) {

	var url_decompose =  function url_decompose(url){
		if(url.indexOf('?') == -1){ return {path: url, params: {} }; }
		path = url.substring(0, url.indexOf('?'));//get the path before the ?
		qs = url.substring(url.indexOf('?')+1);
		qsa = qs.split('&');
		params = new Object();
		for (var kv in qsa) {
			var kva = qsa[kv].split('=');
			var k = kva[0];
			var v = kva.slice(1, kva.length).join("=");
			params[k] = params[k] || new Array();
			params[k].push(v);
		}
		return {path: path, params: params};
	}

	/*
	 * This plugin handles URLencoded SAML parameter, as well as a full url including the encoded
	 * SAML response or request.
	 */
	var SDPluginURL = SDPlugin.extend({
		init: function(sd) { 
			this._super(sd, 'url');
			sd.registerEncoder('HTTP-Redirect URL', this);
		},
		detect: function(input) {
			var urlmatch = /^[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
			var match = /^[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
			return input.message.match(urlmatch);
		},
		decode: function(input) {
			var encoded, inflated, decoded, decomposed, result = {};

			decomposed = url_decompose(input.message);

			if (input.relaystate) delete input.relaystate;

			input.dest = decomposed.path;
			for(var key in decomposed.params) {
				if (decomposed.params.hasOwnProperty(key)) {
					if (key === 'SAMLRequest') {
						encoded = decodeURIComponent(decomposed.params['SAMLRequest'][0]);
					}
					if (key === 'SAMLResponse') {
						encoded = decodeURIComponent(decomposed.params['SAMLResponse'][0]);
					}
					if (key === 'RelayState') {
						input.relaystate = decodeURIComponent(decomposed.params['RelayState'][0]);
					}
				}
			}
			// console.log("Result", decomposed, result, encoded);

			this.sd.debug('About to decode URL <pre>' + encoded.replace(/</g, '&lt;') + '</pre>');

			decoded = $.base64.decode(encoded);
			this.sd.debug('decoded: <pre>' + decoded.replace(/</g, '&lt;') + '</pre>');

			inflated = this.sd.wrapInflate(decoded);
			this.sd.debug('result <pre>' + inflated.replace(/</g, '&lt;') + '</pre>');

			input.message = inflated;

			return input;
		},
		encode: function(input) {
			var deflated, encoded, url;

			console.log("About to url encode", JSON.stringify(input));

			this.sd.debug('About to encode <pre>' + input.message.replace(/</g, '&lt;') + '</pre>');
			deflated = this.sd.wrapDeflate(input.message);

			this.sd.debug('deflated: <pre>' + deflated.replace(/</g, '&lt;') + '</pre>');
			encoded = $.base64.encode(deflated);

			this.sd.debug('Base64 encoded <pre>' + encoded.replace(/</g, '&lt;') + '</pre>');

			url = input.dest + '?SAMLRequest=' + encodeURIComponent(encoded);
			if (input.relaystate) {
				url += '&RelayState=' + encodeURIComponent(input.relaystate);
			}

			input.message = url;

			return input;
		}
	});

	return SDPluginURL;
});