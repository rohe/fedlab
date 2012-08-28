define(['resig'], function(Class) {


	var wrapInflate = function(str) {
		// var out;
		// var res = puff(out, str);
		// console.log("RES", res);
		// return out;
		// return JSInflate.inflate(str);
		return RawDeflate.inflate(str);
	}
	var wrapDeflate = function(str) {
		return RawDeflate.deflate(str, 9);
	}
	// function utf8_to_b64( str ) {
	//     return window.btoa(unescape(encodeURIComponent( str )));
	// }

	// function b64_to_utf8( str ) {
	//     return decodeURIComponent(escape(window.atob( str )));
	// }

	// function stringToBytes ( str ) {
	//   var ch, st, re = [];
	//   for (var i = 0; i < str.length; i++ ) {
	//     ch = str.charCodeAt(i);  // get char 
	//     st = [];                 // set up "stack"
	//     do {
	//       st.push( ch & 0xFF );  // push byte to stack
	//       ch = ch >> 8;          // shift value down by 1 byte
	//     }  
	//     while ( ch );
	//     // add stack contents to result
	//     // done because chars have "wrong" endianness
	//     re = re.concat( st.reverse() );
	//   }
	//   // return an array of bytes
	//   return re;
	// }

	// var str = "eJxLBAAAYgBi";
	// var str2 = $.base64.decode(str);

	// console.log("Base 64 encoder string", str);
	// console.log("Compressed string (decoded from base64)", str2);
	// console.log("Compressed string (byte array)", stringToBytes(str2));
	// console.log("Decompressed: ", JSON.stringify(wrapInflate(str2)));


	// var t = 'a';
	// console.log("Encode", t, JSON.stringify(wrapDeflate(t)))
	// 

	function url_decompose(url){
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

	// console.log(url_decompose('https://idp.example.org/SAML2/SSO/Redirect?SAMLRequest=fZFfa8IwFMXfBb9DyXvaJtZ1BqsURRC2Mabbw95ivc5Am3TJrXPffmmLY3%2FA15Pzuyf33On8XJXBCaxTRmeEhTEJQBdmr%2FRbRp63K3pL5rPhYOpkVdYib%2FCon%2BC9AYfDQRB4WDvRvWWksVoY6ZQTWlbgBBZik9%2FfCR7GorYGTWFK8pu6DknnwKL%2FWEetlxmR8sBHbHJDWZqOKGdsRJM0kfQAjCUJ43KX8s78ctnIz%2Blp5xpYa4dSo1fjOKGM03i8jSeCMzGevHa2%2FBK5MNo1FdgN2JMqPLmHc0b6WTmiVbsGoTf5qv66Zq2t60x0wXZ2RKydiCJXh3CWVV1CWJgqanfl0%2Bin8xutxYOvZL18NKUqPlvZR5el%2BVhYkAgZQdsA6fWVsZXE63W2itrTQ2cVaKV2CjSSqL1v9P%2FAXv4C'));


	var SAMLdebug;


	var SDPlugin = Class.extend({
		init: function(sd, type) {
			this.sd = sd;
			this.type = type;
		},
		detect: function() {
			alert("Not implemented");
		},
		getType: function() {
			return this.type;
		}
	});
	


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
			if (input.match(match)) {
				return this.isDeflated(input);
			}
			return false;
		},
		isDeflated: function(input) {
			var decoded, inflated;
			decoded = $.base64.decode(input);
			inflated = wrapInflate(decoded);
			console.log("Check if SDPluginRedirect is inflated", JSON.stringify(inflated));
			return inflated !== '';
		},
		decode: function(input) {
			var inflated, decoded;

			this.sd.debug('About to decode HTTP REDIRECT <pre>' + input.replace(/</g, '&lt;') + '</pre>');

			decoded = $.base64.decode(input);
			// this.sd.debug('decoded: <pre>' + decoded.replace(/</g, '&lt;') + '</pre>');

			inflated = wrapInflate(decoded);
			this.sd.debug('result <pre>' + inflated.replace(/</g, '&lt;') + '</pre>');

			return inflated;
		},
		encode: function(input) {
			var deflated, encoded;
			this.sd.debug('About to encode <pre>' + input.replace(/</g, '&lt;') + '</pre>');
			deflated = wrapDeflate(input, 9);
			this.sd.debug('deflated: <pre>' + deflated.replace(/</g, '&lt;') + '</pre>');
			encoded = $.base64.encode(deflated);
			this.sd.debug('Base64 encoded <pre>' + encoded.replace(/</g, '&lt;') + '</pre>');
			return encoded;
		}
	});

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
			return input.match(urlmatch);
		},
		decode: function(input) {
			var encoded, inflated, decoded, decomposed, result = {};


			decomposed = url_decompose(input);

			result.dest = decomposed.path;
			for(var key in decomposed.params) {
				if (decomposed.params.hasOwnProperty(key)) {
					if (key === 'SAMLRequest') {
						encoded = decodeURIComponent(decomposed.params['SAMLRequest'][0]);
					}
				}
			}
			console.log("Result", decomposed, result, encoded);

			this.sd.debug('About to decode URL <pre>' + encoded.replace(/</g, '&lt;') + '</pre>');

			decoded = $.base64.decode(encoded);
			this.sd.debug('decoded: <pre>' + decoded.replace(/</g, '&lt;') + '</pre>');

			inflated = wrapInflate(decoded);
			this.sd.debug('result <pre>' + inflated.replace(/</g, '&lt;') + '</pre>');

			return inflated;
		},
		encode: function(input) {
			var deflated, encoded;
			this.sd.debug('About to encode <pre>' + input.replace(/</g, '&lt;') + '</pre>');
			deflated = wrapDeflate(input);
			this.sd.debug('deflated: <pre>' + deflated.replace(/</g, '&lt;') + '</pre>');
			encoded = $.base64.encode(deflated);
			this.sd.debug('Base64 encoded <pre>' + encoded.replace(/</g, '&lt;') + '</pre>');
			return encoded;
		}
	});

	var SDPluginPost = SDPlugin.extend({
		init: function(sd) { 
			this._super(sd, 'post');
			sd.registerEncoder('HTTP-POST', this);
		},
		detect: function(input) {
			var match = /^[A-Za-z0-9+\/=]+$/gi; 
			if (input.match(match)) {
				return !this.isDeflated(input);
			}
			return false;
		},
		isDeflated: function(input) {
			var decoded, inflated;
			decoded = $.base64.decode(input);
			inflated = wrapInflate(decoded);
			console.log("Check if SDPluginPost is influated", decoded, JSON.stringify(inflated));
			return inflated !== '';
		},
		decode: function(input) {
			var inflated, decoded;

			this.sd.debug('About to decode  HTTP POST <pre>' + input.replace(/</g, '&lt;') + '</pre>');

			decoded = $.base64.decode(input);
			this.sd.debug('decoded: <pre>' + decoded.replace(/</g, '&lt;') + '</pre>');

			// inflated = RawDeflate.inflate(decoded);
			// this.sd.debug('inflated encoded <pre>' + inflated.replace(/</g, '&lt;') + '</pre>');

			return decoded;
		},
		encode: function(input) {
			var encoded;
			this.sd.debug('About to encode <pre>' + input.replace(/</g, '&lt;') + '</pre>');
			encoded = $.base64.encode(input);
			this.sd.debug('Base64 encoded <pre>' + encoded.replace(/</g, '&lt;') + '</pre>');
			return encoded;
		}
	});


	SAMLdebug = function(el) {
		this.el = el;

		this.active = false;
		this.plugins = [];

	
		this.plugins.push(new SDPluginURL(this));
		this.plugins.push(new SDPluginRedirect(this));
		this.plugins.push(new SDPluginPost(this));

		$(this.el).on('change', '#samlinput', $.proxy(function() {
			var input = this.el.find("#samlinput").val();
			this.detect();
		}, this));

		$(this.el).on('click', '.insertExample', $.proxy(this.insertExample, this))

		$(this.el).on('click', '.actionbar button', $.proxy(this.action, this));

	};

	SAMLdebug.prototype.isSAML = function(issaml) {
		if (issaml === null) {
			$(this.el).find('button#decode').addClass("disabled");
			$(this.el).find('#encoders').addClass("disabled");
		} else if (issaml) {
			$(this.el).find('button#decode').addClass("disabled");
			$(this.el).find('#encoders').removeClass("disabled");
		} else {
			$(this.el).find('button#decode').removeClass("disabled");
			$(this.el).find('#encoders').addClass("disabled");
		}
	}

	SAMLdebug.prototype.registerEncoder = function(text, plugin) {
		var encoderID = 'encoder_' + plugin.getType();
		var html = '<li><a id="' + encoderID + '" class="encoder" href="#">' + text + '</a></li>'
		$(this.el).find('#encoderList').append(html);
		
		$(this.el).on('click', '#' + encoderID, $.proxy(function() {
			this.setInput(plugin.encode(this.getInput()));
		}, this));
	},

	SAMLdebug.prototype.action = function(e) {
		e.preventDefault();
		var id = $(e.currentTarget).attr('id');
		var input = this.getInput();

		this.cleanlog();

		if (id === 'decode') {
			this.setInput(this.active.decode(input));
		} else {
			console.error('Undefined action for this action button');
		}
	}

	SAMLdebug.prototype.insertExample = function(e) {
		var 
			type = $(e.currentTarget).data('example'),
			examples = {
				"xml": '<samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" ID="agdobjcfikneommfjamdclenjcpcjmgdgbmpgjmo" Version="2.0" IssueInstant="2007-04-26T13:51:56Z" ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" ProviderName="google.com" AssertionConsumerServiceURL="https://www.google.com/a/solweb.no/acs" IsPassive="true"><saml:Issuer xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">google.com</saml:Issuer><samlp:NameIDPolicy AllowCreate="true" Format="urn:oasis:names:tc:SAML:2.0:nameid-format:unspecified" /></samlp:AuthnRequest>',
				"url": 'https://idp.example.org/SAML2/SSO/Redirect?SAMLRequest=fZFfa8IwFMXfBb9DyXvaJtZ1BqsURRC2Mabbw95ivc5Am3TJrXPffmmLY3%2FA15Pzuyf33On8XJXBCaxTRmeEhTEJQBdmr%2FRbRp63K3pL5rPhYOpkVdYib%2FCon%2BC9AYfDQRB4WDvRvWWksVoY6ZQTWlbgBBZik9%2FfCR7GorYGTWFK8pu6DknnwKL%2FWEetlxmR8sBHbHJDWZqOKGdsRJM0kfQAjCUJ43KX8s78ctnIz%2Blp5xpYa4dSo1fjOKGM03i8jSeCMzGevHa2%2FBK5MNo1FdgN2JMqPLmHc0b6WTmiVbsGoTf5qv66Zq2t60x0wXZ2RKydiCJXh3CWVV1CWJgqanfl0%2Bin8xutxYOvZL18NKUqPlvZR5el%2BVhYkAgZQdsA6fWVsZXE63W2itrTQ2cVaKV2CjSSqL1v9P%2FAXv4C',
				"redirect": "fZJNT+MwEIbvSPwHy/d8tMvHympSdUGISuwS0cCBm+tMUwfbk/U4zfLvSVMq2Euv45n3fd7xzOb/rGE78KTRZXwSp5yBU1hpV2f8ubyLfvJ5fn42I2lNKxZd2Lon+NsBBTZMOhLjQ8Y77wRK0iSctEAiKLFa/H4Q0zgVrceACg1ny9uMy7rCdaM2+s0BWrtppK2UAdeoVjW2ruq1bevGImcvR6zpHmtJ1MHSUZAuDKU0vY7Si2h6VU5+iMuJuLx65az4dPql3SHBKaz1oYnEfVkWUfG4KkeBna7A/xm6M14j1gZihZazBRH4MODcoKPOgl+B32kFz08PGd+G0JJIkr7v46+hRCaEpod17DCRivYZCkmkd4N28B3wfNyrGKP5bws9DS6PKDz/Mpsl36Tyz//ax1jeFmi0emcLY7C/8SDD0Z7dobcynHbbV3QVbcZW0TlqQemNhoqzJD+4/n8Yw7l8AA==",
				"post": "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4NCjxzYW1scDpBdXRoblJlcXVlc3QgeG1sbnM6c2FtbHA9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDpwcm90b2NvbCIgSUQ9ImFnZG9iamNmaWtuZW9tbWZqYW1kY2xlbmpjcGNqbWdkZ2JtcGdqbW8iIFZlcnNpb249IjIuMCIgSXNzdWVJbnN0YW50PSIyMDA3LTA0LTI2VDEzOjUxOjU2WiIgUHJvdG9jb2xCaW5kaW5nPSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6YmluZGluZ3M6SFRUUC1QT1NUIiBQcm92aWRlck5hbWU9Imdvb2dsZS5jb20iIEFzc2VydGlvbkNvbnN1bWVyU2VydmljZVVSTD0iaHR0cHM6Ly93d3cuZ29vZ2xlLmNvbS9hL3NvbHdlYi5uby9hY3MiIElzUGFzc2l2ZT0idHJ1ZSI+PHNhbWw6SXNzdWVyIHhtbG5zOnNhbWw9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDphc3NlcnRpb24iPmdvb2dsZS5jb208L3NhbWw6SXNzdWVyPjxzYW1scDpOYW1lSURQb2xpY3kgQWxsb3dDcmVhdGU9InRydWUiIEZvcm1hdD0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOm5hbWVpZC1mb3JtYXQ6dW5zcGVjaWZpZWQiIC8+PC9zYW1scDpBdXRoblJlcXVlc3Q+DQo="
			}, 
			c;
		e.preventDefault();
		c = examples[type];
		console.log("Inserting example", type, c, $(e.currentTarget));
		$(this.el).find("#samlinput").val(c);

		this.detect();
	}

	SAMLdebug.prototype.setInput = function(v) {
		this.el.find("#samlinput").val(v);
		this.detect();
	}
	SAMLdebug.prototype.getInput = function() {
		var input = this.el.find("#samlinput").val();
		input.replace(/\s*/g, "");
		return input;
	}

	SAMLdebug.prototype.cleanlog = function() {
		$(this.el).find("#log").empty();
	}
	SAMLdebug.prototype.log = function(msg) {
		$(this.el).find("#log").append('<div class="alert alert-error">' + msg + '</div>');
	}
	SAMLdebug.prototype.debug = function(msg) {
		$(this.el).find("#log").append('<div class="alert alert-info">' + msg + '</div>');
	}

	SAMLdebug.prototype.detectType = function() {
		var input = this.getInput();
		for(var i = 0; i < this.plugins.length; i++) {
			if (this.plugins[i].detect(input)) return this.plugins[i];
		}
		if (input.substr(0,1) === '<') {
			return null;
		}

		throw "Error detecting content";
	}

	SAMLdebug.prototype.detect = function() {
		
		var 
			input = this.getInput(),
			type = 'NA';

		try {
			var detected = this.detectType(input);
			if (detected === null) {
				type = 'SAML';
			} else {
				type = detected.getType();
			}

			if (this.active !== detected) {
				this.active = detected;
				this.isSAML(this.active === null);
			}

		} catch(exception) {
			this.isSAML(null);
		}

		$(this.el).find('#inputtype').text(type);
		console.log("Type detected was : " + type);


	}


	return SAMLdebug;
});