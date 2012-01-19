(function($) {
	var UI = {
		"clearContacts": function() {
			$("div#contact > div.content").empty();
		},
		"addContact": function(contact) {
			var randID = Math.floor(Math.random() * 10000 + 1000);
			var contactHTML = '<fieldset><legend>Contact</legend>' +
					'<div>' +
					'<label for="contact-' + randID + '-type">Contact type: </label>' +
					'<select name="contact-' + randID + '-type-name" id="contact-' + randID + '-type">';
			var contactType, checked;

			for (contactType in SAMLmetaJS.Constants.contactTypes) {
				if (SAMLmetaJS.Constants.contactTypes.hasOwnProperty(contactType)) {
					checked = '';
					if (contact.contactType === contactType) {
						checked = ' selected="selected" ';
					}
					contactHTML += '<option value="' + contactType + '" ' + checked + '>' +
						SAMLmetaJS.Constants.contactTypes[contactType] +
						'</option>';
				}
			}

			contactHTML += '</select>' +
				'</div>' +

				'<div class="contactfield">' +
					'<label for="contact-' + randID + '-givenname">Given name: </label>' +
					'<input type="text" name="contact-' + randID + '-givenname-name" id="contact-' + randID + '-givenname" value="' + (contact.givenName || '') + '" />' +
				'</div>' +

				'<div class="contactfield">' +
					'<label for="contact-' + randID + '-surname">Surname: </label>' +
					'<input type="text" name="contact-' + randID + '-givenname-name" id="contact-' + randID + '-surname" value="' + (contact.surName || '') + '" />' +
				'</div>' +

				'<div class="contactfield">' +
					'<label for="contact-' + randID + '-email">E-mail: </label>' +
					'<input type="text" name="contact-' + randID + '-email-name" id="contact-' + randID + '-email" value="' + (contact.emailAddress || '')+ '" />' +
				'</div>' +

				'<button style="display: block; clear: both" class="remove">Remove</button>' +

			'</fieldset>';

			$(contactHTML).appendTo("div#contact > div.content").find('button.remove').click( function(e) {
				e.preventDefault();
				$(e.target).closest('fieldset').remove();
			});
		}
	};

	SAMLmetaJS.plugins.contact = {
		tabClick: function (handler) {
			handler($("a[href='#contact']"));
		},

		addTab: function (pluginTabs) {
			pluginTabs.list.push('<li><a href="#contact">Contacts</a></li>');
			pluginTabs.content.push(
				'<div id="contact">' +
					'<div class="content"></div>' +
					'<div><button class="addcontact">Add new contact</button></div>' +
				'</div>'
			);
		},

		setUp: function () {
			$("div#contact button.addcontact").click(function(e) {
				e.preventDefault();
				UI.addContact({});
			});
		},

		fromXML: function (entitydescriptor) {
			var i;

			// Clear contacts
			UI.clearContacts();
			
			// Add existing contacts (from XML)			
			if (entitydescriptor.contacts) {
				for (i = 0; i < entitydescriptor.contacts.length; i++ ) {
					UI.addContact(entitydescriptor.contacts[i]);
				}
			}
		},

		toXML: function (entitydescriptor) {
			$('div#contact fieldset').each(function (index, element) {
				var newContact = {};

				if (!$(element).find('input').eq(1).attr('value')) {
					return;
				}

				newContact.contactType = $(element).find('select').val();
				newContact.givenName = $(element).find('input').eq(0).attr('value');
				newContact.surName = $(element).find('input').eq(1).attr('value');
				newContact.emailAddress = $(element).find('input').eq(2).attr('value');
				if (!entitydescriptor.contacts) entitydescriptor.contacts = [];
				entitydescriptor.contacts.push(newContact);
			});
		}
	};

}(jQuery));
