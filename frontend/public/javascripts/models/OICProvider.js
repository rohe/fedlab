define(function(require, exports, module) {

	var
		Spine = require('spine'),

		OAuthEntity = require('./OAuthEntity');


	var OICProvider = OAuthEntity.sub({
		init: function() {
			if (typeof this.metadata !== 'object') {
				this.metadata = {};
			};
			if (typeof this.results !== 'object') {
				this.results = {};
			};
			
			this.metadata.versions = {
				oauth: "2.0",
				openid: "3.0"
			};
			
			if (!this.metadata.provider) {
				this.metadata.provider = {};
			}
			
			if (!this.metadata.features) {
				this.metadata.features = {
					"discovery": true,
					"registration": true,
					"session_management": true,
					"key_export": true
				};
			}
			this.metadata.provider.supported_response_types = ["code", "code id_token", "token id_token"];
			this.metadata.provider.supported_scopes = ["openid"];
			this.metadata.provider.algoritms = ["HS256"];
			
			// if (!this.metadata.provider.endpoints) {
			// 	this.metadata.provider.endpoints = {};
			// }
			if (!this.metadata.client) {
				this.metadata.client = {
					// "auth_type": "client_secret_basic",
					// "client_type": "confidential",
					// "client_id": FedLabUtils.guid().toLowerCase(),
					"redirect_uris": ["https://%s/authz_cb"]
				};
			}
			this.metadata.client.redirect_uris = ["https://%s/authz_cb"];
			console.log("TestEntity init();");
		},
		"hasAlg": function(alg) {
			var has = false;
			$.each(this.metadata.provider.algoritms, function(i, ha) {
				if (ha === alg) has = true;
			});
			return has;
		},
		"hasScope": function(scope) {
			var has = false;
			$.each(this.metadata.provider.supported_scopes, function(i, hs) {
				if (hs === scope) has = true;
			});
			return has;
		},
		"hasResponseType": function(rt) {
			var has = false;
			$.each(this.metadata.provider.supported_response_types, function(i, hrt) {
				if (rt === hrt) has = true;
			});
			return has;
		}
	});	
	OICProvider.configure("OICProvider");
	OICProvider.include({
		"_endpoints": {
			"dynamic": {
				"title": "OpenID Connect Discovery Endpoint",
				"descr": "An e-mail address or a URL endpoint for the purpose of OpenID Connect Discovery. See " + 
					"<a target=\"_blank\" href=\"http://openid.net/specs/openid-connect-discovery-1_0.html\">OpenID Connect Discovery</a> for more details."
			},
			"authorization_endpoint": {
				"title": "OAuth Authorization endpoint",
				"descr": "OAuth Provider Authorization endpoint is REQUIRED. Described in " + 
					"<a target=\"_blank\" href=\"http://tools.ietf.org/html/draft-ietf-oauth-v2-22#section-3\">OAuth 2.0 section 3</a>"
			},
			"token_endpoint": {
				"title": "OAuth Token endpoint",
				"descr": "OAuth Provider Token endpoint is REQUIRED. Described in " + 
					"<a target=\"_blank\" href=\"http://tools.ietf.org/html/draft-ietf-oauth-v2-22#section-3\">OAuth 2.0 section 3</a>"
			},
			"registration_endpoint": {
				"title": "Registration Endpoint",
				"descr": "The OpenID Connect UserInfo Endpoint is described in " + 
					"<a target=\"_blank\" href=\"http://openid.net/specs/openid-connect-registration-1_0.html\">OpenID Connect Dynamic Client Registration</a>"
			},
			"userinfo_endpoint": {
				"title": "UserInfo Endpoint",
				"descr": "The OpenID Connect UserInfo Endpoint is described in " + 
					"<a target=\"_blank\" href=\"http://openid.net/specs/openid-connect-standard-1_0.html#userinfo_ep\">OpenID Connect Standard - Section 5</a>"
			},
			"check_id_endpoint": {
				"title": "CheckID Endpoint",
				"descr": "The OpenID Connect CheckID Endpoint is described in " + 
					"<a target=\"_blank\" href=\"http://openid.net/specs/openid-connect-standard-1_0.html#check_id_ep\">OpenID Connect Standard - Section 4</a>"
			},
			"refresh_session_endpoint": {
				"title": "Refresh Session endpoint",
				"descr": "The OpenID Connect Refresh Session Endpoint is described in " + 
					"<a target=\"_blank\" href=\"http://openid.net/specs/openid-connect-session-1_0.html\">OpenID Connect Session Management</a>"
			},
			"end_session_endpoint": {
				"title": "End Session endpoint",
				"descr": "The OpenID Connect End Session Endpoint is described in " + 
					"<a target=\"_blank\" href=\"http://openid.net/specs/openid-connect-session-1_0.html\">OpenID Connect Session Management</a>"
			},
		},
		"_algoritms": {
			"HS256": {
				"title": "HMAC SHA-256",
				"descr": "HMAC using SHA-256 hash algorithm"
			},
			"HS384": {
				"title": "HMAC SHA-384",
				"descr": "HMAC using SHA-384 hash algorithm"
			},
			"HS512": {
				"title": "HMAC SHA-512",
				"descr": "HMAC using SHA-512 hash algorithm"
			},
			"RS256": {
				"title": "RSA SHA-256",
				"descr": "RSA using SHA-256 hash algorithm"
			},
			"RS384": {
				"title": "RSA SHA-384",
				"descr": "RSA using SHA-384 hash algorithm"
			},
			"RS512": {
				"title": "RSA SHA-512",
				"descr": "RSA using SHA-512 hash algorithm"
			},
			"ES256": {
				"title": "ECDSA (SHA-256)",
				"descr": "RSA using SHA-256 hash algorithm"
			},
			"ES384": {
				"title": "ECDSA (SHA-384)",
				"descr": "RSA using SHA-384 hash algorithm"
			},
			"ES512": {
				"title": "ECDSA (SHA-512)",
				"descr": "RSA using SHA-512 hash algorithm"
			},
			"ES512": {
				"title": "ECDSA (SHA-512)",
				"descr": "RSA using SHA-512 hash algorithm"
			},
			"RSA1_5": {
				"title": "RSA1_5",
				"descr": "RSA using RSA-PKCS1-1.5 padding, as defined in RFC 3447 [RFC3447]"
			},


			"RSA1_5": {
				"title": "RSA1_5",
				"descr": "RSA using RSA-PKCS1-1.5 padding, as defined in RFC 3447 [RFC3447]"
			},
			"RSA-OAEP": {
				"title": "RSA-OAEP",
				"descr": "RSA using Optimal Asymmetric Encryption Padding (OAEP), as defined in RFC 3447 [RFC3447]"
			},

			"ECDH-ES": {
				"title": "ECDH-ES",
				"descr": "Elliptic Curve Diffie-Hellman Ephemeral Static, as defined in RFC 6090 [RFC6090], and using the Concat KDF, as defined in [NIST-800-56A], where the Digest Method is SHA-256"
			},
			"A128KW": {
				"title": "A128KW",
				"descr": "Advanced Encryption Standard (AES) Key Wrap Algorithm using 128 bit keys, as defined in RFC 3394 [RFC3394]"
			},	
			"A256KW": {
				"title": "A256KW",
				"descr": "Advanced Encryption Standard (AES) Key Wrap Algorithm using 256 bit keys, as defined in RFC 3394 [RFC3394]"
			},		

			"A128GCM": {
				"title": "A128GCM",
				"descr": "Advanced Encryption Standard (AES) using 128 bit keys in Galois/Counter Mode, as defined in [FIPS-197] and [NIST-800-38D]"
			},
			"A256GCM": {
				"title": "A256GCM",
				"descr": "Advanced Encryption Standard (AES) using 256 bit keys in Galois/Counter Mode, as defined in [FIPS-197] and [NIST-800-38D]"
			},
			"A128CBC": {
				"title": "A128CBC",
				"descr": "Advanced Encryption Standard (AES) using 128 bit keys in Cipher Block Chaining mode, as defined in [FIPS-197] and [NIST-800-38A]  "
			},
			"A256CBC": {
				"title": "A256CBC",
				"descr": "Advanced Encryption Standard (AES) using 256 bit keys in Cipher Block Chaining mode, as defined in [FIPS-197] and [NIST-800-38A]  "
			},
			"A128GCM": {
				"title": "A128CBC",
				"descr": "Advanced Encryption Standard (AES) using 128 bit keys in Galois/Counter Mode, as defined in [FIPS-197] and [NIST-800-38D]"
			},
			"A256GCM": {
				"title": "A256GCM",
				"descr": "Advanced Encryption Standard (AES) using 256 bit keys in Galois/Counter Mode, as defined in [FIPS-197] and [NIST-800-38D]"
			}
		},
		"_scopes": {
			"profile": {
				"descr": "OPTIONAL. This requests that access to the End-User's profile Claims excluding the address and email Claims at the UserInfo Endpoint be granted by the issued Access Token."
			},
			"email": {
				"descr": "OPTIONAL. This requests that access to the email and verified Claims at the UserInfo Endpoint be granted by the issued Access Token."
			},
			"address": {
				"descr": "OPTIONAL. This requests that access to address Claim at the UserInfo Endpoint be granted by the issued Access Token."
			},
			"phone": {
				"descr": "OPTIONAL. This requests that access to the phone_number Claim at the UserInfo Endpoint be granted by the issued Access Token."
			}
		},
		"_response_types": {
			"code": {
				"title": "code"
			},
			"token": {
				"title": "token"
			},
			"code__token": {
				"title": "code token"
			},
			"code__id_token": {
				"title": "code id_token"
			},
			"id_token__token": {
				"title": "id_token token"
			},
			"code__id_token__token": {
				"title": "code id_token token"
			}
		}
	});
	OICProvider.extend(Spine.Model.Local);


	return OICProvider;
	
});