/*jslint rhino: true, browser: true, onevar: false */
if (typeof console === "undefined" || typeof console.log === "undefined") {var console = { log: function() {} }}

// Hack to initiatlize a DOMParser in browser that do not support this natively.
// Hack found here:
//	https://sites.google.com/a/van-steenbeek.net/archive/explorer_domparser_parsefromstring
//
if(typeof(DOMParser) === 'undefined') {
	DOMParser = function() {};
	DOMParser.prototype.parseFromString = function(str, contentType) {
		var xmldata = null;

		if (typeof(ActiveXObject) !== 'undefined') {
			xmldata = new ActiveXObject('MSXML.DomDocument');

			xmldata.async = false;
			xmldata.loadXML(str);
			return xmldata;

		} else if(typeof(XMLHttpRequest) !== 'undefined') {
			xmldata = new XMLHttpRequest();
			if(!contentType) {
				contentType = 'application/xml';
			}

			xmldata.open('GET', 'data:' + contentType + ';charset=utf-8,' + encodeURIComponent(str), false);
			if(xmldata.overrideMimeType) {
				xmldata.overrideMimeType(contentType);
			}

			xmldata.send(null);
			return xmldata.responseXML;
		}
	};
}

var SAMLmetaJS = {};

(function($) {

	SAMLmetaJS.plugins = {};

	SAMLmetaJS.pluginEngine = {
		execute: function(hook, parameters) {
			var plugin;
			if (!SAMLmetaJS.plugins) {
				return;
			}
			for (plugin in SAMLmetaJS.plugins) {
				SAMLmetaJS.pluginEngine.executeOne(plugin, hook, parameters);
			}
		},
		executeOne: function (plugin, hook, parameters) {
			if (!SAMLmetaJS.plugins) { 
				return;
			}
			if (SAMLmetaJS.plugins[plugin] && SAMLmetaJS.plugins[plugin][hook]) {
				// console.log('Executing hook [' + hook + '] in plugin [' + plugin + ']');
				return SAMLmetaJS.plugins[plugin][hook].apply(null, parameters);
			}
		}
	};


	SAMLmetaJS.Constants = {
		'ns' : {
			'md': "urn:oasis:names:tc:SAML:2.0:metadata",
			'mdui': "urn:oasis:names:tc:SAML:metadata:ui",
			'mdattr': "urn:oasis:names:tc:SAML:metadata:attribute",
			'saml': "urn:oasis:names:tc:SAML:2.0:assertion",
			'init': "urn:oasis:names:tc:SAML:profiles:SSO:request-init",
			'idpdisc': "urn:oasis:names:tc:SAML:profiles:SSO:idp-discovery-protocol",
			'xsd': "http://www.w3.org/2001/XMLSchema",
			'ds': "http://www.w3.org/2000/09/xmldsig#",
			'xenc': "http://www.w3.org/2001/04/xmlenc#"
		},
		'certusage': {
			'both': 'Both',
			'signing': 'Signing',
			'encryption': 'Encryption'
		},
		'algorithms': {
			'http://www.w3.org/2001/04/xmlenc#tripledes-cbc': 'TRIPLEDES',
			'http://www.w3.org/2001/04/xmlenc#aes128-cbc': 'AES-128',
			'http://www.w3.org/2001/04/xmlenc#aes256-cbc': 'AES-256',
			'http://www.w3.org/2001/04/xmlenc#aes192-cbc': 'AES-192',
			'http://www.w3.org/2001/04/xmlenc#rsa-1_5': 'RSA-v1.5',
			'http://www.w3.org/2001/04/xmlenc#rsa-oaep-mgf1p': 'RSA-OAEP',
			'http://www.w3.org/2001/04/xmlenc#dh': 'Diffie-Hellman',
			'http://www.w3.org/2001/04/xmlenc#kw-tripledes': 'TRIPLEDES KeyWrap',
			'http://www.w3.org/2001/04/xmlenc#kw-aes128': 'AES-128 KeyWrap',
			'http://www.w3.org/2001/04/xmlenc#kw-aes256': 'AES-256 KeyWrap',
			'http://www.w3.org/2001/04/xmlenc#kw-aes192': 'AES-192 KeyWrap',
			'http://www.w3.org/2000/09/xmldsig#sha1': 'SHA1',
			'http://www.w3.org/2001/04/xmlenc#sha256': 'SHA256',
			'http://www.w3.org/2001/04/xmlenc#sha512': 'SHA512',
			'http://www.w3.org/2001/04/xmlenc#ripemd160': 'RIPEMD-160',
			'http://www.w3.org/2000/09/xmldsig#': 'XML Digital Signature',
			'http://www.w3.org/TR/2001/REC-xml-c14n-20010315': 'Canonical XML (omits comments)',
			'http://www.w3.org/TR/2001/REC-xml-c14n-20010315#WithComments': 'Canonical XML with Comments',
			'http://www.w3.org/2001/10/xml-exc-c14n#': 'Exclusive XML Canonicalization (omits comments)',
			'http://www.w3.org/2001/10/xml-exc-c14n#WithComments': 'Exclusive XML Canonicalization with Comments',
			'http://www.w3.org/2000/09/xmldsig#base64': 'base64'
		},
		'languages': {
			'en': 'English',
			'no': 'Norwegian (bokmål)',
			'nn': 'Norwegian (nynorsk)',
			'se': 'Sámegiella',
			'da': 'Danish',
			'de': 'German',
			'sv': 'Swedish',
			'fi': 'Finnish',
			'es': 'Español',
			'fr': 'Français',
			'it': 'Italian',
			'nl': 'Nederlands',
			'lb': 'Luxembourgish',
			'cs': 'Czech',
			'sl': 'Slovenščina',
			'lt': 'Lietuvių kalba',
			'hr': 'Hrvatski',
			'hu': 'Magyar',
			'pl': 'Język polski',
			'pt': 'Português',
			'pt-BR': 'Português brasileiro',
			'tr': 'Türkçe',
			'el': 'ελληνικά',
			'ja': 'Japanese (日本語)'
		},
		'contactTypes' : {
			'administrative' : 'Administrative',
			'technical': 'Technical',
			'support': 'Support',
			'billing': 'Billing',
			'other': 'Other'
		},
		'endpointTypes' : {
			'sp': {
				'ArtifactResolutionService': 'ArtifactResolutionService',
				'AssertionConsumerService': 'AssertionConsumerService',
				'ManageNameIDService': 'ManageNameIDService',
				'SingleLogoutService': 'SingleLogoutService',
				// Extensions defined at Service Provider Request Initiation Protocol and Profile Version 1.0
				'RequestInitiator': 'RequestInitiator',
				'DiscoveryResponse': 'DiscoveryResponse'
			},
			'idp' : {
				'ArtifactResolutionService': 'ArtifactResolutionService',
				'AssertionIDRequestService': 'AssertionIDRequestService',
				'ManageNameIDService': 'ManageNameIDService',
				'NameIDMappingService': 'NameIDMappingService',
				'SingleLogoutService': 'SingleLogoutService',
				'SingleSignOnService': 'SingleSignOnService'
			}
		},
		'bindings': {
			'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect': 'HTTP Redirect',
			'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST': 'HTTP POST',
			'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Artifact': 'HTTP Artifact',
			'urn:oasis:names:tc:SAML:2.0:bindings:SOAP': 'SOAP',
			'urn:oasis:names:tc:SAML:2.0:bindings:PAOS': 'Reverse SOAP (PAOS)',
			'urn:oasis:names:tc:SAML:profiles:SSO:request-init': 'Request Initiator',
			'urn:oasis:names:tc:SAML:profiles:SSO:idp-discovery-protocol': 'Discovery Response'
		},
		'attributes' : {
			'urn:oid:0.9.2342.19200300.100.1.1': 'uid',
			'urn:oid:0.9.2342.19200300.100.1.10': 'manager',
			'urn:oid:0.9.2342.19200300.100.1.2': 'textEncodedORAddress',
			'urn:oid:0.9.2342.19200300.100.1.20': 'homePhone',
			'urn:oid:0.9.2342.19200300.100.1.22': 'otherMailbox',
			'urn:oid:0.9.2342.19200300.100.1.3': 'mail',
			'urn:oid:0.9.2342.19200300.100.1.39': 'homePostalAddress',
			'urn:oid:0.9.2342.19200300.100.1.40': 'personalTitle',
			'urn:oid:0.9.2342.19200300.100.1.41': 'mobile',
			'urn:oid:0.9.2342.19200300.100.1.42': 'pager',
			'urn:oid:0.9.2342.19200300.100.1.43': 'co',
			'urn:oid:0.9.2342.19200300.100.1.6': 'roomNumber',
			'urn:oid:0.9.2342.19200300.100.1.60': 'jpegPhoto',
			'urn:oid:0.9.2342.19200300.100.1.7': 'photo',
			'urn:oid:1.2.840.113549.1.9.1': 'email',
			'urn:oid:1.3.6.1.4.1.2428.90.1.1': 'norEduOrgUniqueNumber',
			'urn:oid:1.3.6.1.4.1.2428.90.1.11': 'norEduOrgSchemaVersion',
			'urn:oid:1.3.6.1.4.1.2428.90.1.12': 'norEduOrgNIN',
			'urn:oid:1.3.6.1.4.1.2428.90.1.2': 'norEduOrgUnitUniqueNumber',
			'urn:oid:1.3.6.1.4.1.2428.90.1.3': 'norEduPersonBirthDate',
			'urn:oid:1.3.6.1.4.1.2428.90.1.4': 'norEduPersonLIN',
			'urn:oid:1.3.6.1.4.1.2428.90.1.5': 'norEduPersonNIN',
			'urn:oid:1.3.6.1.4.1.2428.90.1.6': 'norEduOrgAcronym',
			'urn:oid:1.3.6.1.4.1.2428.90.1.7': 'norEduOrgUniqueIdentifier',
			'urn:oid:1.3.6.1.4.1.2428.90.1.8': 'norEduOrgUnitUniqueIdentifier',
			'urn:oid:1.3.6.1.4.1.2428.90.1.9': 'federationFeideSchemaVersion',
			'urn:oid:1.3.6.1.4.1.250.1.57': 'labeledURI',
			'urn:oid:1.3.6.1.4.1.5923.1.1.1.1': 'eduPersonAffiliation',
			'urn:oid:1.3.6.1.4.1.5923.1.1.1.10': 'eduPersonTargetedID',
			'urn:oid:1.3.6.1.4.1.5923.1.1.1.2': 'eduPersonNickname',
			'urn:oid:1.3.6.1.4.1.5923.1.1.1.3': 'eduPersonOrgDN',
			'urn:oid:1.3.6.1.4.1.5923.1.1.1.4': 'eduPersonOrgUnitDN',
			'urn:oid:1.3.6.1.4.1.5923.1.1.1.5': 'eduPersonPrimaryAffiliation',
			'urn:oid:1.3.6.1.4.1.5923.1.1.1.6': 'eduPersonPrincipalName',
			'urn:oid:1.3.6.1.4.1.5923.1.1.1.7': 'eduPersonEntitlement',
			'urn:oid:1.3.6.1.4.1.5923.1.1.1.8': 'eduPersonPrimaryOrgUnitDN',
			'urn:oid:1.3.6.1.4.1.5923.1.1.1.9': 'eduPersonScopedAffiliation',
			'urn:oid:1.3.6.1.4.1.5923.1.2.1.2': 'eduOrgHomePageURI',
			'urn:oid:1.3.6.1.4.1.5923.1.2.1.3': 'eduOrgIdentityAuthNPolicyURI',
			'urn:oid:1.3.6.1.4.1.5923.1.2.1.4': 'eduOrgLegalName',
			'urn:oid:1.3.6.1.4.1.5923.1.2.1.5': 'eduOrgSuperiorURI',
			'urn:oid:1.3.6.1.4.1.5923.1.2.1.6': 'eduOrgWhitePagesURI',
			'urn:oid:1.3.6.1.4.1.5923.1.5.1.1': 'isMemberOf',
			'urn:oid:2.16.840.1.113730.3.1.241': 'displayName',
			'urn:oid:2.16.840.1.113730.3.1.3': 'employeeNumber',
			'urn:oid:2.16.840.1.113730.3.1.39': 'preferredLanguage',
			'urn:oid:2.16.840.1.113730.3.1.4': 'employeeType',
			'urn:oid:2.16.840.1.113730.3.1.40': 'userSMIMECertificate',
			'urn:oid:2.5.4.10': 'o',
			'urn:oid:2.5.4.11': 'ou',
			'urn:oid:2.5.4.12': 'title',
			'urn:oid:2.5.4.13': 'description',
			'urn:oid:2.5.4.16': 'postalAddress',
			'urn:oid:2.5.4.17': 'postalCode',
			'urn:oid:2.5.4.18': 'postOfficeBox',
			'urn:oid:2.5.4.19': 'physicalDeliveryOfficeName',
			'urn:oid:2.5.4.20': 'telephoneNumber',
			'urn:oid:2.5.4.21': 'telexNumber',
			'urn:oid:2.5.4.3': 'cn',
			'urn:oid:2.5.4.36': 'userCertificate',
			'urn:oid:2.5.4.4': 'sn',
			'urn:oid:2.5.4.41': 'name',
			'urn:oid:2.5.4.42': 'givenName',
			'urn:oid:2.5.4.7': 'l',
			'urn:oid:2.5.4.9': 'street'
		}
	};

	SAMLmetaJS.TestEngine = function(ruleset) {
		if (
			(typeof ruleset === 'undefined') ||
			(ruleset === null)
			){

			this.ruleset = {}
		} else {
			this.ruleset = ruleset;
		}
		this.tests = [];
	}

	SAMLmetaJS.TestEngine.prototype.addTest = function(test) {
		if (this.ruleset.hasOwnProperty(test.id)) {
			console.log('Overriding significance from [' + test.significance + '] to [' + this.ruleset[test.id] + '] for [' + test.id + ']');
			test.significance = this.ruleset[test.id];
		}
		this.tests.push(test);
	}

	SAMLmetaJS.TestEngine.prototype.getResult = function() {
		return this.tests;
	}

	SAMLmetaJS.TestEngine.prototype.reset = function() {
		this.tests = [];
	}

	SAMLmetaJS.validatorManager = function (validationContext) {
		var
			hideErrors = function (element) {
				$(element).find('ul.errors').html('');
			},
			showErrors = function (element, errors) {
				var output = $.map(errors, function (e) {
					return '<li>' + e + '</li>';
				});
				$(element).find('ul.errors').html(output.join(''));
			};

		return function () {
			var errors = 0;

			$.each(validationContext, function (selector, validator) {
				$(selector).each(function (index, element) {
					var result = validator(element);
					hideErrors(element);
					if (result.errors.length > 0) {
						showErrors(element, result.errors);
						errors += result.errors.length;
					}
				});
			});

			return errors === 0;
		};
	};

	SAMLmetaJS.l10nValidator = function (element, errorMessage) {
		var value = null, lang = null, errors = [];
		value = $(element).children('input').attr('value');
		lang = $(element).children('select').val();

		if (!value) {
			errors.push(errorMessage);
		}
		return {
			value: value,
			lang: lang,
			errors: errors
		};
	};

	SAMLmetaJS.sync = function(node, options) {

		var
			currentTab = 'xml',
			mdreaderSetup = undefined,
			showValidation = false,
			showValidationLevel = {
				'info': true,
				'warning': true,
				'error': true,
				'ok': true
			};

		var setEntityID = function (entityid) {
			$("input#entityid").val(entityid);
		};

		var testEngine;


		var showTestResults = function(testEngine, showLevel) {
			var
				result = testEngine.getResult(),
				i = 0,
				testnode;

			testnode = $(node).parent().parent().find('div#samlmetajs_testresults');

			$(testnode).empty();

			for(i = 0; i < result.length; i ++) {
				if (showLevel[result[i].getLevel()]) {
					$(testnode).append(result[i].html() );
				}
			}

		}


		// This section extracts the information from the Metadata XML document,
		// and updates the UI elements to reflect that.
		var fromXML = function () {
			if (currentTab !== 'xml') return;
			currentTab = 'other';

			console.log('fromXML()');

			testEngine.reset();
			entitydescriptor = mdreader.parseFromString($(node).val());
			setEntityID(entitydescriptor.entityid);

			console.log(entitydescriptor);

			if (showValidation === true) {
				showTestResults(testEngine, showValidationLevel);
			}

			SAMLmetaJS.pluginEngine.execute('fromXML', [entitydescriptor]);
		};


		// This section extracts the information from the Metadata UI elements,
		// and applies this to the XML metadata document.
		var toXML = function() {
			if (currentTab !== 'other') return;
			currentTab = 'xml';
			console.log('toXML()');

			var entitydescriptor = new MDEntityDescriptor();

			entitydescriptor.entityid = $('input#entityid').val();

			SAMLmetaJS.pluginEngine.execute('toXML', [entitydescriptor]);

			console.log(entitydescriptor);

			// ---
			// Now the JSON object is created, and now we will apply this to the Metadata XML document
			// in the textarea.

			var parser = SAMLmetaJS.xmlupdater($(node).val());
			parser.updateDocument(entitydescriptor);

			var xmlstring = parser.getXMLasString();
			xmlstring = SAMLmetaJS.XML.prettifyXML(xmlstring);
			$(node).val(xmlstring);

			/*
			 * Then parse the generated XML again, to perform the validation..
			 */
			if (showValidation === true) {
				testEngine.reset();
				entitydescriptor = mdreader.parseFromString($(node).val());
				setEntityID(entitydescriptor.entityid);
				showTestResults(testEngine, showValidationLevel);

				console.log(entitydescriptor);
			}
			// ---

		};

		var selectTab = function (event, ui) {
			var 
				isValid = true,
				$tabs = $(event.target),
				selected = $tabs.tabs("option", "selected"),
				tab = $tabs.find('.ui-tabs-panel').eq(selected).attr('id');

			if (tab !== 'rawmetadata') {
				isValid = SAMLmetaJS.pluginEngine.executeOne(tab, 'validate', []);
				if (typeof isValid === 'undefined') {
				    isValid = true;
				}
			}

			if (isValid && ui.index === 0) {  // rawmetadata tab
				toXML();
			}

			return isValid;
		};


		// Add content
		var embrace = function () {
			$(node).wrap('<div id="rawmetadata"></div>');
			$(node).parent().wrap('<div id="tabs" />');

			var metatab = $(node).parent();
			var tabnode = $(node).parent().parent();

			var pluginTabs = {'list': [], 'content': []};
			SAMLmetaJS.pluginEngine.execute('addTab', [pluginTabs]);

			metatab.append('<div>' +
						   '<button class="prettify">Pretty format</button>' +
						   '<button class="wipe">Wipe</button>' +
						   '</div>');

			tabnode.prepend('<ul>' +
							'<li><a href="#rawmetadata">Metadata</a></li>' +
							pluginTabs.list.join('') +
							'</ul>');
			tabnode.prepend('<div id="samlmetajs_testresults"></div>');
			tabnode.append(pluginTabs.content.join(''));

			tabnode.tabs({select: selectTab});
		};


		embrace();

		if (options.ruleset) {
			mdreaderSetup = options.ruleset;
		}

		if (options.showValidation) {
			showValidation = options.showValidation;
		}
		if (options.showValidationLevel) {
			showValidationLevel = options.showValidationLevel;
		}

		testEngine = new SAMLmetaJS.TestEngine(mdreaderSetup);

		mdreader.setup({
			testProcessor: function(t) {
				testEngine.addTest(t);
			}
		});

		SAMLmetaJS.pluginEngine.execute('tabClick', [
			function(node) {
				$(node).click(fromXML);
			}
		]);

		if (options && options.savehook) {
			$(options.savehook).submit(toXML);
		}

		// Adding handlers to the other buttons.

		$("div#rawmetadata button.prettify").click(function(e) {
			e.preventDefault();
			$(node).val(SAMLmetaJS.XML.prettifyXML($(node).val()));
		});
		$("div#rawmetadata button.wipe").click(function(e) {
			e.preventDefault();
			$(node).val('');
		});

		SAMLmetaJS.pluginEngine.execute('setUp', []);
	};


	$.vari = "$.vari";
	$.fn.foo = "$.fn.vari";

	// $.fn is the object we add our custom functions to
	$.fn.SAMLmetaJS = function(options) {

		return this.each(function() {
			SAMLmetaJS.sync(this, options);
		});
	};
}(jQuery));
