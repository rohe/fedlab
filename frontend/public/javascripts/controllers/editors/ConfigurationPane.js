define(function(require, exports, module) {
		

	var
		$ = require('jquery'),
		// EntityEditor = require('controllers/editors/EntityEditor'),
		OICProvider = require('models/OICProvider'),

		// EditorConnect = require('./EditorConnect'),
		// Editor = require('./Editor'),

		Emitter = require('Emitter'),

		hogan = require('lib/hogan');

	// UWAP.utils.loadCSS("/stylesheets/textexecdisplay.css");

	var tmpl = require('lib/text!/templates/configurationpane.html');
	var template = hogan.compile(tmpl);

	var ConfigurationPane = Class.extend({
		init: function(editor, el) {
			this.el = el || $("<div></div>");
			var editorel;

			console.log("ConfigurationPane");
			console.log("Initializing ConfigurationPane");

			this.el.empty().append(template.render({}));
			this.el.on("click", "button.verify", this.proxy("verify"));

			editorel = this.el.find('div#editor');
			this.editor = new editor(editorel);

	    },
		appendTo: function(el) {
			this.el.appendTo(el);
			this.el.trigger('showonly');
		},
		proxy: function(x) {
			return $.proxy(this[x], this);
		},

		verify: function() {
			var data = this.editor.getItem();
			console.log("Verify these data", data);
			this.emit('verify', data);
		},
		addUserInteraction: function(ia) {
			this.editor.addUserInteraction(ia);
		}

	});
	$.extend(ConfigurationPane.prototype, Emitter);

	return ConfigurationPane;
	
});