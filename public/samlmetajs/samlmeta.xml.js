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

			var root, spdescriptor, attributeconsumer, extensions, i, attr, lang, node;
			root = this.addIfNotEntityDescriptor();

			if (entitydescriptor.entityid)
				root.setAttribute('entityID', entitydescriptor.entityid);

			if (entitydescriptor.entityAttributes) {
				entityExtensions = this.addIfNotEntityExtensions(root);

				entityAttributes = this.addIfNotEntityAttributes(entityExtensions);
				SAMLmetaJS.XML.wipeChildren(entityAttributes, SAMLmetaJS.Constants.ns.saml, 'Attribute');
				for(var name in entitydescriptor.entityAttributes) {
					this.addAttribute(entityAttributes, entitydescriptor.entityAttributes[name]);
				}
			}
			
			
			spdescriptor = this.addIfNotSPSSODescriptor(root);
			
			if (
				SAMLmetaJS.tools.hasContents(entitydescriptor.name) ||
				SAMLmetaJS.tools.hasContents(entitydescriptor.descr) ||
				entitydescriptor.location
			) {
				extensions = this.addIfNotExtensions(spdescriptor);
				mdui = this.addIfNotMDUI(extensions);
				this.updateMDUI(mdui, entitydescriptor);
			} else {
				SAMLmetaJS.XML.wipeChildren(spdescriptor, SAMLmetaJS.Constants.ns.md, 'Extensions');
			}
			
			
			
	

			SAMLmetaJS.XML.wipeChildren(spdescriptor, SAMLmetaJS.Constants.ns.md, 'KeyDescriptor');
			if (entitydescriptor.saml2sp && entitydescriptor.saml2sp.certs) {
				for(i = 0; i< entitydescriptor.saml2sp.certs.length; i++) {
					this.addCert(spdescriptor, entitydescriptor.saml2sp.certs[i].use, entitydescriptor.saml2sp.certs[i].cert);
				}
			}

			SAMLmetaJS.XML.wipeChildren(spdescriptor, SAMLmetaJS.Constants.ns.md, 'AssertionConsumerService');
			if (entitydescriptor.saml2sp && entitydescriptor.saml2sp.AssertionConsumerService &&
					entitydescriptor.saml2sp.AssertionConsumerService.length > 0) {
				for(i = 0; i< entitydescriptor.saml2sp.AssertionConsumerService.length; i++) {
					this.addEndpoint(spdescriptor, 'AssertionConsumerService', entitydescriptor.saml2sp.AssertionConsumerService[i]);
				}
			}

			SAMLmetaJS.XML.wipeChildren(spdescriptor, SAMLmetaJS.Constants.ns.md, 'SingleLogoutService');
			if (entitydescriptor.saml2sp && entitydescriptor.saml2sp.SingleLogoutService && entitydescriptor.saml2sp.SingleLogoutService.length > 0) {
				for(i = 0; i< entitydescriptor.saml2sp.SingleLogoutService.length; i++) {
					this.addEndpoint(spdescriptor, 'SingleLogoutService', entitydescriptor.saml2sp.SingleLogoutService[i]);
				}
			}
			//this.clearRequestedAttributes();
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



			if (entitydescriptor.contacts) {
				SAMLmetaJS.XML.wipeChildren(root, SAMLmetaJS.Constants.ns.md, 'ContactPerson');
				for(i = 0; i < entitydescriptor.contacts.length; i++) {
					this.addContact(root, entitydescriptor.contacts[i])
				}
			} else {
				SAMLmetaJS.XML.wipeChildren(root, SAMLmetaJS.Constants.ns.md, 'ContactPerson');
			}

			if (entitydescriptor.organization) {
				SAMLmetaJS.XML.wipeChildren(root, SAMLmetaJS.Constants.ns.md, 'Organization');
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
				
				//	root.appendChild(node);
				root.insertBefore(node, SAMLmetaJS.XML.findChildElement(root,
					[
						{'localName': 'ContactPerson', 'namespaceURI': SAMLmetaJS.Constants.ns.md},
						{'localName': 'AdditionalMetadataLocation', 'namespaceURI': SAMLmetaJS.Constants.ns.md}
					]
				));
				
			} else {
				SAMLmetaJS.XML.wipeChildren(root, SAMLmetaJS.Constants.ns.md, 'Organization');
			}

		},

		"addCert": function(node, use, cert) {
			var keydescriptor, keyinfo, x509data, x509cert;

			keydescriptor = doc.createElementNS(SAMLmetaJS.Constants.ns.md, 'md:KeyDescriptor');

			if (use === 'signing' || use === 'encryption') {
				keydescriptor.setAttribute('use', use);
			}

			keyinfo = doc.createElementNS(SAMLmetaJS.Constants.ns.ds, 'ds:KeyInfo');
			x509data = doc.createElementNS(SAMLmetaJS.Constants.ns.ds, 'ds:X509Data');
			x509cert = doc.createElementNS(SAMLmetaJS.Constants.ns.ds, 'ds:X509Certificate');
			x509cert.appendChild(doc.createTextNode(cert));
			x509data.appendChild(x509cert);
			keyinfo.appendChild(x509data);
			keydescriptor.appendChild(keyinfo);

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
					this.addMDUIDisplayName(node, lang, entitydescriptor.name[lang]);
				}
			}
			if (SAMLmetaJS.tools.hasContents(entitydescriptor.descr)) {
				SAMLmetaJS.XML.wipeChildren(node, SAMLmetaJS.Constants.ns.mdui, 'Description');
				for(lang in entitydescriptor.descr) {
					this.addMDUIDescription(node, lang, entitydescriptor.descr[lang]);
				}
			}
			SAMLmetaJS.XML.wipeChildren(node, SAMLmetaJS.Constants.ns.mdui, 'GeolocationHint');
			if (entitydescriptor.location) {
				this.addMDUILocation(node, entitydescriptor.location);
			}

		},
		"addMDUILocation": function(node, location) {
			var newNode = doc.createElementNS(SAMLmetaJS.Constants.ns.mdui, 'mdui:GeolocationHint');
			var text = doc.createTextNode('geo:' + location);
			newNode.appendChild(text);
			node.appendChild(newNode);

		},
		"addMDUIDisplayName": function(node, lang, text) {
			var newNode = doc.createElementNS(SAMLmetaJS.Constants.ns.mdui, 'mdui:DisplayName');
			var text = doc.createTextNode(text);
			newNode.setAttribute('xml:lang', lang);
			newNode.appendChild(text);
			node.appendChild(newNode);
		},
		"addMDUIDescription": function(node, lang, text) {
			var newNode = doc.createElementNS(SAMLmetaJS.Constants.ns.mdui, 'mdui:Description');
			var text = doc.createTextNode(text);
			newNode.setAttribute('xml:lang', lang);
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
					this.addName(node, lang, entitydescriptor.name[lang]);
				}
			}
			if (entitydescriptor.descr) {
				for(lang in entitydescriptor.descr) {
					this.addDescr(node, lang, entitydescriptor.descr[lang]);
				}
			}

		},
		"addName": function(node, lang, text) {
			var newNode = doc.createElementNS(SAMLmetaJS.Constants.ns.md, 'md:ServiceName');
			var text = doc.createTextNode(text);
			newNode.setAttribute('xml:lang', lang);
			newNode.appendChild(text);
			node.appendChild(newNode);
		},
		"addDescr": function(node, lang, text) {
			var newNode = doc.createElementNS(SAMLmetaJS.Constants.ns.md, 'md:ServiceDescription');
			var text = doc.createTextNode(text);
			newNode.setAttribute('xml:lang', lang);
			newNode.appendChild(text);
			node.appendChild(newNode);
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
		"addIfNotEntityExtensions": function(node) {
			var newNode;

			// Iterate the root children
			for (var i = 0; i < node.childNodes.length; i++ ) {
				var currentChild = node.childNodes[i];
				if (
						currentChild.nodeType == 1 &&  // type is Element
						currentChild.localName === 'Extensions' &&
						currentChild.namespaceURI === SAMLmetaJS.Constants.ns.md
					)
					return currentChild;
			}

			var newNode = doc.createElementNS(SAMLmetaJS.Constants.ns.md, 'md:Extensions');
			node.insertBefore(newNode, SAMLmetaJS.XML.findChildElement(node,
				[
					{'localName': 'SPSSODescriptor', 'namespaceURI': SAMLmetaJS.Constants.ns.md},
					{'localName': 'IdPSSODescriptor', 'namespaceURI': SAMLmetaJS.Constants.ns.md}
				]
			));
			return newNode;
		},
		"addIfNotExtensions": function(node) {
			var newNode;

			// Iterate the root children
			for (var i = 0; i < node.childNodes.length; i++ ) {
				var currentChild = node.childNodes[i];
				if (
						currentChild.nodeType == 1 &&  // type is Element
						currentChild.localName === 'Extensions' &&
						currentChild.namespaceURI === SAMLmetaJS.Constants.ns.md
					)
					return currentChild;
			}

			var newNode = doc.createElementNS(SAMLmetaJS.Constants.ns.md, 'md:Extensions');
			node.insertBefore(newNode, SAMLmetaJS.XML.findChildElement(node,
				[
					{'localName': 'KeyDescriptor', 'namespaceURI': SAMLmetaJS.Constants.ns.md},
					{'localName': 'SingleLogoutService', 'namespaceURI': SAMLmetaJS.Constants.ns.md},
					{'localName': 'AssertionConsumerService', 'namespaceURI': SAMLmetaJS.Constants.ns.md},
					{'localName': 'AttributeConsumingService', 'namespaceURI': SAMLmetaJS.Constants.ns.md}
				]
			));
			return newNode;
		},
		"addIfNotMDUI": function(node) {
			var newNode;

			// Iterate the root children
			for (var i = 0; i < node.childNodes.length; i++ ) {
				var currentChild = node.childNodes[i];
				if (
						currentChild.nodeType == 1 &&  // type is Element
						currentChild.localName === 'UIInfo' &&
						currentChild.namespaceURI === SAMLmetaJS.Constants.ns.mdui
					)
					return currentChild;
			}

			var newNode = doc.createElementNS(SAMLmetaJS.Constants.ns.mdui, 'mdui:UIInfo');
			node.appendChild(newNode);
			return newNode;

		},
		"addIfNotEntityAttributes": function(node) {
			var newNode;

			// Iterate the root children
			for (var i = 0; i < node.childNodes.length; i++ ) {
				var currentChild = node.childNodes[i];
				if (
						currentChild.nodeType == 1 &&  // type is Element
						currentChild.localName === 'EntityAttributes' &&
						currentChild.namespaceURI === SAMLmetaJS.Constants.ns.mdattr
					)
					return currentChild;
			}

			var newNode = doc.createElementNS(SAMLmetaJS.Constants.ns.mdattr, 'mdattr:EntityAttributes');
			node.appendChild(newNode);
			return newNode;

		},
		"addIfNotAttributeConsumingService": function(node) {
			var newNode;

			// Iterate the root children
			for (var i = 0; i < node.childNodes.length; i++ ) {
				var currentChild = node.childNodes[i];
				if (
						currentChild.nodeType == 1 &&  // type is Element
						currentChild.localName === 'AttributeConsumingService' &&
						currentChild.namespaceURI === SAMLmetaJS.Constants.ns.md
					)
					return currentChild;
			}

			var newNode = doc.createElementNS(SAMLmetaJS.Constants.ns.md, 'md:AttributeConsumingService');
			newNode.setAttribute('index', 0);
			node.insertBefore(newNode, SAMLmetaJS.XML.findChildElement(node,
				[
					{'localName': 'ContactPerson', 'namespaceURI': SAMLmetaJS.Constants.ns.md}
				]
			));
			return newNode;
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
			if (endpointtype = 'ArtifactResolutionService') {
				beforeNode = [
					{'localName': 'SingleLogoutService', 'namespaceURI': SAMLmetaJS.Constants.ns.md},
					{'localName': 'ManageNameIDService', 'namespaceURI': SAMLmetaJS.Constants.ns.md},
					{'localName': 'NameIDFormat', 'namespaceURI': SAMLmetaJS.Constants.ns.md},
					{'localName': 'AssertionConsumerService', 'namespaceURI': SAMLmetaJS.Constants.ns.md},
					{'localName': 'AttributeConsumingService', 'namespaceURI': SAMLmetaJS.Constants.ns.md}	
				];
			} else if (endpointtype = 'SingleLogoutService') {
				beforeNode = [
					{'localName': 'ManageNameIDService', 'namespaceURI': SAMLmetaJS.Constants.ns.md},
					{'localName': 'NameIDFormat', 'namespaceURI': SAMLmetaJS.Constants.ns.md},
					{'localName': 'AssertionConsumerService', 'namespaceURI': SAMLmetaJS.Constants.ns.md},
					{'localName': 'AttributeConsumingService', 'namespaceURI': SAMLmetaJS.Constants.ns.md}	
				];
			} else if (endpointtype = 'ManageNameIDService') {
				beforeNode = [
					{'localName': 'NameIDFormat', 'namespaceURI': SAMLmetaJS.Constants.ns.md},
					{'localName': 'AssertionConsumerService', 'namespaceURI': SAMLmetaJS.Constants.ns.md},
					{'localName': 'AttributeConsumingService', 'namespaceURI': SAMLmetaJS.Constants.ns.md}	
				];
			} else if (endpointtype = 'NameIDFormat') {
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

		"addIfNotSPSSODescriptor": function(node) {
			var newNode;

			// Iterate the root children
			for (var i = 0; i < node.childNodes.length; i++ ) {
				var currentChild = node.childNodes[i];
				if (
						currentChild.nodeType == 1 &&  // type is Element
						currentChild.localName === 'SPSSODescriptor' &&
						currentChild.namespaceURI === SAMLmetaJS.Constants.ns.md &&
						SAMLmetaJS.XML.hasAttribute(currentChild, 'protocolSupportEnumeration', 'urn:oasis:names:tc:SAML:2.0:protocol')
					)
					return currentChild;
			}

			var newNode = doc.createElementNS(SAMLmetaJS.Constants.ns.md, 'md:SPSSODescriptor');
			newNode.setAttribute('protocolSupportEnumeration', 'urn:oasis:names:tc:SAML:2.0:protocol');
			node.appendChild(newNode);
			return newNode;
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
	"findChildElement": function(node, list) {
		// Iterate the root children
		var i, j;
		for (i = 0; i < node.childNodes.length; i++ ) {
			var currentChild = node.childNodes[i];
			if(currentChild.nodeType !== 1) continue; // Process only elements.

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
