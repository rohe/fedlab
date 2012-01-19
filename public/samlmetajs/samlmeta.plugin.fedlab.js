(function($) {
    SAMLmetaJS.plugins.fedlab = {
	    'tabClick': function(handler) {
		    handler($("a[href='#fedlab']"));
	    },

	    'addTab': function(pluginTabs) {
		    pluginTabs.list.push('<li><a href="#fedlab">FedLab</a></li>');
		    pluginTabs.content.push(
			'<div id="fedlab">' +
				'<div class="content">' +
					'<p>Here you may register some additional parameters required by some of the Federation Lab Tools.</p>' +

					'<fieldset class="automatedtester"><legend>Automated SP Tester</legend>' +
						'<div id="div-initsso">' +
							'<p style="font-weight: bold; color: #333; margin: .5em 0px .1em 0px">Initiate SSO URL</p>' +
							'<input style="width: 600px" type="text" name="fedlab_initsso" id="fedlab_initsso" value="" />' +
							'<p style="margin: 0px">An URL that initiates login at the service provider. Request to this page ' +
							' should also be automatically directed to the automated SP tester, and not show a discovery service.</p>' +
						'</div>' +
						'<div id="div-attributeurl">' +
							'<p style="font-weight: bold; color: #333; margin: .5em 0px .1em 0px">Attribute viewer URL</p>' +
							'<input style="width: 600px" type="text" name="fedlab_attributeurl" id="fedlab_attributeurl" value="" />' +
							'<p style="margin: 0px">An URL at the service provider that presents a list of attributes for the ' +
							' currently authenticated user.</p>' +
						'</div>' +
						'<div id="div-initslo">' +
							'<p style="font-weight: bold; color: #333; margin: .5em 0px .1em 0px">Initiate Single Log-Out URL</p>' +
							'<input style="width: 600px" type="text" name="fedlab_initslo" id="fedlab_initslo" value="" />' +
							'<p style="margin: 0px">An URL that initiates SLO at the service provider.</p>' +
						'</div>' +

					'</fieldset>' +
				'</div>' +
			'</div>'
		    );
	    },

	    'fromXML': function(entitydescriptor) {
			// 		    if (!entitydescriptor.entityAttributes) {
			//     $("div#fedlab > div.content input#fedlab_initsso").val(initsso);
			//     $("div#fedlab > div.content input#fedlab_attributeurl").val(attributeurl);
			//     $("div#fedlab > div.content input#fedlab_initslo").val(initslo);
			// 	return;
			// }

		    var initsso 		= SAMLmetaJS.plugins.fedlab._getAttribute(entitydescriptor.entityAttributes, 'https://www.fed-lab.org/attributes/initsso');
		    var attributeurl 	= SAMLmetaJS.plugins.fedlab._getAttribute(entitydescriptor.entityAttributes, 'https://www.fed-lab.org/attributes/attributeurl');
		    var initslo 		= SAMLmetaJS.plugins.fedlab._getAttribute(entitydescriptor.entityAttributes, 'https://www.fed-lab.org/attributes/initslo');

		    $("div#fedlab > div.content input#fedlab_initsso").val(initsso);
		    $("div#fedlab > div.content input#fedlab_attributeurl").val(attributeurl);
		    $("div#fedlab > div.content input#fedlab_initslo").val(initslo);

	    },
	    'toXML': function(entitydescriptor) {


		    var initsso 		= $("div#fedlab > div.content input#fedlab_initsso").val();
		    var attributeurl 	= $("div#fedlab > div.content input#fedlab_attributeurl").val();
		    var initslo 		= $("div#fedlab > div.content input#fedlab_initslo").val();

		    if (initsso || attributeurl || initslo) {
			    if (!entitydescriptor.entityAttributes) entitydescriptor.entityAttributes = {};
		    } else {
			    return;
		    }

		    if (initsso) {
			    entitydescriptor.entityAttributes['https://www.fed-lab.org/attributes/initsso'] = {
				    'name': 'https://www.fed-lab.org/attributes/initsso',
				    'values': [initsso],
				    'nameFormat': 'urn:oasis:names:tc:SAML:2.0:attrname-format:uri'
			    };
		    } else {
			    delete entitydescriptor.entityAttributes['https://www.fed-lab.org/attributes/initsso'];
		    }
		    if (attributeurl) {
			    entitydescriptor.entityAttributes['https://www.fed-lab.org/attributes/attributeurl'] = {
				    'name': 'https://www.fed-lab.org/attributes/attributeurl',
				    'values': [attributeurl],
				    'nameFormat': 'urn:oasis:names:tc:SAML:2.0:attrname-format:uri'
			    };
		    } else {
			    delete entitydescriptor.entityAttributes['https://www.fed-lab.org/attributes/attributeurl'];
		    }
		    if (initslo) {
			    entitydescriptor.entityAttributes['https://www.fed-lab.org/attributes/initslo'] = {
				    'name': 'https://www.fed-lab.org/attributes/initslo',
				    'values': [initslo],
				    'nameFormat': 'urn:oasis:names:tc:SAML:2.0:attrname-format:uri'
			    };
		    } else {
			    delete entitydescriptor.entityAttributes['https://www.fed-lab.org/attributes/initslo'];
		    }
		    console.log('Dump entity attributes in federation lab plugin');
		    console.log(entitydescriptor.entityAttributes);
	    }

    };

    SAMLmetaJS.plugins.fedlab._getAttribute = function(entityAttributes, name) {
		console.log('Looking up attribute [' + name+ ']')
	    if (!entityAttributes) return '';
	    if (!entityAttributes[name]) return '';
	    if (!entityAttributes[name]['values']) return '';
	    if (!entityAttributes[name]['values'][0]) return '';
	    return entityAttributes[name]['values'][0];
    };

}(jQuery));
