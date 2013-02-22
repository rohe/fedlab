
define(function(require, exports, module) {

	var 
		$ = require('jquery'),
		jwt = require('./JWT');

	var utf8 = {}

	utf8.toByteArray = function(str) {
	    var byteArray = [];
	    for (var i = 0; i < str.length; i++)
	        if (str.charCodeAt(i) <= 0x7F)
	            byteArray.push(str.charCodeAt(i));
	        else {
	            var h = encodeURIComponent(str.charAt(i)).substr(1).split('%');
	            for (var j = 0; j < h.length; j++)
	                byteArray.push(parseInt(h[j], 16));
	        }
	    return byteArray;
	};

	utf8.parse = function(byteArray) {
	    var str = '';
	    for (var i = 0; i < byteArray.length; i++)
	        str +=  byteArray[i] <= 0x7F?
	                byteArray[i] === 0x25 ? "%25" : // %
	                String.fromCharCode(byteArray[i]) :
	                "%" + byteArray[i].toString(16).toUpperCase();
		return str;
		// return decodeURIComponent(str);
	};

	var foo = function(arr) {
		var str = '';
		var i;
		for(i = 0; i < arr.length; i++) {
			str += String.fromCharCode(arr[i]);
		}
		return str;
	}

	var a = [3, 35, 53, 75, 43, 15, 165, 188, 131, 126, 6, 101, 119, 123, 166, 143, 90, 179, 40, 230, 240, 84, 201, 40, 169, 15, 132, 178, 210, 80, 46, 191, 211, 251, 90, 146, 210, 6, 71, 239, 150, 138, 180, 195, 119, 98, 61, 34, 61, 46, 33, 114, 5, 46, 79, 8, 192, 205, 154, 245, 103, 208, 128, 163];
	var b = foo(a);
	// alert(foo(a));

	function randomString(length) {
	    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');

	    if (! length) {
	        length = Math.floor(Math.random() * chars.length);
	    }

	    var str = '';
	    for (var i = 0; i < length; i++) {
	        str += chars[Math.floor(Math.random() * chars.length)];
	    }
	    return str;
	}


	var JWTToolApp = function(el) {
		this.el = el;


		this.boilerplate = {
			'iss': 'https://issuer.example.org',
			'aud': 'https://example.org'
		};

		this.options = {
			'secret': '87as6d87sa6d87a6s'
		};

		$(this.el).on("click", "button.encode", $.proxy(this.encode, this));
		$(this.el).on("click", "button.decode", $.proxy(this.decode, this));
		$(this.el).on("click", ".cleanlog", function(e) {
			$("#log").empty();
			e.preventDefault();
		});

		$(this.el).on("click", "#actionPretty", $.proxy(this.pretty, this));
		$(this.el).on("click", "#actionBoilerplate", $.proxy(function(e) {
			e.preventDefault();
			this.update(this.boilerplate);
		}, this));

		$(this.el).on("click", ".actionExpire", $.proxy(this.actionExpire, this));
		$(this.el).on("click", ".actionGenSecret", $.proxy(this.genSecret, this));
		
	};

	JWTToolApp.prototype.pretty = function(e) {
		this.update({});
		e.preventDefault();
	}
	JWTToolApp.prototype.cleanLog = function() {
		$("#log").empty();
	}

	JWTToolApp.prototype.actionExpire = function(e) {
		console.log(e);
		var nv = Math.round(new Date().getTime() / 1000.0);
		var expdiff = parseInt($(e.currentTarget).data('exp'), 10);
		nv += expdiff; // in 5 minutes
		this.update({exp: nv});
	}

	JWTToolApp.prototype.genSecret = function(e) {
		e.preventDefault();
		var gen = randomString(64);
		$(this.el).find("#secret").val(gen);
	}

	JWTToolApp.prototype.update = function(up) {
		var current = $(this.el).find("#decoded").val();

		var unpacked;
		try {
			unpacked = JSON.parse(current);
		} catch(e) {
			unpacked = {};
		}
		 

		for(var key in up) {
			if (up.hasOwnProperty(key)) {
				unpacked[key] = up[key];
			}
		}
		$(this.el).find("#decoded").val(JSON.stringify(unpacked, null, 4));
	}

	JWTToolApp.prototype.getOptions = function() {

		var options = {}, s;
		options.alg = $(this.el).find("select#type").val();

		if (options.alg === 'HS256') {
			s =  $(this.el).find("#secret").val();
			if (s[0] === '[') {
				console.log("Secret is a byte array");
				options.secret = JSON.parse(s);
			} else {
				console.log("Secret is a byte string");
				options.secret = s;
			}
			
		}
		// options.secret = b;
		console.log("Options", options);
		return options;
	}

	JWTToolApp.prototype.encode = function(e) {
		e.preventDefault();
		this.cleanLog();
		var decoded = $(this.el).find("#decoded").val();
		options = this.getOptions();
		var result = jwt.jwt(options).init(JSON.parse(decoded)).sign();
		$(this.el).find("#encoded").val(result);
	}

	JWTToolApp.prototype.decode = function(e) {
		e.preventDefault();
		this.cleanLog();
		var encoded = $("#encoded").val();
		encoded.replace(/\s*/g, "");
		console.log("Decoding " + encoded + " with options", this.options);
		options = this.getOptions();
		var unpacked = jwt.jwt(options).init(encoded).getClaims();
		$(this.el).find("#decoded").val(JSON.stringify(unpacked, null, 4));
	}

	JWTToolApp.prototype.log = function(c) {

		$(this.el).find("#log").append('<div class="alert alert-error">' + c + '</div>');
	}
	JWTToolApp.prototype.debug = function(c) {

		$(this.el).find("#log").append('<div class="alert alert-info">' + c + '</div>');

	}

	return JWTToolApp;

	
});