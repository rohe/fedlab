// Library to update XML Document from JSON object.
SAMLmetaJS.xmlupdater = function(xmlstring) {
	var parser = null;
	var doc = null;

	var resultObject = {};

	parser = new DOMParser();
	doc = parser.parseFromString(xmlstring, "text/xml");

	return {

		"updateDocument": function(entitydescriptor) {

			console.log('Update XML document');

			var root, idpdescriptor, spdescriptor, i, entityExtensions, entityAttributes;
			root = this.addIfNotEntityDescriptor();

			if (entitydescriptor.entityid) {
				root.setAttribute('entityID', entitydescriptor.entityid);
			}

			if (entitydescriptor.entityAttributes) {
				entityExtensions = this.addIfNotEntityExtensions(root);
				entityAttributes = SAMLmetaJS.XML.addNodeIfNotExists(doc, entityExtensions, 'EntityAttributes', SAMLmetaJS.Constants.ns.mdattr, 'mdattr');

				SAMLmetaJS.XML.wipeChildren(entityAttributes, SAMLmetaJS.Constants.ns.saml, 'Attribute');
				for(i = 0; i < entitydescriptor.entityAttributes.length; i += 1) {
					this.addAttribute(entityAttributes, entitydescriptor.entityAttributes[i]);
				}
			} else {
				SAMLmetaJS.XML.wipeChildren(root, SAMLmetaJS.Constants.ns.md, 'Extensions');
			}

			if (entitydescriptor.saml2idp) {
				idpdescriptor = this.addIfNotIDPSSODescriptor(root);
				this.addIdP(idpdescriptor, entitydescriptor);
			} else {
				SAMLmetaJS.XML.wipeChildren(root, SAMLmetaJS.Constants.ns.md, 'IDPSSODescriptor');
			}

			if (entitydescriptor.saml2sp) {
				spdescriptor = this.addIfNotSPSSODescriptor(root);
				this.addSP(spdescriptor, entitydescriptor);
			} else {
				SAMLmetaJS.XML.wipeChildren(root, SAMLmetaJS.Constants.ns.md, 'SPSSODescriptor');
			}

			if (entitydescriptor.contacts) {
				SAMLmetaJS.XML.wipeChildren(root, SAMLmetaJS.Constants.ns.md, 'ContactPerson');
				for(i = 0; i < entitydescriptor.contacts.length; i++) {
					this.addContact(root, entitydescriptor.contacts[i]);
				}
			} else {
				SAMLmetaJS.XML.wipeChildren(root, SAMLmetaJS.Constants.ns.md, 'ContactPerson');
			}

			this.addOrganization(root, entitydescriptor);
		},

		"addOrganization": function (parent, entitydescriptor) {
			var node, lang;
			if (entitydescriptor.organization) {
				SAMLmetaJS.XML.wipeChildren(parent, SAMLmetaJS.Constants.ns.md, 'Organization');
				node = doc.createElementNS(SAMLmetaJS.Constants.ns.md, 'md:Organization');

				if (entitydescriptor.organization.name) {
					for (lang in entitydescriptor.organization.name) {
						if (entitydescriptor.organization.name.hasOwnProperty(lang)) {
							this.addOrganizationElement(node, 'OrganizationName', lang, entitydescriptor.organization.name[lang]);
						}
					}
				}
				if (entitydescriptor.organization.displayname) {
					for (lang in entitydescriptor.organization.displayname) {
						if (entitydescriptor.organization.displayname.hasOwnProperty(lang)) {
							this.addOrganizationElement(node, 'OrganizationDisplayName', lang, entitydescriptor.organization.displayname[lang]);
						}
					}
				}
				if (entitydescriptor.organization.url) {
					for (lang in entitydescriptor.organization.url) {
						if (entitydescriptor.organization.url.hasOwnProperty(lang)) {
							this.addOrganizationElement(node, 'OrganizationURL', lang, entitydescriptor.organization.url[lang]);
						}
					}
				}

				parent.insertBefore(node, SAMLmetaJS.XML.findChildElement(parent,
					[
						{'localName': 'ContactPerson', 'namespaceURI': SAMLmetaJS.Constants.ns.md},
						{'localName': 'AdditionalMetadataLocation', 'namespaceURI': SAMLmetaJS.Constants.ns.md}
					]
				));

			} else {
				SAMLmetaJS.XML.wipeChildren(parent, SAMLmetaJS.Constants.ns.md, 'Organization');
			}
		},

		"addKeyDescriptor": function (node, entitydescriptor, role) {
			var container = 'saml2' + role;
			SAMLmetaJS.XML.wipeChildren(node, SAMLmetaJS.Constants.ns.md, 'KeyDescriptor');
			if (entitydescriptor.hasCertificate(role)) {
				for(i = 0; i < entitydescriptor[container].certs.length; i++) {
					this.addCert(node, entitydescriptor[container].certs[i]);
				}
			}
		},

		"addEndpoints": function (node, endpointTypes, endpoints) {
			for (endpointType in endpointTypes) {
				if (endpointTypes.hasOwnProperty(endpointType)) {
					SAMLmetaJS.XML.wipeChildren(node, SAMLmetaJS.Constants.ns.md, endpointType);
					if (SAMLmetaJS.tools.hasEndpoint(endpoints, endpointType)) {
						for (i = 0; i < endpoints[endpointType].length; i += 1) {
							this.addEndpoint(node, endpointType, endpoints[endpointType][i]);
						}
					}
				}
			}
		},

		"addIdP": function (idpdescriptor, entitydescriptor) {
			this.addKeyDescriptor(idpdescriptor, entitydescriptor, 'idp');
			this.addEndpoints(idpdescriptor, SAMLmetaJS.Constants.endpointTypes.idp, entitydescriptor.saml2idp);
		},

		"addSP": function(spdescriptor, entitydescriptor) {
			var i, hasRequestInitiator, hasDiscoveryResponse, mdui, extensions, attributeconsumer, attr;

			hasRequestInitiator = SAMLmetaJS.tools.hasEndpoint(entitydescriptor.saml2sp, 'RequestInitiator');
			hasDiscoveryResponse = SAMLmetaJS.tools.hasEndpoint(entitydescriptor.saml2sp, 'DiscoveryResponse');

			if (
				SAMLmetaJS.tools.hasContents(entitydescriptor.name) ||
				SAMLmetaJS.tools.hasContents(entitydescriptor.descr) ||
				entitydescriptor.location ||
				hasRequestInitiator ||
				hasDiscoveryResponse ||
				entitydescriptor.hasLogo() ||
				entitydescriptor.hasInformationURL() ||
				entitydescriptor.hasPrivacyStatementURL() ||
				entitydescriptor.hasLocation()
			) {
				extensions = this.addIfNotExtensions(spdescriptor);
				mdui = SAMLmetaJS.XML.addNodeIfNotExists(doc, extensions, 'UIInfo', SAMLmetaJS.Constants.ns.mdui, 'mdui');
				this.updateMDUI(mdui, entitydescriptor);
				SAMLmetaJS.XML.wipeChildren(extensions, SAMLmetaJS.Constants.ns.init, 'RequestInitiator');
				if (hasRequestInitiator) {
					for (i = 0; i < entitydescriptor.saml2sp.RequestInitiator.length; i += 1) {
						this.addExtensionEndpoint(extensions, entitydescriptor.saml2sp.RequestInitiator[i], 'init:RequestInitiator', SAMLmetaJS.Constants.ns.init);
					}
				}

				SAMLmetaJS.XML.wipeChildren(extensions, SAMLmetaJS.Constants.ns.idpdisc, 'DiscoveryResponse');
				if (hasDiscoveryResponse) {
					for (i = 0; i < entitydescriptor.saml2sp.DiscoveryResponse.length; i += 1) {
						this.addExtensionEndpoint(extensions, entitydescriptor.saml2sp.DiscoveryResponse[i], 'idpdisc:DiscoveryResponse', SAMLmetaJS.Constants.ns.idpdisc);
					}
				}

			} else {
				SAMLmetaJS.XML.wipeChildren(spdescriptor, SAMLmetaJS.Constants.ns.md, 'Extensions');
			}

			this.addKeyDescriptor(spdescriptor, entitydescriptor, 'sp');
			this.addEndpoints(spdescriptor, SAMLmetaJS.Constants.endpointTypes.sp, entitydescriptor.saml2sp);

			if (SAMLmetaJS.tools.hasContents(entitydescriptor.name) &&
					entitydescriptor.saml2sp &&
					entitydescriptor.saml2sp.acs &&
					SAMLmetaJS.tools.hasContents(entitydescriptor.saml2sp.acs.attributes)
				) {

				attributeconsumer = this.addIfNotAttributeConsumingService(spdescriptor);
				this.updateAttributeConsumingService(attributeconsumer, entitydescriptor);

				for (attr in entitydescriptor.saml2sp.acs.attributes) {
					this.addRequestedAttribute(attributeconsumer, attr);

				}

			} else {
				SAMLmetaJS.XML.wipeChildren(spdescriptor, SAMLmetaJS.Constants.ns.md, 'AttributeConsumingService');
			}

		},

		"addCert": function(node, certificate) {
			var keydescriptor, keyinfo, x509data, x509cert, encryptionMethod, keySize, OAEPparams;

			keydescriptor = doc.createElementNS(SAMLmetaJS.Constants.ns.md, 'md:KeyDescriptor');

			if (certificate.use === 'signing' || certificate.use === 'encryption') {
				keydescriptor.setAttribute('use', certificate.use);
			}

			keyinfo = doc.createElementNS(SAMLmetaJS.Constants.ns.ds, 'ds:KeyInfo');
			x509data = doc.createElementNS(SAMLmetaJS.Constants.ns.ds, 'ds:X509Data');
			x509cert = doc.createElementNS(SAMLmetaJS.Constants.ns.ds, 'ds:X509Certificate');
			x509cert.appendChild(doc.createTextNode(certificate.cert));
			x509data.appendChild(x509cert);
			keyinfo.appendChild(x509data);
			keydescriptor.appendChild(keyinfo);

			if (certificate.algorithm) {
				encryptionMethod = doc.createElementNS(SAMLmetaJS.Constants.ns.md, 'md:EncryptionMethod');
				encryptionMethod.setAttribute('Algorithm', certificate.algorithm);
				if (certificate.keySize) {
					keySize = doc.createElementNS(SAMLmetaJS.Constants.ns.xenc, 'xenc:KeySize');
					keySize.appendChild(doc.createTextNode(certificate.keySize));
					encryptionMethod.appendChild(keySize);
				}
				if (certificate.OAEPparams) {
					OAEPparams = doc.createElement('OAEPparams');
					OAEPparams.appendChild(doc.createTextNode(certificate.OAEPparams));
					encryptionMethod.appendChild(OAEPparams);
				}
				keydescriptor.appendChild(encryptionMethod);
			}

			node.insertBefore(keydescriptor, SAMLmetaJS.XML.findChildElement(node,
				[
					{'localName': 'SingleLogoutService', 'namespaceURI': SAMLmetaJS.Constants.ns.md},
					{'localName': 'AssertionConsumerService', 'namespaceURI': SAMLmetaJS.Constants.ns.md},
					{'localName': 'AttributeConsumingService', 'namespaceURI': SAMLmetaJS.Constants.ns.md}
				]
			));


		},

		"addContact": function(node, contact) {
			var givenname,surname,emailaddress;
			var newNode = doc.createElementNS(SAMLmetaJS.Constants.ns.md, 'md:ContactPerson');
			if (contact.contactType) newNode.setAttribute('contactType', contact.contactType);

			if(contact.givenName) {
				givenname = doc.createElementNS(SAMLmetaJS.Constants.ns.md, 'md:GivenName');
				givenname.appendChild(doc.createTextNode(contact.givenName));
				newNode.appendChild(givenname);
			}
			if(contact.surName) {
				surname = doc.createElementNS(SAMLmetaJS.Constants.ns.md, 'md:SurName');
				surname.appendChild(doc.createTextNode(contact.surName));
				newNode.appendChild(surname);
			}
			if(contact.emailAddress) {
				emailaddress = doc.createElementNS(SAMLmetaJS.Constants.ns.md, 'md:EmailAddress');
				emailaddress.appendChild(doc.createTextNode(contact.emailAddress));
				newNode.appendChild(emailaddress);
			}
//			node.appendChild(newNode);
			node.insertBefore(newNode, SAMLmetaJS.XML.findChildElement(node,
				[
					{'localName': 'AdditionalMetadataLocation', 'namespaceURI': SAMLmetaJS.Constants.ns.md}
				]
			));
		},

		"addOrganizationElement": function(orgnode, type, lang, value) {
			var newNode;
			newNode = doc.createElementNS(SAMLmetaJS.Constants.ns.md, 'md:' + type);
			newNode.setAttribute('xml:lang', lang);
			newNode.appendChild(doc.createTextNode(value));

			orgnode.appendChild(newNode);

		},

		"updateMDUI": function(node, entitydescriptor) {
			if (SAMLmetaJS.tools.hasContents(entitydescriptor.name)) {
				SAMLmetaJS.XML.wipeChildren(node, SAMLmetaJS.Constants.ns.mdui, 'DisplayName');
				for(lang in entitydescriptor.name) {
					if (entitydescriptor.name.hasOwnProperty(lang)) {
						SAMLmetaJS.XML.addSimpleLocalizedAttribute(doc, node, SAMLmetaJS.Constants.ns.mdui, 'mdui:DisplayName', lang, entitydescriptor.name[lang]);
					}
				}
			}
			if (SAMLmetaJS.tools.hasContents(entitydescriptor.descr)) {
				SAMLmetaJS.XML.wipeChildren(node, SAMLmetaJS.Constants.ns.mdui, 'Description');
				for(lang in entitydescriptor.descr) {
					if (entitydescriptor.descr.hasOwnProperty(lang)) {
						SAMLmetaJS.XML.addSimpleLocalizedAttribute(doc, node, SAMLmetaJS.Constants.ns.mdui, 'mdui:Description', lang, entitydescriptor.descr[lang]);
					}
				}
			}
			if (entitydescriptor.hasLogo()) {
				SAMLmetaJS.XML.wipeChildren(node, SAMLmetaJS.Constants.ns.mdui, 'Logo');
				for(lang in entitydescriptor.saml2sp.mdui.logo) {
					if (entitydescriptor.saml2sp.mdui.logo.hasOwnProperty(lang)) {
						this.addMDUILogo(node, lang, entitydescriptor.saml2sp.mdui.logo[lang]);
					}
				}
			}
			if (entitydescriptor.hasKeywords()) {
				SAMLmetaJS.XML.wipeChildren(node, SAMLmetaJS.Constants.ns.mdui, 'Keywords');
				for(lang in entitydescriptor.saml2sp.mdui.keywords) {
					if (entitydescriptor.saml2sp.mdui.keywords.hasOwnProperty(lang)) {
						SAMLmetaJS.XML.addSimpleLocalizedAttribute(doc, node, SAMLmetaJS.Constants.ns.mdui, 'mdui:Keywords', lang, entitydescriptor.saml2sp.mdui.keywords[lang]);
					}
				}
			}
			if (entitydescriptor.hasInformationURL()) {
				SAMLmetaJS.XML.wipeChildren(node, SAMLmetaJS.Constants.ns.mdui, 'InformationURL');
				for(lang in entitydescriptor.saml2sp.mdui.informationURL) {
					if (entitydescriptor.saml2sp.mdui.informationURL.hasOwnProperty(lang)) {
						SAMLmetaJS.XML.addSimpleLocalizedAttribute(doc, node, SAMLmetaJS.Constants.ns.mdui, 'mdui:InformationURL', lang, entitydescriptor.saml2sp.mdui.informationURL[lang]);
					}
				}
			}
			if (entitydescriptor.hasPrivacyStatementURL()) {
				SAMLmetaJS.XML.wipeChildren(node, SAMLmetaJS.Constants.ns.mdui, 'PrivacyStatementURL');
				for(lang in entitydescriptor.saml2sp.mdui.privacyStatementURL) {
					if (entitydescriptor.saml2sp.mdui.privacyStatementURL.hasOwnProperty(lang)) {
						SAMLmetaJS.XML.addSimpleLocalizedAttribute(doc, node, SAMLmetaJS.Constants.ns.mdui, 'mdui:PrivacyStatementURL', lang, entitydescriptor.saml2sp.mdui.privacyStatementURL[lang]);
					}
				}
			}
			SAMLmetaJS.XML.wipeChildren(node, SAMLmetaJS.Constants.ns.mdui, 'GeolocationHint');
			if (entitydescriptor.hasLocation()) {
				this.addMDUILocation(node, entitydescriptor.getLocation());
			}
		},
		"addMDUILogo": function(node, lang, logo) {
			var newNode = doc.createElementNS(SAMLmetaJS.Constants.ns.mdui, 'mdui:Logo');
			var text = doc.createTextNode(logo.location);
			newNode.appendChild(text);
			if (lang !== '') {
				newNode.setAttribute('xml:lang', lang);
			}
			newNode.setAttribute('width', logo.width);
			newNode.setAttribute('height', logo.height);
			node.appendChild(newNode);
		},
		"addMDUILocation": function(node, location) {
			var newNode = doc.createElementNS(SAMLmetaJS.Constants.ns.mdui, 'mdui:GeolocationHint');
			var text = doc.createTextNode('geo:' + location);
			newNode.appendChild(text);
			node.appendChild(newNode);

		},
		"updateAttributeConsumingService": function(node, entitydescriptor) {
			var i, lang;
			for (i = 0; i < node.childNodes.length; i++ ) {
				var currentChild = node.childNodes[i];
				if (
						currentChild.nodeType == 1 &&  // type is Element
						currentChild.namespaceURI === SAMLmetaJS.Constants.ns.md
					) {
					node.removeChild(currentChild);
				}
			}

			if (entitydescriptor.name) {
				for(lang in entitydescriptor.name) {
					if (entitydescriptor.name.hasOwnProperty(lang)) {
						SAMLmetaJS.XML.addSimpleLocalizedAttribute(doc, node, SAMLmetaJS.Constants.ns.md, 'md:ServiceName', lang, entitydescriptor.name[lang]);
					}
				}
			}
			if (entitydescriptor.descr) {
				for(lang in entitydescriptor.descr) {
					if (entitydescriptor.descr.hasOwnProperty(lang)) {
						SAMLmetaJS.XML.addSimpleLocalizedAttribute(doc, node, SAMLmetaJS.Constants.ns.md, 'md:ServiceDescription', lang, entitydescriptor.descr[lang]);
					}
				}
			}

		},
		"addRequestedAttribute": function(node, attr) {
			var newNode = doc.createElementNS(SAMLmetaJS.Constants.ns.md, 'md:RequestedAttribute');
			newNode.setAttribute('Name', attr);
			newNode.setAttribute('NameFormat', 'urn:oasis:names:tc:SAML:2.0:attrname-format:uri');
			node.appendChild(newNode);
		},
		"addAttribute": function(node, attr) {
			var newNode = doc.createElementNS(SAMLmetaJS.Constants.ns.saml, 'saml:Attribute');
			newNode.setAttribute('Name', attr.name);
			if (attr.friendlyName) {
				newNode.setAttribute('FriendlyName', attr.friendlyName);
			}
			if (attr.nameFormat) {
				newNode.setAttribute('NameFormat', attr.nameFormat);
			}
			if (attr.values) {
				for (var i = 0; i < attr.values.length; i++ ) {
					var newValue = doc.createElementNS(SAMLmetaJS.Constants.ns.saml, 'saml:AttributeValue');
					newValue.appendChild(doc.createTextNode(attr.values[i]));
					newNode.appendChild(newValue);
				}

			}
			node.appendChild(newNode);
		},
		"addExtensionEndpoint": function (node, endpoint, endpointname, ns) {
			var newNode = doc.createElementNS(ns, endpointname);
			if (endpoint.Binding) {
				newNode.setAttribute('Binding', endpoint.Binding);
			}
			if (endpoint.Location) {
				newNode.setAttribute('Location', endpoint.Location);
			}
			node.appendChild(newNode);
		},
		"addIfNotEntityExtensions": function(node) {
			return SAMLmetaJS.XML.addNodeIfNotExists(doc, node, 'Extensions', SAMLmetaJS.Constants.ns.md, 'md', function (newNode) {
				node.insertBefore(newNode, SAMLmetaJS.XML.findChildElement(node, [
					{'localName': 'SPSSODescriptor', 'namespaceURI': SAMLmetaJS.Constants.ns.md},
					{'localName': 'IdPSSODescriptor', 'namespaceURI': SAMLmetaJS.Constants.ns.md}
				]));
			});
		},
		"addIfNotExtensions": function(node) {
			return SAMLmetaJS.XML.addNodeIfNotExists(doc, node, 'Extensions', SAMLmetaJS.Constants.ns.md, 'md', function (newNode) {
				node.insertBefore(newNode, SAMLmetaJS.XML.findChildElement(node, [
					{'localName': 'KeyDescriptor', 'namespaceURI': SAMLmetaJS.Constants.ns.md},
					{'localName': 'SingleLogoutService', 'namespaceURI': SAMLmetaJS.Constants.ns.md},
					{'localName': 'AssertionConsumerService', 'namespaceURI': SAMLmetaJS.Constants.ns.md},
					{'localName': 'AttributeConsumingService', 'namespaceURI': SAMLmetaJS.Constants.ns.md}
				]));
			});
		},
		"addIfNotAttributeConsumingService": function(node) {
			return SAMLmetaJS.XML.addNodeIfNotExists(doc, node, 'AttributeConsumingService', SAMLmetaJS.Constants.ns.md, 'md', function (newNode) {
				newNode.setAttribute('index', 0);
				node.insertBefore(newNode, SAMLmetaJS.XML.findChildElement(node, [
					{'localName': 'ContactPerson', 'namespaceURI': SAMLmetaJS.Constants.ns.md}
				]));
			});
		},
		"addEndpoint": function(node, endpointtype, endpoint) {
			var newNode, beforeNode;
			newNode = doc.createElementNS(SAMLmetaJS.Constants.ns.md, 'md:' + endpointtype);
			if (endpoint.Binding) newNode.setAttribute('Binding', endpoint.Binding);
			if (endpoint.Location) newNode.setAttribute('Location', endpoint.Location);
			if (endpoint.ResponseLocation) newNode.setAttribute('ResponseLocation', endpoint.ResponseLocation);
			if (endpoint.index) newNode.setAttribute('index', endpoint.index);

			/*
			 * Order of elements from XSD:

				From SSORoleDescriptorType
					<element ref="md:ArtifactResolutionService" minOccurs="0" maxOccurs="unbounded"/>
					<element ref="md:SingleLogoutService" minOccurs="0" maxOccurs="unbounded"/>
					<element ref="md:ManageNameIDService" minOccurs="0" maxOccurs="unbounded"/>
					<element ref="md:NameIDFormat" minOccurs="0" maxOccurs="unbounded"/>

				From SPSSORoleDescriptor
					<element ref="md:AssertionConsumerService" maxOccurs="unbounded"/>
					<element ref="md:AttributeConsumingService" minOccurs="0" maxOccurs="unbounded"/>
			*/
			if (endpointtype === 'ArtifactResolutionService') {
				beforeNode = [
					{'localName': 'SingleLogoutService', 'namespaceURI': SAMLmetaJS.Constants.ns.md},
					{'localName': 'ManageNameIDService', 'namespaceURI': SAMLmetaJS.Constants.ns.md},
					{'localName': 'NameIDFormat', 'namespaceURI': SAMLmetaJS.Constants.ns.md},
					{'localName': 'AssertionConsumerService', 'namespaceURI': SAMLmetaJS.Constants.ns.md},
					{'localName': 'AttributeConsumingService', 'namespaceURI': SAMLmetaJS.Constants.ns.md}
				];
			} else if (endpointtype === 'SingleLogoutService') {
				beforeNode = [
					{'localName': 'ManageNameIDService', 'namespaceURI': SAMLmetaJS.Constants.ns.md},
					{'localName': 'NameIDFormat', 'namespaceURI': SAMLmetaJS.Constants.ns.md},
					{'localName': 'AssertionConsumerService', 'namespaceURI': SAMLmetaJS.Constants.ns.md},
					{'localName': 'AttributeConsumingService', 'namespaceURI': SAMLmetaJS.Constants.ns.md}
				];
			} else if (endpointtype === 'ManageNameIDService') {
				beforeNode = [
					{'localName': 'NameIDFormat', 'namespaceURI': SAMLmetaJS.Constants.ns.md},
					{'localName': 'AssertionConsumerService', 'namespaceURI': SAMLmetaJS.Constants.ns.md},
					{'localName': 'AttributeConsumingService', 'namespaceURI': SAMLmetaJS.Constants.ns.md}
				];
			} else if (endpointtype === 'NameIDFormat') {
				beforeNode = [
					{'localName': 'AssertionConsumerService', 'namespaceURI': SAMLmetaJS.Constants.ns.md},
					{'localName': 'AttributeConsumingService', 'namespaceURI': SAMLmetaJS.Constants.ns.md}
				];
			} else {
				beforeNode = [
					{'localName': 'AttributeConsumingService', 'namespaceURI': SAMLmetaJS.Constants.ns.md}
				];
			}

			node.insertBefore(newNode, SAMLmetaJS.XML.findChildElement(node, beforeNode) );
		},

		"addIfNotIDPSSODescriptor": function(node) {
			return SAMLmetaJS.XML.addNodeIfNotExists(doc, node, 'IDPSSODescriptor', SAMLmetaJS.Constants.ns.md, 'md',
					function (newNode) {
						newNode.setAttribute('protocolSupportEnumeration', 'urn:oasis:names:tc:SAML:2.0:protocol');
						node.insertBefore(newNode, SAMLmetaJS.XML.findChildElement(node, [
							{'localName': 'SPSSODescriptor', 'namespaceURI': SAMLmetaJS.Constants.ns.md},
							{'localName': 'IdPSSODescriptor', 'namespaceURI': SAMLmetaJS.Constants.ns.md}
						]));
					},
					function (child) {
						return SAMLmetaJS.XML.hasAttribute(child, 'protocolSupportEnumeration', 'urn:oasis:names:tc:SAML:2.0:protocol');
					});
		},

		"addIfNotSPSSODescriptor": function(node) {
			return SAMLmetaJS.XML.addNodeIfNotExists(doc, node, 'SPSSODescriptor', SAMLmetaJS.Constants.ns.md, 'md',
					function (newNode) {
						newNode.setAttribute('protocolSupportEnumeration', 'urn:oasis:names:tc:SAML:2.0:protocol');
						node.insertBefore(newNode, SAMLmetaJS.XML.findChildElement(node, [
							{'localName': 'SPSSODescriptor', 'namespaceURI': SAMLmetaJS.Constants.ns.md},
							{'localName': 'IdPSSODescriptor', 'namespaceURI': SAMLmetaJS.Constants.ns.md}
						]));
					},
					function (child) {
						return SAMLmetaJS.XML.hasAttribute(child, 'protocolSupportEnumeration', 'urn:oasis:names:tc:SAML:2.0:protocol');
					});
		},

		"addIfNotEntityDescriptor": function() {
			var root = doc.documentElement;
			if (root === null || root.localName !== 'EntityDescriptor' || root.namespaceURI !== SAMLmetaJS.Constants.ns.md) {
				root = this.addEntityDescriptor();
			}
			return root;
		},

		"addEntityDescriptor": function() {
			var node = doc.createElementNS(SAMLmetaJS.Constants.ns.md, 'md:EntityDescriptor');
			node.setAttribute('xmlns:ds', SAMLmetaJS.Constants.ns.ds);
			if (doc.documentElement !== null) {
				doc.removeChild(doc.documentElement);
			}
			doc.appendChild(node);
			return node;
		},

		"getXMLasString": function() {
			return (new XMLSerializer()).serializeToString(doc);
		}
	};
};






SAMLmetaJS.tools = {
	"hasContents": function(obj) {
		if (!obj) return false;
		for (key in obj) {
			return true;
		}
		return false;
	},
	"hasEndpoint": function (obj, endpoint) {
		if (!obj[endpoint]) {
			return false;
		}
		return obj[endpoint].length > 0;
	}
};

SAMLmetaJS.XML = {
	"hasAttribute": function(node, attribute, value) {

		var attr = node.getAttribute(attribute);
		if (!attr) return false;

		var attrs = attr.split(" ");
		for(key in attrs) {
			if (attrs[key] == value) return true;
		}
		return false;
	},
	"getText": function(node) {
		if (!node.hasChildNodes()) return;
		var str = '';
		for (var i = 0; i < node.childNodes.length; i++ ) {
			if (node.childNodes[i].nodeType == 3) {
				str += node.childNodes[i].nodeValue;
			}
		}
		str = str.replace(/\s+/g, ' ');
		str = str.replace(/^\s*/g, '');
		str = str.replace(/\s*$/g, '');
		return str;
	},
	"wipeChildren": function(node, ns, element) {
		var i, lang;
		var wipequeue = [];

		if (!node.childNodes) return;

		for (i = 0; i < node.childNodes.length; i++ ) {
			var currentChild = node.childNodes[i];
			if (currentChild.nodeType !== 1) continue;
			if (ns && ns !== currentChild.namespaceURI) continue;
			if (element && element !== currentChild.localName) continue;
			wipequeue.push(currentChild);
		}
		for(i = 0; i < wipequeue.length; i++) {
			node.removeChild(wipequeue[i]);
		}
	},
	"findChildElement": function(node, list, extraChecks) {
		// Iterate the root children
		var i, j;
		for (i = 0; i < node.childNodes.length; i++ ) {
			var currentChild = node.childNodes[i];
			if(currentChild.nodeType !== 1) continue; // Process only elements.

			if (extraChecks && !extraChecks(currentChild)) {
				continue;
			}

			for(j = 0; j < list.length; j++) {
				if (list[j].localName == currentChild.localName &&
					list[j].namespaceURI == currentChild.namespaceURI
					) {
					return currentChild;
				}
			}
		}
		return null;
	},
	"addSimpleLocalizedAttribute": function(doc, node, ns, name, lang, value) {
		var newNode = doc.createElementNS(ns, name);
		newNode.appendChild(doc.createTextNode(value));
		newNode.setAttribute('xml:lang', lang);
		node.appendChild(newNode);
	},
	"addNodeIfNotExists": function(doc, parent, name, ns, nsPrefix, addToParent, extraChecks) {
		var newNode = this.findChildElement(parent, [{localName: name, namespaceURI: ns}], extraChecks);
		if (newNode === null) {
			newNode = doc.createElementNS(ns, nsPrefix + ':' + name);
			if (addToParent) {
				addToParent(newNode);
			} else {
				parent.appendChild(newNode);
			}
		}
		return newNode;
	},
	"prettifyXML": function(xmlstring) {
		var parser = new DOMParser();
		var doc = parser.parseFromString(xmlstring, 'text/xml');

		function isEmptyElement(element) {
			var whitespace = new RegExp('^\s*$');
			for (var child = element.firstChild; child != null; child = child.nextSibling) {
				if (child instanceof Text && whitespace.test(child.data)) {
					continue;
				}
				return false;
			}
			return true;
		}

		function isTextElement(element) {
			for (var child = element.firstChild; child != null; child = child.nextSibling) {
				if (child instanceof Text) {
					continue;
				}
				return false;
			}
			return true;
		}

		function xmlEntities(string) {
			string = string.replace(/&/g, '&amp;');
			string = string.replace(/\"/g, '&qout;');
			string = string.replace(/'/g, '&apos;');
			string = string.replace(/</, '&lt;');
			string = string.replace(/>/, '&gt;');
			return string;
		}


		function prettifyElement(element, indentation) {
			var ret = indentation + '<' + element.nodeName;

			var attrIndent = indentation;
			while (attrIndent.length < ret.length) {
				attrIndent += ' ';
			}

			var attrs = element.attributes;

			for (var i = 0; i < attrs.length; i++) {
				var a = attrs.item(i);
				if (i > 0) {
					ret += '\n' + attrIndent;
				}
				ret += ' ' + a.nodeName + '="' + xmlEntities(a.value) + '"';
			}

			if (isEmptyElement(element)) {
				if (attrs.length > 1) {
					return ret + '\n' + attrIndent + ' />\n';
				} else if (attrs.length == 1) {
					return ret + ' />\n';
				} else {
					return ret + '/>\n';
				}
			}

			if (attrs.length > 1) {
				ret += '\n' + attrIndent + ' >';
			} else {
				ret += '>';
			}

			if (isTextElement(element)) {
				return ret + xmlEntities(element.textContent) + '</' + element.nodeName + '>\n';
			}

			ret += '\n';

			for (var child = element.firstElementChild; child != null; child = child.nextElementSibling) {
				ret += prettifyElement(child, indentation + '	 ');
			}

			return ret + indentation + '</' + element.nodeName + '>\n';
		}

		return prettifyElement(doc.documentElement, '');
	}


};
