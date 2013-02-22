define(function(require, exports, module) {

	var 
		Class = require('lib/resig'),
		SDPlugin = require('./SDPlugin');
		
	var body_decompose =  function body_decompose(qs){
		qsa = qs.split('&');
		result = new Object();
		for (var kv in qsa) {
			var kva = qsa[kv].split('=');
			var k = kva[0];
			var v = kva.slice(1, kva.length).join("=");
			result[k] = result[k] || new Array();
			result[k].push(v);
		}
		return result;
	}

	var SDPluginPostBody = SDPlugin.extend({
		init: function(sd) { 
			this._super(sd, 'postbody');
			sd.registerEncoder('HTTP-POST Body', this);
		},
		detect: function(input) {
			var match = /^([a-zA-Z0-9]+=[a-zA-Z0-9%+]+&?)+$/gi;
			console.log("Checking SDPluginPostBody", input.message.match(match));
			return input.message.match(match);
		},
		decode: function(input) {
			var inflated, decoded, decomposed;

			decomposed = body_decompose(input.message);
			for(var key in decomposed) {
				if (decomposed.hasOwnProperty(key)) {
					if (key === 'SAMLResponse') {
						msg = decodeURIComponent(decomposed[key][0]);
					}
					if (key === 'SAMLRequest') {
						msg = decodeURIComponent(decomposed[key][0]);
					}
					if (key === 'RelayState') {
						input.relaystate = decodeURIComponent(decomposed[key][0]);
					}
				}
			}

			console.log("Decomposed", decomposed);

			this.sd.debug('About to decode  HTTP POST <pre>' + msg.replace(/</g, '&lt;') + '</pre>');

			decoded = $.base64.decode(msg);
			this.sd.debug('decoded: <pre>' + decoded.replace(/</g, '&lt;') + '</pre>');

			input.message = decoded;

			return input;
		},
		encode: function(input) {
			var encoded, body, msg;

			this.sd.debug('About to encode <pre>' + input.message.replace(/</g, '&lt;') + '</pre>');
			encoded = $.base64.encode(input.message);
			this.sd.debug('Base64 encoded <pre>' + encoded.replace(/</g, '&lt;') + '</pre>');

			body = 'SAMLResponse=' + encodeURIComponent(encoded);
			if (input.relaystate) {
				body += '&RelayState=' + encodeURIComponent(input.relaystate);
			}

			input.message = body;
			return input;
		}
	});

	return SDPluginPostBody;
});