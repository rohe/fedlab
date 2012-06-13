(function($) {
	var refreshLogo = function ($logodiv) {
		var $inputs = $logodiv.find('input'),
			attrs = {
				src: $inputs.eq(0).val(),
				width: $inputs.eq(1).val(),
				height: $inputs.eq(2).val()
			};
		$logodiv.find('img').attr(attrs).parent('a').attr('href', attrs.src);
	},
		addLanguageSelect = function (randID, lang, suffix) {
			var languageFound = false, result = [], language, checked;
			result.push('<select name="' + randID + '-lang-' + suffix + '" id="' + randID + '-lang">');
			if (lang === '') {
				result.push('<option value=""></option>');
			}
			for (language in SAMLmetaJS.Constants.languages) {
				if (SAMLmetaJS.Constants.languages.hasOwnProperty(language)) {
					checked = '';
					if (lang === language) {
						checked = ' selected="selected" ';
						languageFound = true;
					}
					result.push('<option value="' + language + '" ' + checked + '>');
					result.push(SAMLmetaJS.Constants.languages[language]);
					result.push('</option>');
				}
			}

			if (!languageFound && lang !== '') {
				result.push('<option value="' + lang + '" selected="selected">Unknown language (' + lang + ')</option>');
			}

			result.push('</select>');
			return result.join('');
		};

	var UI = {
		"clearInfoname": function() {
			$("div#info div#infoname").empty();
		},
		"clearInfodescr": function() {
			$("div#info div#infodescr").empty();
		},
		"clearInfologo": function() {
			$("div#info div#infologo").empty();
		},
		"clearInfokeywords": function () {
			$("div#info div#infokeywords").empty();
		},
		"clearInformationURL": function () {
			$("div#info div#infoinformationurl").empty();
		},
		"clearPrivacyStatementURL": function () {
			$("div#info div#infoprivacystatementurl").empty();
		},
		"addInfoname": function(lang, name) {
			var randID = 'infoname' + Math.floor(Math.random() * 10000 + 1000);
			var infoHTML = '<div class="infonamediv">';
			infoHTML += '<ul class="errors"></ul>';
			infoHTML += addLanguageSelect(randID, lang, 'name');
			infoHTML += '<input type="text" name="' + randID + '-name-name" id="' + randID + '-name" value="' + (name || '') + '" />' +
				'<button style="" class="removename">Remove</button>' +
				'</div>';

			$(infoHTML).appendTo("div#info div#infoname").find('button.removename').click(function (e) {
				e.preventDefault();
				$(e.target).closest('div.infonamediv').remove();
			});
		},
		"addInfodescr": function(lang, descr) {
			var randID = 'infodescr' + Math.floor(Math.random() * 10000 + 1000);
			var infoHTML = '<div class="infodescrdiv"><div>';
			infoHTML += '<ul class="errors"></ul>';
			infoHTML += addLanguageSelect(randID, lang, 'descr');
			infoHTML += '<button style="" class="removedescr">Remove</button>' +
				'</div><div>' +
				'<textarea name="' + randID + '-name-name" id="' + randID + '-name">' + (descr || '') + '</textarea>' +
				'</div></div>';

			$(infoHTML).appendTo("div#info div#infodescr").find('button.removedescr').click(function (e) {
				e.preventDefault();
				$(e.target).closest('div.infodescrdiv').remove();
			});
		},
		"addInfokeywords": function (lang, keywords) {
			var randID = 'infokeywords' + Math.floor(Math.random() * 10000 + 1000);
			var infoHTML = '<div class="infokeywordsdiv">';
			infoHTML += '<ul class="errors"></ul>';
			infoHTML += addLanguageSelect(randID, lang, 'keywords');
			infoHTML += '<input type="text" name="' + randID + '-name-name" id="' + randID + '-name" value="' + (keywords || '') + '" />' +
				'<button style="" class="removekeywords">Remove</button>' +
				'</div>';

			$(infoHTML).appendTo("div#info div#infokeywords").find('button.removekeywords').click(function (e) {
				e.preventDefault();
				$(e.target).closest('div.infokeywordsdiv').remove();
			});
		},
		"addInfologo": function(lang, logo) {
			var randID = 'infologo' + Math.floor(Math.random() * 10000 + 1000);
			var infoHTML = '<div class="infologodiv"><div>';
			infoHTML += '<ul class="errors"></ul>';
			infoHTML += addLanguageSelect(randID, lang, 'logo');
			infoHTML += '<input type="url" name="logo-' + randID + '-location-name" id="logo-' + randID + '-location" value="' + (logo.location ||'') + '" />' +
				'<button class="removelogo">Remove</button>' +
				'</div>' +

				'<div>' +
				'<figure class="logopreview">' +
				'<figcaption>Logo preview <button class="refresh">Refresh</button></figcaption>' +
				'<a href="' + (logo.location || '#') + '">' +
				'<img src="' + (logo.location || '') + '" width="' + (logo.width || '') + '" height="' + (logo.height || '') + '" alt="Logo preview" />' +
				'</a>' +

				'</figure>' +
				'<label for="logo-' + randID + '-width">Width: </label>' +
				'<input type="number" min="0" name="logo-' + randID + '-width-name" id="logo-' + randID + '-width" value="' + (logo.width ||'') + '" />' +
				'</div>' +

				'<div>' +
				'<label for="logo-' + randID + '-height">Height: </label>' +
				'<input type="number" min="0" name="logo-' + randID + '-height-name" id="logo-' + randID + '-height" value="' + (logo.height ||'') + '" />' +
				'</div>' +

				'</div>';

			$(infoHTML).appendTo("div#info div#infologo")
				.find('button.removelogo').click(function (e) {
					e.preventDefault();
					$(e.target).closest('div.infologodiv').remove();
				}).end()
				.find('button.refresh').click(function (e) {
					refreshLogo($(this).parents('div.infologodiv'));
					e.preventDefault();
				}).end()
				.find('input').change(function (e) {
					refreshLogo($(this).parents('div.infologodiv'));
				}).end()
				.find('img').load(function (e) {
					var $div = $(this).parents('div.infologodiv'),
						$width = $div.find('input').eq(1),
						$height = $div.find('input').eq(2);

					if (!$width.val()) {
						$width.val(this.width);
					}
					if (!$height.val()) {
						$height.val(this.height);
					}
				});
		},
		"addInformationURL": function (lang, informationUrl) {
			var randID = 'informationurl' + Math.floor(Math.random() * 10000 + 1000);
			var infoHTML = '<div class="informationurldiv">';
			infoHTML += '<ul class="errors"></ul>';
			infoHTML += addLanguageSelect(randID, lang, 'informationurl');
			infoHTML += '<input type="text" name="' + randID + '-name-name" id="' + randID + '-name" value="' + (informationUrl || '') + '" />' +
				'<button style="" class="removeinformationurl">Remove</button>' +
				'</div>';

			$(infoHTML).appendTo("div#info div#infoinformationurl").find('button.removeinformationurl').click(function (e) {
				e.preventDefault();
				$(e.target).closest('div.informationurldiv').remove();
			});
		},
		"addPrivacyStatementURL": function (lang, privacyStatementUrl) {
			var randID = 'informationurl' + Math.floor(Math.random() * 10000 + 1000);
			var infoHTML = '<div class="privacystatementurldiv">';
			infoHTML += '<ul class="errors"></ul>';
			infoHTML += addLanguageSelect(randID, lang, 'privacystatementurl');
			infoHTML += '<input type="text" name="' + randID + '-name-name" id="' + randID + '-name" value="' + (privacyStatementUrl || '') + '" />' +
				'<button style="" class="removeprivacystatementurl">Remove</button>' +
				'</div>';

			$(infoHTML).appendTo("div#info div#infoprivacystatementurl").find('button.removeprivacystatementurl').click(function (e) {
				e.preventDefault();
				$(e.target).closest('div.privacystatementurldiv').remove();
			});
		},
		validateName: function (element) {
			return SAMLmetaJS.l10nValidator(element, "The name is required");
		},
		validateDescription: function (element) {
			var value = null, lang = null, errors = [];
			value = $(element).find('div > textarea').val();
			lang = $(element).find('div > select').val();
			if (!value) {
				errors.push("The description is required");
			}
			return {
				value: value,
				lang: lang,
				errors: errors
			};
		},
		validateLogo: function (element) {
			var location = null, width = null, height = null, lang = null, errors = [], $inputs;
			$inputs = $(element).find('input');
			location = $inputs.eq(0).val();
			width = $inputs.eq(1).val();
			height = $inputs.eq(2).val();
			lang = $(element).find('div > select').val();

			if (!location) {
				errors.push("The location is required");
			}

			if (!width) {
				errors.push("The width is required");
			}

			if (!height) {
				errors.push("The height is required");
			}

			return {
				location: location,
				width: width,
				height: height,
				lang: lang,
				errors: errors
			};
		},
		validateKeywords: function (element) {
			return SAMLmetaJS.l10nValidator(element, "The keywords are required");
		},
		validateInformationurl: function (element) {
			return SAMLmetaJS.l10nValidator(element, "The information URL is required");
		},
		validatePrivacystatementurl: function (element) {
			return SAMLmetaJS.l10nValidator(element, "The privacy statement URL is required");
		}
	};

	SAMLmetaJS.plugins.info = {
		tabClick: function (handler) {
			handler($("a[href='#info']"));
		},

		addTab: function (pluginTabs) {
			pluginTabs.list.push('<li><a href="#info">Information</a></li>');
			pluginTabs.content.push([
				'<div id="info">',

				'<fieldset class="entityid"><legend>Entity ID</legend>',
				'<div id="div-entityid">',
				'<input style="width: 600px" type="text" name="entityid" id="entityid" value="" />',
				'<p style="margin: 0px">The format MUST be an URI.</p>',
				'</div>',
				'</fieldset>',

				'<fieldset class="name"><legend>Name of Service</legend>',
				'<div id="infoname"></div>',
				'<div>',
				'<button class="addname">Add name in one more language</button>',
				'</div>',
				'</fieldset>',

				'<fieldset class="description"><legend>Description of Service</legend>',
				'<div id="infodescr"></div>',
				'<div>',
				'<button class="adddescr">Add description in one more language</button>',
				'</div>',
				'</fieldset>',

				'<fieldset class="logo"><legend>Logo of Service</legend>',
				'<div id="infologo"></div>',
				'<div>',
				'<button class="addlogo">Add logo in one more language</button>',
				'</div>',
				'</fieldset>',

				'<fieldset class="keywords"><legend>Keywords (space separated)</legend>',
				'<div id="infokeywords"></div>',
				'<div>',
				'<button class="addkeywords">Add keywords in one more language</button>',
				'</div>',
				'</fieldset>',

				'<fieldset class="informationurl"><legend>URL to information about the service</legend>',
				'<div id="infoinformationurl"></div>',
				'<div>',
				'<button class="addinformationurl">Add URL in one more language</button>',
				'</div>',
				'</fieldset>',

				'<fieldset class="informationurl"><legend>URL to privacy statement about the service</legend>',
				'<div id="infoprivacystatementurl"></div>',
				'<div>',
				'<button class="addprivacystatementurl">Add URL in one more language</button>',
				'</div>',
				'</fieldset>',

				'</div>'
			].join(''));
		},

		setUp: function () {
			$("div#info button.addname").click(function(e) {
				e.preventDefault();
				UI.addInfoname('en', '');
			});
			$("div#info button.adddescr").click(function(e) {
				e.preventDefault();
				UI.addInfodescr('en', '');
			});
			$("div#info button.addlogo").click(function(e) {
				e.preventDefault();
				UI.addInfologo('', '');
			});
			$("div#info button.addkeywords").click(function(e) {
				e.preventDefault();
				UI.addInfokeywords('en', '');
			});
			$("div#info button.addinformationurl").click(function(e) {
				e.preventDefault();
				UI.addInformationURL('en', '');
			});
			$("div#info button.addprivacystatementurl").click(function(e) {
				e.preventDefault();
				UI.addPrivacyStatementURL('en', '');
			});
		},

		fromXML: function (entitydescriptor) {
			var l;

			UI.clearInfoname();
			if (entitydescriptor.name) {
				for (l in entitydescriptor.name) {
					if (entitydescriptor.name.hasOwnProperty(l)) {
						UI.addInfoname(l, entitydescriptor.name[l]);
					}
				}
			}

			UI.clearInfodescr();
			if (entitydescriptor.descr) {
				for (l in entitydescriptor.descr) {
					if (entitydescriptor.descr.hasOwnProperty(l)) {
						UI.addInfodescr(l, entitydescriptor.descr[l]);
					}
				}
			}

			UI.clearInfologo();
			if (entitydescriptor.hasLogo()) {
				for (l in entitydescriptor.saml2sp.mdui.logo) {
					if (entitydescriptor.saml2sp.mdui.logo.hasOwnProperty(l)) {
						UI.addInfologo(l, entitydescriptor.saml2sp.mdui.logo[l]);
					}
				}
			}

			UI.clearInfokeywords();
			if (entitydescriptor.hasKeywords()) {
				for (l in entitydescriptor.saml2sp.mdui.keywords) {
					if (entitydescriptor.saml2sp.mdui.keywords.hasOwnProperty(l)) {
						UI.addInfokeywords(l, entitydescriptor.saml2sp.mdui.keywords[l]);
					}
				}
			}

			UI.clearInformationURL();
			if (entitydescriptor.hasInformationURL()) {
				for (l in entitydescriptor.saml2sp.mdui.informationURL) {
					if (entitydescriptor.saml2sp.mdui.informationURL.hasOwnProperty(l)) {
						UI.addInformationURL(l, entitydescriptor.saml2sp.mdui.informationURL[l]);
					}
				}
			}

			UI.clearPrivacyStatementURL();
			if (entitydescriptor.hasPrivacyStatementURL()) {
				for (l in entitydescriptor.saml2sp.mdui.privacyStatementURL) {
					if (entitydescriptor.saml2sp.mdui.privacyStatementURL.hasOwnProperty(l)) {
						UI.addPrivacyStatementURL(l, entitydescriptor.saml2sp.mdui.privacyStatementURL[l]);
					}
				}
			}
		},

		toXML: function (entitydescriptor) {
			$('div#infoname > div').each(function (index, element) {
				var result = UI.validateName(element);
				if (result.errors.length > 0) {
					return;
				}
				if (!entitydescriptor.name) {
				    entitydescriptor.name = {};
				}
				entitydescriptor.name[result.lang] = result.value;
			});
			$('div#infodescr > div').each(function (index, element) {
				var result = UI.validateDescription(element);
				if (result.errors.length > 0) {
					return;
				}
				if (!entitydescriptor.descr) {
				    entitydescriptor.descr = {};
				}
				entitydescriptor.descr[result.lang] = result.value;
			});
			$('div#infologo > div').each(function (index, element) {
				var result = UI.validateLogo(element);
				if (result.errors.length > 0) {
					return;
				}
				entitydescriptor.addLogo(result.lang, result.location, result.width, result.height);
			});
			$('div#infokeywords > div').each(function (index, element) {
				var result = UI.validateKeywords(element);
				if (result.errors.length > 0) {
					return;
				}
				entitydescriptor.addKeywords(result.lang, result.value);
			});
			$('div#infoinformationurl > div').each(function (index, element) {
				var result = UI.validateInformationurl(element);
				if (result.errors.length > 0) {
					return;
				}
				entitydescriptor.addInformationURL(result.lang, result.value);
			});
			$('div#infoprivacystatementurl > div').each(function (index, element) {
				var result = UI.validatePrivacystatementurl(element);
				if (result.errors.length > 0) {
					return;
				}
				entitydescriptor.addPrivacyStatementURL(result.lang, result.value);
			});
		},
		validate: function () {
			var validator = SAMLmetaJS.validatorManager({
				'div#infoname > div': UI.validateName,
				'div#infodescr > div': UI.validateDescription,
				'div#infologo > div': UI.validateLogo,
				'div#infokeywords > div': UI.validateKeywords,
				'div#infoinformationurl > div': UI.validateInformationurl,
				'div#infoprivacystatementurl > div': UI.validatePrivacystatementurl
			});
			return validator();
		}
	};

}(jQuery));
