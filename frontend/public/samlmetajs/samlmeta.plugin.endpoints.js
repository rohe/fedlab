(function($) {
	var UI = {
		clearEndpoints: function () {
			$("div#endpoints > div.content").empty();
		},

		addEndpoint: function (role, endpoint, endpointname) {
			var checked, endpointHTML, foundBinding, binding, fillEndpointTypes;
			var randID ='endpoint-' + Math.floor(Math.random() * 10000 + 1000);

			endpointHTML = [
				'<fieldset><legend>' + (endpointname || 'Endpoint') + '</legend>',
				'<ul class="errors"></ul>',
				'<div class="endpointfield inlineField">',
				'Role:'
			];

			// ---- Role
			endpointHTML.push('<div class="radioGroup">');
			endpointHTML.push('<input class="role" type="radio" id="' + randID + '-role-idp" name="' + randID + '-role-name" value="idp" ' + (role === 'idp' ? 'checked="checked"' : '') + '" />');
			endpointHTML.push('<label for="' + randID + '-role-idp">IdP</label>');
			endpointHTML.push('<input class="role" type="radio" id="' + randID + '-role-sp" name="' + randID + '-role-name" value="sp" ' + (role === 'sp' ? 'checked="checked"' : '') + '" />');
			endpointHTML.push('<label for="' + randID + '-role-sp">SP</label>');
			endpointHTML.push('</div>');
			endpointHTML.push('</div>');

			// ---- Type of endpoint selector
			endpointHTML.push('<div class="inlineField">');
			endpointHTML.push('<label for="' + randID + '-type">Endpoint type: </label>');
			endpointHTML.push('<select class="datafield-type" name="' + randID + '-type-name" id="' + randID + '-type">');
			// This select is filled later with the fillEndpointTypes function
			endpointHTML.push('</select>');
			endpointHTML.push('</div>');

			if (endpoint.index) {
				endpointHTML.push('<input type="hidden" class="datafield-index" id="' + randID + '-binding" name="' + randID + '-index-name" value="');
				endpointHTML.push(endpoint.index + '" />');
			}

			// ---- Binding
			endpointHTML.push('<div class="endpointfield inlineField">');
			endpointHTML.push('<label for="' + randID + '-binding">Binding: </label>');
			endpointHTML.push('<select class="datafield-binding" name="' + randID + '-binding-name" id="' + randID + '-binding">');

			foundBinding = false;
			for (binding in SAMLmetaJS.Constants.bindings) {
				if (SAMLmetaJS.Constants.bindings.hasOwnProperty(binding)) {
					checked = '';
					if (endpoint.Binding === binding) {
						checked = ' selected="selected" ';
						foundBinding = true;
					}
					endpointHTML.push('<option value="' + binding + '" ' + checked + '>');
					endpointHTML.push(SAMLmetaJS.Constants.bindings[binding]);
					endpointHTML.push('</option>');
				}
			}

			if (endpoint.Binding && !foundBinding) {
				endpointHTML.push('<option value="' + endpoint.Binding + '" selected="selected">Unknown binding (' + endpoint.Binding + ')</option>');
			}
			endpointHTML.push('</select>');
			endpointHTML.push('</div>');

			// Text field for location
			endpointHTML.push('<div class="endpointfield endpointfield-location newRow wideField">');
			endpointHTML.push('<label for="' + randID + '-location">Location:</label>');
			endpointHTML.push('<input class="datafield-location" type="text" name="' + randID + '-location-name" id="contact-' + randID + '-location" value="' + (endpoint.Location || '') + '" />');
			endpointHTML.push('</div>');

			// Text field for response location
			endpointHTML.push('<div class="endpointfield wideField">');
			endpointHTML.push('<label for="' + randID + '-locationresponse">Response location:</label>');
			endpointHTML.push('<input class="datafield-responselocation" type="text" name="' + randID + '-locationresponse-name" id="contact-' + randID + '-locationresponse" value="' + (endpoint.ResponseLocation || '') + '" />');
			endpointHTML.push('</div>');

			endpointHTML.push('<button style="display: block; clear: both" class="remove">Remove</button>');
			endpointHTML.push('</fieldset>');

			$(endpointHTML.join('')).appendTo("div#endpoints > div.content")
				.find('button.remove').click(function(e) {
					e.preventDefault();
					$(e.target).closest('fieldset').remove();
				}).end()
				.find('input.role').change(function (e) {
					var role = $(this).val();
					var $select = $(this).closest('fieldset').find('select.datafield-type');
					fillEndpointTypes($select, role);
				});

			fillEndpointTypes = function ($select, role) {
			    var endpointTypes = SAMLmetaJS.Constants.endpointTypes[role];
			    var options = [];
			    for (endpointType in endpointTypes) {
				    if (endpointTypes.hasOwnProperty(endpointType)) {
					    checked = '';
					    if (endpointType === endpointname) {
						    checked = ' selected="selected" ';
					    }
					    options.push('<option value="' + endpointType + '" ' + checked + '>');
					    options.push(endpointTypes[endpointType]);
					    options.push('</option>');
				    }
			    }
			    $select.html(options.join(''));
			};

			fillEndpointTypes($('div#endpoints select#' + randID + '-type'), role);
		},
		validateEndpoint: function (element) {
			var role = null, endpointType = null, endpoint = {}, errors = [];

			role = $(element).find('input.role:checked').val();
			endpointType = $(element).find('select.datafield-type').val();
			endpoint.Binding = $(element).find('select.datafield-binding').attr('value');
			endpoint.Location = $(element).find('input.datafield-location').attr('value');
			endpoint.ResponseLocation = $(element).find('input.datafield-responselocation').attr('value');

			// Check for required fields
			if (!role) {
				errors.push("The role is required");
			}
			if (!endpointType) {
				errors.push("The endpoint type is required");
			}
			if (!endpoint.Binding) {
				errors.push("The binding is required");
			}
			if (!endpoint.Location) {
				errors.push("The location is required");
			}

			return {
				role: role,
				endpointType: endpointType,
				endpoint: endpoint,
				errors: errors
			};
		}
	};

	var isEndpoint = function (endpointTypes, endpoint) {
		for (endpointType in endpointTypes) {
			if (endpointTypes.hasOwnProperty(endpointType)) {
				if (endpointType === endpoint) {
					return true;
				}
			}
		}
		return false;
	}

	var isSPEndpoint = function (endpoint) {
		return isEndpoint(SAMLmetaJS.Constants.endpointTypes.sp, endpoint);
	};

	var isIdPEndpoint = function (endpoint) {
		return isEndpoint(SAMLmetaJS.Constants.endpointTypes.idp, endpoint);
	};

	SAMLmetaJS.plugins.endpoints = {
		tabClick: function (handler) {
			handler($("a[href='#endpoints']"));
		},

		addTab: function (pluginTabs) {
			pluginTabs.list.push('<li><a href="#endpoints">SAML Endpoints</a></li>');
			pluginTabs.content.push(
				'<div id="endpoints">' +
					'<div class="content"></div>' +
					'<div><button class="addendpoint">Add new endpoint</button></div>' +
				'</div>'
			);
		},

		setUp: function () {
			$("div#endpoints button.addendpoint").click(function(e) {
				e.preventDefault();
				UI.addEndpoint('', {});
			});
		},

		fromXML: function (entitydescriptor) {
			var i, endpoint;

			// Add existing endpoints (from XML)
			UI.clearEndpoints();
			if (entitydescriptor.saml2sp) {
				for (endpoint in entitydescriptor.saml2sp) {
					if (entitydescriptor.saml2sp.hasOwnProperty(endpoint)) {

						if (!isSPEndpoint(endpoint)) {
							continue;
						}

						for (i = 0; i < entitydescriptor.saml2sp[endpoint].length; i++) {
							UI.addEndpoint('sp', entitydescriptor.saml2sp[endpoint][i], endpoint);
						}
					}
				}
			}
			if (entitydescriptor.saml2idp) {
				for (endpoint in entitydescriptor.saml2idp) {
					if (entitydescriptor.saml2idp.hasOwnProperty(endpoint)) {

						if (!isIdPEndpoint(endpoint)) {
							continue;
						}

						for (i = 0; i < entitydescriptor.saml2idp[endpoint].length; i++) {
							UI.addEndpoint('idp', entitydescriptor.saml2idp[endpoint][i], endpoint);
						}
					}
				}
			}
		},

		toXML: function (entitydescriptor) {
			var
				indexcounter = 1,
				indextaken = {};

			$('div#endpoints fieldset').each(function (index, element) {
				var index;
				var result = UI.validateEndpoint(element);

				if (result.errors.length > 0) {
					return;
				}

				index  = $(element).find('input.datafield-index').attr('value');
				if (!index) {
					if (result.endpointType === 'AssertionConsumerService') {
						while(indextaken[indexcounter]) { indexcounter++; }
						index = indexcounter;
					}
				}
				if (index) {
					indextaken[index] = 1;
					result.endpoint.index = index;
				}

				if (result.role === 'idp') {

					if (!entitydescriptor.saml2idp) {
						entitydescriptor.saml2idp = {};
					}
					if (!entitydescriptor.saml2idp[result.endpointType]) {
						entitydescriptor.saml2idp[result.endpointType] = [];
					}
					entitydescriptor.saml2idp[result.endpointType].push(result.endpoint);

				} else if (result.role === 'sp') {

					if (!entitydescriptor.saml2sp) {
						entitydescriptor.saml2sp = {};
					}
					if (!entitydescriptor.saml2sp[result.endpointType]) {
						entitydescriptor.saml2sp[result.endpointType] = [];
					}
					entitydescriptor.saml2sp[result.endpointType].push(result.endpoint);

				}
			});
			console.log(entitydescriptor);
		},
		validate: function () {
			var validator = SAMLmetaJS.validatorManager({
				'div#endpoints fieldset': UI.validateEndpoint
			});
			return validator();
		}
	};

}(jQuery));
