(function($) {
	
	function hasContents(e) {
		if (!e) return false;
		for(var k in e) {
			if (!e.hasOwnProperty(k)) continue;
			return true;
		}
		return false;
	}
	
	SAMLmetaJS.plugins.attributes = {
		tabClick: function (handler) {
			handler($("a[href='#attributes']"));
		},

		addTab: function (pluginTabs) {
			pluginTabs.list.push('<li><a href="#attributes">Attributes</a></li>');
			pluginTabs.content.push(
				'<div id="attributes">' +

					'<div class="content"></div>' +

					'<div>' +
						'<button class="selectall">Select all</button>' +
						'<button class="unselectall">Unselect all</button>' +
					'</div>' +

				'</div>'
			);
		},

		setUp: function () {
			$("div#attributes button.selectall").click(function(e) {
				e.preventDefault();
				$("div#attributes div.content input:checkbox").each(function(index, box) {
					$(box).attr('checked', 'checked');
				});
			});
			$("div#attributes button.unselectall").click(function(e) {
				e.preventDefault();
				$("div#attributes div.content input:checkbox").each(function(index, box) {
					$(box).removeAttr('checked');
				});
			});
		},

		fromXML: function (entitydescriptor) {
			var attributeHTML, checked, attrname, attributes;
			
			
			attributes = {};
			if (entitydescriptor && entitydescriptor.saml2sp && entitydescriptor.saml2sp.acs && entitydescriptor.saml2sp.acs.attributes) {
				attributes = entitydescriptor.saml2sp.acs.attributes;
			}

			// Set attributes
			attributeHTML = '';
			for(attrname in SAMLmetaJS.Constants.attributes) {
				if (SAMLmetaJS.Constants.attributes.hasOwnProperty(attrname)) {
					checked = (attributes[attrname] ? 'checked="checked"' : '');
					attributeHTML += '<div style="float: left; width: 300px"><input type="checkbox" id="' + attrname + '-id" name="' + attrname + '" ' + checked + '/>' +
						'<label for="' + attrname + '-id">' + SAMLmetaJS.Constants.attributes[attrname] + '</label></div>';
				}
			}
			attributeHTML += '<br style="height: 0px; clear: both" />';
			$("div#attributes > div.content").empty();
			$("div#attributes > div.content").append(attributeHTML);
		},
		toXML: function (entitydescriptor) {
			var 
				atleastone = false,
				attributes = {};
			
			$('div#attributes div').each(function(index, element) {
				$(element).find('input:checked').each(function(index2, element2) {
					attributes[$(element2).attr('name')] = 1;
					atleastone = true;
				});
			});
			
			if (atleastone) {
					
				if (!entitydescriptor.saml2sp) entitydescriptor.saml2sp = {};
				if (!entitydescriptor.saml2sp.acs) entitydescriptor.saml2sp.acs = {};
				if (!entitydescriptor.saml2sp.acs.attributes) entitydescriptor.saml2sp.acs.attributes = attributes;
				if (!SAMLmetaJS.tools.hasContents(entitydescriptor.name)) entitydescriptor.name = {'en': 'Unnamed'};
				
			} else {
				
				if (entitydescriptor && entitydescriptor.saml2sp && 
					entitydescriptor.saml2sp.acs && entitydescriptor.saml2sp.acs.attributes) {
					delete(entitydescriptor.saml2sp.acs.attributes);	
				}
				
			}

		}
	};

}(jQuery));
