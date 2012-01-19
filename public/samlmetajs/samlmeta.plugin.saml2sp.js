(function($) {
	function clearEndpoints () {
		$("div#saml2sp > div.content").empty();
	}

	function addEndpoint (endpoint, endpointname) {
		var checked, endpointHTML, endpointType, foundBinding, binding;
		var randID ='endpoint-' + Math.floor(Math.random() * 10000 + 1000);

		// ---- Type of endpoint selector
		endpointHTML = '<fieldset><legend>' + (endpointname || 'Endpoint') + '</legend>' +
			'<div class="endpointfield">' +
				'<label for="' + randID + '-type">Endpoint type: </label>' +
				'<select class="datafield-type" name="' + randID + '-type-name" id="' + randID + '-type">';

		for (endpointType in SAMLmetaJS.Constants.endpointTypes.sp) {
			if (SAMLmetaJS.Constants.endpointTypes.sp.hasOwnProperty(endpointType)) {

				checked = '';
				if (endpointType === endpointname) {
					checked = ' selected="selected" ';
				}
				endpointHTML += '<option value="' + endpointType + '" ' + checked + '>' +
					SAMLmetaJS.Constants.endpointTypes.sp[endpointType] +
					'</option>';
			}
		}

		endpointHTML += '</select></div>';

		if (endpoint.index) {
			endpointHTML += '<input type="hidden" class="datafield-index" id="' + randID + '-binding" name="' + randID + '-index-name" value="' +
				endpoint.index + '" />';
		}

		// ---- Binding
		endpointHTML += '<div class="endpointfield"><label for="' + randID + '-binding">Binding: </label>' +
				'<select class="datafield-binding" name="' + randID + '-binding-name" id="' + randID + '-binding">';

		foundBinding = false;
		for (binding in SAMLmetaJS.Constants.bindings) {
			if (SAMLmetaJS.Constants.bindings.hasOwnProperty(binding)) {
				checked = '';
				if (endpoint.Binding === binding) {
					checked = ' selected="selected" ';
					foundBinding = true;
				}
				endpointHTML += '<option value="' + binding + '" ' + checked + '>' +
					SAMLmetaJS.Constants.bindings[binding] +
					'</option>';
			}
		}

		if (endpoint.Binding && !foundBinding) {
			endpointHTML += '<option value="' + endpoint.Binding + '" selected="selected">Unknown binding (' + endpoint.Binding + ')</option>';
		}
		endpointHTML += '</select>' +
			'</div>';


		// Text field for location
		endpointHTML +=	'<div class="endpointfield endpointfield-location">' +
				'<label for="' + randID + '-location">	Location</label>' +
				'<input class="datafield-location" type="text" name="' + randID + '-location-name" id="contact-' + randID + '-location" value="' + (endpoint.Location || '') + '" /></div>';

		// Text field for response location
		endpointHTML +=	'<div class="endpointfield">' +
				'<label for="' + randID + '-locationresponse">	Response location</label>' +
				'<input class="datafield-responselocation" type="text" name="' + randID + '-locationresponse-name" id="contact-' + randID + '-locationresponse" value="' + (endpoint.ResponseLocation || '') + '" />' +
			'</div>';

		endpointHTML += '<button style="display: block; clear: both" class="remove">Remove</button>' +
			'</fieldset>';

		$(endpointHTML).appendTo("div#saml2sp > div.content").find('button.remove').click(function(e) {
			e.preventDefault();
			$(e.target).closest('fieldset').remove();
		});
	}

	SAMLmetaJS.plugins.saml2sp = {
		tabClick: function (handler) {
			handler($("a[href='#saml2sp']"));
		},

		addTab: function (pluginTabs) {
			pluginTabs.list.push('<li><a href="#saml2sp">SAML Endpoints</a></li>');
			pluginTabs.content.push(
				'<div id="saml2sp">' +
					'<div class="content"></div>' +
					'<div><button class="addendpoint">Add new endpoint</button></div>' +
				'</div>'
			);

		},

		setUp: function () {
			$("div#saml2sp button.addendpoint").click(function(e) {
				e.preventDefault();
				addEndpoint({});
			});
		},

		fromXML: function (entitydescriptor) {
			var i, endpoint;

			// Add existing endpoints (from XML)
			clearEndpoints();
			if (entitydescriptor.saml2sp) {
				for (endpoint in entitydescriptor.saml2sp) {
					if (entitydescriptor.saml2sp.hasOwnProperty(endpoint)) {
						
						if (endpoint !== 'AssertionConsumerService' &&
							endpoint !== 'SingleLogoutService'
						) {
							continue;
						}
						
						for (i = 0; i < entitydescriptor.saml2sp[endpoint].length; i++) {
							addEndpoint(entitydescriptor.saml2sp[endpoint][i], endpoint);
						}
					}
				}
			}
		},

		toXML: function (entitydescriptor) {
			var 
				indexcounter = 1,
				indextaken = {};
				
			$('div#saml2sp fieldset').each(function (index, element) {
				var newEndpoint = {};
				var endpointType, index;

				if (!$(element).find('input').eq(0).attr('value')) {
					return;
				}

				endpointType = $(element).find('select.datafield-type').val();
				newEndpoint.Binding = $(element).find('select.datafield-binding').attr('value');				
				newEndpoint.Location = $(element).find('input.datafield-location').attr('value');
				newEndpoint.ResponseLocation = $(element).find('input.datafield-responselocation').attr('value');
				
				index  = $(element).find('input.datafield-index').attr('value');
				if (!index) {
					if (endpointType === 'AssertionConsumerService') {
						while(indextaken[indexcounter]) { indexcounter++; }
						index = indexcounter;						
					}
				}
				if (index) {
					indextaken[index] = 1;
					newEndpoint.index = index;					
				}
				
				if (!entitydescriptor.saml2sp) entitydescriptor.saml2sp = {};
				if (!entitydescriptor.saml2sp[endpointType]) entitydescriptor.saml2sp[endpointType] = [];
				entitydescriptor.saml2sp[endpointType].push(newEndpoint);
			});
		}
	};

}(jQuery));
