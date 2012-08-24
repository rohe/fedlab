(function ($, exports) {


	var JWTToolApp = function(el) {
		this.el = el;

		this.options = {
			'iss': 'https://issuer.example.org',
			'aud': 'https://example.org',
			'secret': '87as6d87sa6d87a6s',
			'supported_claims' : ['customclaim']
		};

		$(this.el).on("click", "button.encode", $.proxy(this.encode, this));
		$(this.el).on("click", "button.decode", $.proxy(this.decode, this));
		$(this.el).on("click", ".cleanlog", function(e) {
			$("#log").empty();
			e.preventDefault();
		});
	};



	JWTToolApp.prototype.encode = function(e) {
		e.preventDefault();
		var decoded = $(this.el).find("#decoded").val();
		var result = jwt(this.options).init(JSON.parse(decoded)).sign();
		$(this.el).find("#encoded").val(result);
	}

	JWTToolApp.prototype.decode = function(e) {
		e.preventDefault();
		var encoded = $("#encoded").val();
		encoded.replace(/\s*/g, "");
		console.log("Decoding " + encoded + " with options", this.options);
		var unpacked = jwt(this.options).init(encoded).getClaims();
		$(this.el).find("#decoded").val(JSON.stringify(unpacked, null, 4));
	}

	JWTToolApp.prototype.log = function(c) {

		$(this.el).find("#log").append('<div class="alert alert-error">' + c + '</div>');

	}

	exports.JWTToolApp = JWTToolApp;

	
	
	
})(jQuery, window);