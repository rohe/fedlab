(function($) {
	function clearCerts () {
		$("div#certs > div.content").empty();
	}

	function addCert (use, cert) {
		var infoHTML, key, checked;
		var randID = 'cert' + Math.floor(Math.random() * 10000 + 1000);

		infoHTML = '<fieldset><legend>Certificate</legend>' +
				'<select class="certuse" name="' + randID + '-use-name" id="' + randID + '-use">';

		for (key in SAMLmetaJS.Constants.certusage) {
			if (SAMLmetaJS.Constants.certusage.hasOwnProperty(key)) {
				checked = '';
				if (key === use) {
					checked = ' selected="selected" ';
				}
				infoHTML += '<option value="' + key + '" ' + checked + '>' +
					SAMLmetaJS.Constants.certusage[key] +
					'</option>';
			}
		}

		infoHTML += '</select>' +
			'<textarea class="certdata" style="" name="' + randID + '-data" id="' + randID + '-data-name">' + (cert || '') + '</textarea>' +
			'<button style="display: block" class="removecert">Remove</button>' +
			'</fieldset>';

		$(infoHTML).appendTo("div#certs > div.content").find('button.removecert').click(function(e) {
			e.preventDefault();
			$(e.target).closest('fieldset').remove();
		});
	}

	SAMLmetaJS.plugins.certs = {
		tabClick: function (handler) {
			handler($("a[href='#certs']"));
		},

		addTab: function (pluginTabs) {
			pluginTabs.list.push('<li><a href="#certs">Certificates</a></li>');
			pluginTabs.content.push(
				'<div id="certs">' +
					'<div class="content"></div>' +
					'<div><button class="addcert">Add new certificate</button></div>' +
				'</div>'
			);
		},

		setUp: function () {
			$("div#certs button.addcert").click(function(e) {
				e.preventDefault();
				addCert('both', '');
			});
		},

		fromXML: function (entitydescriptor) {
			var l;

			clearCerts();
			if (entitydescriptor.saml2sp && entitydescriptor.saml2sp.certs) {
				for (l in entitydescriptor.saml2sp.certs) {
					if (entitydescriptor.saml2sp.certs.hasOwnProperty(l)) {
						addCert(entitydescriptor.saml2sp.certs[l].use, entitydescriptor.saml2sp.certs[l].cert);
					}
				}
			}
		},

		toXML: function (entitydescriptor) {
			delete entitydescriptor.certs;
			$('div#certs fieldset').each(function (index, element) {

				var use = $(element).find('select.certuse').val();
				var cert = $(element).find('textarea.certdata').val();

				if (!use || !cert) {
					return;
				}
				
				if (!entitydescriptor.saml2sp) entitydescriptor.saml2sp = {};
				if (!entitydescriptor.saml2sp.certs) {
					entitydescriptor.saml2sp.certs = [];
				}
				entitydescriptor.saml2sp.certs.push({'use': use, 'cert': cert});
			});
		}
	};

}(jQuery));
