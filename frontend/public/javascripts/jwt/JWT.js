/*
 * (c) Andreas Åkre Solberg, andreas.solberg@uninett.no, http://rnd.feide.no
 * Licence: GNU Public Lesser Licence 2.1: http://www.gnu.org/licenses/lgpl-2.1.html
 *
 * Borrowed sniplets are outlined and credited in the comments.
 */ 


var 
	// Internal node.js requirements
	crypto,
	
	// Third party dependencies

	// Local requirements
	
	// Local variables
	isNode, 
	
	// Exports
	jwt,
	idtoken
	;

isNode = !!(typeof window == 'undefined');
if (isNode) {
	// Internal node.js requirements
	crypto = require("crypto");
} else {
	if (typeof SHA256_init === 'undefined') {
		jwtlog('This JWT library requires the JSSHA256 Library if used in the browser.');
	}
	if (typeof window.btoa === 'undefined') {
		jwtlog('Your browser has not built in support for base64 encoding. Use a WebKIT for now...');
	}
	if (typeof jQuery === 'undefined') {
		jwtlog('This JWT Library requires JQuery to be loaded, if used in browser.');
	}
	
	
	// jQuery Plugin for serializing JSON
	// http://tgardner.net/jquery/serialize-json-with-jquery/
	jQuery(function($) {
	    $.extend({
	        serializeJSON: function(obj) {
	            var t = typeof(obj);
	            if(t != "object" || obj === null) {
	                // simple data type
	                if(t == "string") obj = '"' + obj + '"';
	                return String(obj);
	            } else {
	                // array or object
	                var json = [], arr = (obj && obj.constructor == Array);

	                $.each(obj, function(k, v) {
						if (!obj.hasOwnProperty(k)) {
							return;
						}
	                    t = typeof(v);
	                    if(t == "string") v = '"' + v + '"';
	                    else if (t == "object" & v !== null) v = $.serializeJSON(v)
	                    json.push((arr ? "" : '"' + k + '":') + String(v));
	                });

	                return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
	            }
	        }
	    });
	});
	
	
	var utf8fromByteArray = function (bytearray) {
		//string = string.replace(/\r\n/g,"\n");
		var utftext = "";

		for (var n = 0; n < bytearray.length; n++) {

			var c = bytearray[n];

			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}

		}

		return utftext;
	}
	
	
	var binarybase64 = function (bytearray) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;
 
		var keystr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=";
 
		while (i < bytearray.length) {
 
			chr1 = bytearray[i++];
			chr2 = bytearray[i++];
			chr3 = bytearray[i++];
 
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
 
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
 
			output = output +
			keystr.charAt(enc1) + keystr.charAt(enc2) +
			keystr.charAt(enc3) + keystr.charAt(enc4);
 
		}
		return output;
	}
	
}





/*
 * Some module constants.
 */
var 
	// Number of seconds of time skew that is accepted.
	// 180 seconds = 3 minutes
	SKEW = 180;

/*
 * Implementation of ID Token, as described in
 * OpenID Connect Session Management 1.0
 * http://openid.net/specs/openid-connect-session-1_0.html
 */
idtoken = function(useroptions) {
	
	var
		my,
		idtoken_reserved_claims = ['user_id', 'client_id', 'pape', 'nonce'],
		
		// Access to the jwt validate() funciton.
		super_validate,
		super_validateClaims
		;
	
	// Create a new JWT, and add some new reserved claims 
	my = jwt(useroptions, idtoken_reserved_claims);
	// Get access to some super functions that we need access to 
	// after overriding them...
	super_validate = my.super('validate');
	super_validateClaims = my.super('validateClaims');
	
	my.validateClaims = function ( ) {
		console.log('[IDToken] Validating claims.');
		
		my.requireClaim('user_id');
		my.requireClaim('client_id');
		my.requireClaim('iss');
		my.requireClaim('aud');
		
		super_validateClaims.apply(my, arguments);
		return my;
	}
	
	return my;
}
/*
 * Helper Object prototype function to access inherited functions using funtional inheritance.
 * We need this to add functionality to the validate function of the IDToken inherited from JWT.
 */
idtoken.prototype.super = function (name) {
	var that = this, method = that[name];
	return function() {
		return method.apply(that, arguments);
	};
}


/*
 * Implementation of JSON Web Token (JWT)
 */
jwt = function(useroptions, additionalReservedClaims) {
	
	var 
		
		RESERVED_CLAIMS = ['exp', 'nbf', 'iat', 'iss', 'aud', 'typ'],
		
		// The (public) JWT object
		my = {},
		
		// Various options used when encoding and decoding JWTs.
		options = {
			'alg': 'HS256'
		},
		
		// JWT Header Segment, in an unpacked format.
		header = {
			typ: 'JWT',
			alg: 'none' 
		},
		// JWT Claim Segment, in an unpacked format.
		claims = {},
		
		// JWT Crypto Segment, packed.
		cryptoSegment = ''
		;
	
	
	console.log("jwt()", useroptions, additionalReservedClaims);

	function mergeOptions(options, toAdd) {
		var 
			key;
		
		console.log("Mering options", options, toAdd);

		for (key in toAdd) {
			if (toAdd.hasOwnProperty(key)) {
				options[key] = toAdd[key];
			}
		}
	}
	
	function stripPadding(string) {
		return string.replace(/=/g, '');
	}
	
	function base64encode (string) {
		if (isNode) {
			return stripPadding(new Buffer(string || '').toString('base64'));
		} else {
			return stripPadding(window.btoa(unescape(encodeURIComponent( string ))));
		}
	}

	
	function encodeSegment (seg) {
		var
			s;

		if (isNode) {
			json = JSON.stringify(seg);		
		} else {
			json = $.serializeJSON(seg)
		}
		return base64encode(json);
	}
	
	function decodeSegment (string) {
		var
			json;

		if (isNode) {
			json = new Buffer(string || '', 'base64').toString('utf8');
			return JSON.parse(json);

		} else {
			json = decodeURIComponent(escape(window.atob( string )));
			return jQuery.parseJSON(json);
		}
	}
	
	function setBasicHeaders () {
		claims['typ'] = 'JWT';
		if (options['iss']) {
			claims['iss'] = options['iss'];
		}
		if (options['aud']) {
			claims['aud'] = options['aud'];
		}

	}
	
	function setTimeHeaders (expiresIn) {
		var
			currentTime;	

		currentTime = Math.round((new Date()).getTime()/1000);

		claims['iat'] = currentTime;
		claims['nbf'] = currentTime - SKEW;
		if (expiresIn) {
			claims['exp'] = (currentTime + expiresIn);		
		}

	}
	
	function getClaims () {
		return claims;
	}

	function getHeader () {
		return header;
	}

	
	function validate (jwt) {
		var
			decomposedSegments,
			cryptoInput;


		decomposedSegments = jwt.split('.');
		console.log(decomposedSegments);
		if (!decomposedSegments instanceof Array) jwtlog('Error when trying to decompose the JWT Segments.');
		if (decomposedSegments.length !== 3) jwtlog('Wrong number of segments in JWT, separated by "." Did expect 3.');


		header = decodeSegment(decomposedSegments[0]);
		claims = decodeSegment(decomposedSegments[1]);
		cryptoSegment = decomposedSegments[2];

		jwtdebug("Header decoded was: <pre>" + JSON.stringify(header, null, 4) + '</pre>' );
		jwtdebug("claims decoded was: <pre>" + JSON.stringify(claims, null, 4) + '</pre>' );
		jwtdebug("cryptoSegment decoded was: <pre>" + JSON.stringify(cryptoSegment, null, 4) + '</pre>' );

		cryptoInput = decomposedSegments[0] + '.' + decomposedSegments[1];

		if (!header['alg']) jwtlog('Encoded JWT did not include the [alg] header property, which is required for validating the signature.');

		digest = createSignature(cryptoInput, header['alg']);

		if (digest !== cryptoSegment) jwtlog('Invalid HMAC Signature in CryptoSegment of the provided JWT. <br />' +
				'<tt style="color: black">' + digest + '</tt> (Calculated digest)<br />' + 
				'<tt style="color: black">' + cryptoSegment + '</tt> (cryptosegment contained this)');
		if (digest !== cryptoSegment) console.log('Invalid HMAC Signature in CryptoSegment of the provided JWT.');

		my.validateClaims();
	}
	
	function requireClaim (claimname) {
		if (!claims.hasOwnProperty(claimname)) {
			jwtlog('JWT is missing required Claim [' + claimname + ']');
		}
	}
	
	function validateClaims () {

		var
			currentTime,
			acceptedClaims, 
			i;

		currentTime = Math.round((new Date()).getTime()/1000);

		console.log('[JWT] Validating Claims');
		console.log('[JWT] Validating Claim Timing; Current time is ' + currentTime);

		if (claims['exp']) {
			if (claims['exp'] < (currentTime - SKEW)) {
				jwtlog('JWT is expired, based upon the [exp] header.');
			}
		}

		if (claims['nbf']) {
			if (claims['nbf'] > (currentTime + SKEW)) {
				jwtlog('JWT is not yet valid, based upon the [nbf] header.');
			}
		}

		if (claims['iss']) {
			if (options['iss']) {
				if (claims['iss'] !== options['iss']) {
					jwtlog('JWT had an invalid Issuer');
				}
			}
		}

		if (claims['typ']) {
			if (claims['typ'] !== 'JWT') {
				jwtlog('The JWT type was invalid. Only type JWT is supported.');
			}
		}

		acceptedClaims = {};

		for (i = 0; i < RESERVED_CLAIMS.length; i++) {
			// console.log('Adding RESERVED_CLAIMS: ' + RESERVED_CLAIMS[i]);
			acceptedClaims[RESERVED_CLAIMS[i]] = 1;
		}
		
		if (options['supported_claims']) {
			for (i = 0; i < options['supported_claims'].length; i++) {
				// console.log('Adding supported claim: ' + options['supported_claims'][i]);
				acceptedClaims[options['supported_claims'][i]] = 1;
			}	
		}

		for (key in claims) {
			if (claims.hasOwnProperty(key)) {
				// console.log('Checking claim [' + key +  '] if supported.');
				// if (!acceptedClaims[key]) {
				// 	jwtlog('Found unsupported / unreckognized claim in JWT: ' + key);
				// }
			}
		}

	}
	
	function getAge () {
		var
			currentTime;

		if (!header['iat']) return null;
		currentTime = Math.round((new Date()).getTime()/1000);
		return (currentTime - header['iat']);
	}
	
	function hmac256 (string, secret) {
		var hmac, hash2, digest;

		if (isNode) {
			hmac = crypto.createHmac("sha256", secret);
			hash2 = hmac.update(string);
			digest = stripPadding(hmac.digest("base64"));
		} else {
			HMAC_SHA256_init(secret);
			HMAC_SHA256_write(string);
			hmac = HMAC_SHA256_finalize();
			console.log("HMAC", hmac);
			console.log("Secret", secret);
			digest = stripPadding(binarybase64(hmac));
		}
		return digest;
	}
	
	function createSignature (cryptoInput, alg) {

		var 
			digest,
			secret;

		if (alg !== 'HS256') jwtlog('Algoritm not implemented. Currently only HS256 is implemented.');

		console.log("options is ", options);

		if (!options['secret']) jwtlog('Missing [secret] option to perform HS256 alg signature.');
		secret = options['secret'];

		digest = hmac256(cryptoInput, secret);

		console.log('Crypto input:');
		console.log(cryptoInput);
		console.log('Crypto output:');
		console.log(digest);

		jwtdebug('Crypto input <pre>' + cryptoInput + '</pre>' + 
			'Crypto ouptut: <pre>' + digest + '</pre>' + 
			'Secret : <pre>' + JSON.stringify(secret) + '</pre>');

		return digest;	
	}
	
	// Creates a signature
	function sign () {
		var cryptoInput, digest;

		if (!options['alg']) jwtlog('Missing [alg] option in options.');
		if (options['alg'] !== 'HS256') jwtlog('Configured alg is not implemented.');

		header['alg'] = options['alg'];

		cryptoInput = encodeSegment(header) + '.' + 
			encodeSegment(claims);

		cryptoSegment = createSignature(cryptoInput, header['alg']);

		return cryptoInput + '.' + cryptoSegment;

	}
	
	function init (content) {
		// --- Initialize the JWT, based upon what kind of input is provided.
		// the function supports decoding an JWT, or encoding a JSON as a JWT.
		console.log('Initializating a JWT with [' + (typeof content) + ']');

		if (typeof content === 'undefined') {
			// Start of with an empty new JWT.

		} else if (typeof content === 'string') {

			// Start with decoding a already encoded JWT.
			my.validate(content);

		} else if (typeof content === 'object') {
			// Starts of with a new JWT initalized with content
			claims = content;
			setBasicHeaders();
			my.validateClaims();

		} else {
			jwtlog('Initialization of a JWT object must be done with an javascript object, or a packed string, or undefined.');
		}
		return my;
	}
	
	
	// --- Process provided configuration
	if (typeof useroptions === 'object') {
		mergeOptions(options, useroptions);
	}
	if (typeof additionalReservedClaims === 'object') {
		RESERVED_CLAIMS = RESERVED_CLAIMS.concat(additionalReservedClaims);
	}

	
	// Set some public methods to the new JWT object.
	my.init = init;
	my.setTimeHeaders = setTimeHeaders;
	my.sign = sign;
	my.getClaims = getClaims;
	my.getHeader = getHeader;
	my.validate = validate;
	my.validateClaims = validateClaims;
	my.requireClaim = requireClaim;
	
	return my;	
};



// Exports (if running in Node.js environment)
if (isNode) {
	this.jwt = jwt;	
	this.idtoken = idtoken;	
}
