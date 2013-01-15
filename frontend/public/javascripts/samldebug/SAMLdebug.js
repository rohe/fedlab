define(
	[
		'lib/resig',
		'./plugins/SDPluginPost',
		'./plugins/SDPluginPostBody',
		'./plugins/SDPluginRedirect',
		'./plugins/SDPluginURL'
	], 
	function(Class, SDPluginPost, SDPluginPostBody, SDPluginRedirect, SDPluginURL) {

	var SAMLdebug;

	var formatXML = function (xml) {
	    var formatted = '';
	    var reg = /(>)(<)(\/*)/g;
	    xml = xml.replace(reg, '$1\r\n$2$3');
	    var pad = 0;
	    jQuery.each(xml.split('\r\n'), function(index, node) {
	        var indent = 0;
	        if (node.match( /.+<\/\w[^>]*>$/ )) {
	            indent = 0;
	        } else if (node.match( /^<\/\w/ )) {
	            if (pad != 0) {
	                pad -= 1;
	            }
	        } else if (node.match( /^<\w[^>]*[^\/]>.*$/ )) {
	            indent = 1;
	        } else {
	            indent = 0;
	        }

	        var padding = '';
	        for (var i = 0; i < pad; i++) {
	            padding += '  ';
	        }

	        formatted += padding + node + '\r\n';
	        pad += indent;
	    });

	    return formatted;
	}

	SAMLdebug = function(el) {
		this.el = el;

		this.active = false;
		this.plugins = [];

	
		this.plugins.push(new SDPluginURL(this));
		this.plugins.push(new SDPluginRedirect(this));
		this.plugins.push(new SDPluginPostBody(this));
		this.plugins.push(new SDPluginPost(this));


		$(this.el).on('change', '#samlinput', $.proxy(function() {
			var input = this.el.find("#samlinput").val();
			this.detect();
		}, this));

		$(this.el).find('#samlinput').bind('paste', $.proxy(function() {
			var that = this;
			setTimeout(function() {
				var input = that.el.find("#samlinput").val();
				that.detect();

			}, 100);
		}, this));

		$(this.el).on('click', '.insertExample', $.proxy(this.insertExample, this))

		$(this.el).on('click', '.actionbar button', $.proxy(this.action, this));

		$(this.el).on('click', '#tablinkpretty', $.proxy(this.updatePretty, this));

	};

	SAMLdebug.prototype.wrapInflate = function(str) {
		return RawDeflate.inflate(str);
	};

	SAMLdebug.prototype.wrapDeflate = function(str) {
		return RawDeflate.deflate(str, 9);
	};


	SAMLdebug.prototype.isSAML = function(issaml) {

			// $(this.el).find('#tablinkeditable').tab('show');
			// $(this.el).find('#tablinkpretty').addClass('disabled');
			// $(this.el).find('#tablinkpretty').tab('show');


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
		// $(this.el).find("#samlinput").val(c);

		var i = this.getInput();
		i.message = c;
		this.setInput(i);

		this.detect();
	}

	SAMLdebug.prototype.setInput = function(v) {
		console.log("Set input to ", v);
		this.el.find("#samlinput").val(v.message);
		// this.el.find("#prettyoutput").html(v.message.replace(/</g, '&lt;'));

		this.updatePretty();

		
		if (v.dest) {
			this.el.find("#dest").val(v.dest);
		}
		if (v.relaystate) {
			this.el.find("#includerelaystate").val(true);
			this.el.find("#relaystate").val(v.relaystate);
		} else {
			this.el.find("#includerelaystate").val(false);
			this.el.find("#relaystate").val('');
		}
		this.detect();
	}

	SAMLdebug.prototype.updatePretty = function() {
		var data = this.el.find("#samlinput").val();
		data = formatXML(data);
		this.el.find("#prettyoutput").html(data.replace(/</g, '&lt;'));
		prettyPrint();
	}

	SAMLdebug.prototype.getInput = function() {
		var xmlinput, relaystate, result = {};

		xmlinput = this.el.find("#samlinput").val();
		xmlinput.replace(/\s*/g, "");

		result.dest = this.el.find("#dest").val();
		relaystate = this.el.find("#relaystate").val();

		if (this.el.find("#relaystateinclude").is(':checked')) {
			console.log("Relay state is set!")
			result.relaystate = relaystate;
		}

		result.message = xmlinput;
		return result;
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
		if (input.message.substr(0,1) === '<') {
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
			console.error("Error detecting content", exception);
			this.isSAML(null);
		}

		$(this.el).find('#inputtype').text(type);
		console.log("Type detected was : " + type);


	}


	return SAMLdebug;
});