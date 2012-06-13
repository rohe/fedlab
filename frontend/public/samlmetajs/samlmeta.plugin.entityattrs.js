/*global jQuery: false, SAMLmetaJS: false */
(function ($) {
	"use strict";
	var UI = {
		"clearEntityAttrs": function () {
			$("div#entityattrs > div.content").empty();
		},
		"addEntityAttr": function (entityattr) {
			var randID = Math.floor(Math.random() * 10000 + 1000),
				entityattrHTML = [
					'<fieldset><legend>Attribute</legend>',
					'<div class="entityattrfield inlineField">',
					'<label for="entityattr-' + randID + '-NameFormat">Name format: </label>',
					'<input type="text" name="entityattr-' + randID + '-NameFormat-name" id="entityattr-' + randID + '-NameFormat" value="' + (entityattr.nameFormat || '') + '" />',
					'</div>',

					'<div class="entityattrfield inlineField">',
					'<label for="entityattr-' + randID + '-Name">Name: </label>',
					'<input type="text" name="entityattr-' + randID + '-Name-name" id="entityattr-' + randID + '-Name" value="' + (entityattr.name || '') + '" />',
					'</div>',

					'<div class="entityattrfield inlineField newRow">',
					'<label for="entityattr-' + randID + '-FriendlyName">Friendly name: </label>',
					'<input type="text" name="entityattr-' + randID + '-FriendlyName-name" id="entityattr-' + randID + '-FriendlyName" value="' + (entityattr.friendlyName || '') + '" />',
					'</div>',

					'<div class="entityattrfield inlineField">',
					'<label for="entityattr-' + randID + '-values">Value: </label>',
					'<input type="text" name="entityattr-' + randID + '-values-name" id="entityattr-' + randID + '-values" value="' + (entityattr.values || '') + '" />',
					'</div>',

					'<button style="display: block; clear: both" class="remove">Remove</button>',

					'</fieldset>'
				];

			$(entityattrHTML.join('')).appendTo("div#entityattrs > div.content").find('button.remove').click(function (e) {
				e.preventDefault();
				$(e.target).closest('fieldset').remove();
			});
		}
	};

	SAMLmetaJS.plugins.entityattrs = {
		tabClick: function (handler) {
			handler($("a[href='#entityattrs']"));
		},

		addTab: function (pluginTabs) {
			pluginTabs.list.push('<li><a href="#entityattrs">Entity attrs</a></li>');
			pluginTabs.content.push([
				'<div id="entityattrs">',
				'<div class="content"></div>',
				'<div><button class="addentityattr">Add new attribute</button></div>',
				'</div>'
			].join(''));
		},

		setUp: function () {
			$("div#entityattrs button.addentityattr").click(function (e) {
				e.preventDefault();
				UI.addEntityAttr({});
			});
		},

		fromXML: function (entitydescriptor) {
		        var i;

			// Clear attributes
			UI.clearEntityAttrs();

			// Add existing contacts (from XML)
			if (entitydescriptor.entityAttributes) {
			        for (i=0; i < entitydescriptor.entityAttributes.length; i += 1) {
				        UI.addEntityAttr(entitydescriptor.entityAttributes[i]);
				}
			}
		},

		toXML: function (entitydescriptor) {
			$('div#entityattrs fieldset').each(function (index, element) {
				var newEntityAttr = {'values': []}, $inputs = $(element).find('input');

				newEntityAttr.nameFormat = $inputs.eq(0).attr('value').trim();
				newEntityAttr.name = $inputs.eq(1).attr('value').trim();
				newEntityAttr.friendlyName = $inputs.eq(2).attr('value').trim();
				newEntityAttr.values.push($inputs.eq(3).attr('value').trim());

				if (!entitydescriptor.entityAttributes) {
					entitydescriptor.entityAttributes = [];
				}
				entitydescriptor.entityAttributes.push(newEntityAttr);
			});
		},
		validate: function () {
			return true;  // All the attribute fields are optional, so this always validates
		}
	};

}(jQuery));
