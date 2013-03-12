define(function(require, exports, module) {
		

	var
		$ = require('jquery'),

		UserInteractionRule = require('models/UserInteractionRule'),

		Editor = require('./Editor'),
		hogan = require('lib/hogan');

	require('bootstrap');

	// UWAP.utils.loadCSS("/stylesheets/saml.css");

	var tmpl = require('lib/text!/templates/editor.samlprovider.html');
	var template = hogan.compile(tmpl);

	var tmplui = require('lib/text!/templates/uirule.html');
	var templateui = hogan.compile(tmplui);

	var EditorSAMLIdP = Editor.extend({
		init: function(pane, el) {
			this.identifier = 'idp';
			this.item = {metadata: {}};
			this._super(pane, el);

			console.log("Initializing EditorSAMLProvider");

			this.el.on('click', 'button#userinteraction_reset', this.proxy('resetInteraction'));

			this.el.on('click', 'ul#samlnav a', function(e) {
				e.preventDefault(); 
				e.stopPropagation();
				console.log("Clicked tab", this);
				$(this).tab('show');
			});
			this.el.on('click', "button#firstcontinue", function(e) {
				e.preventDefault();
				e.stopPropagation();
				$('ul#samlnav a:last').tab('show');
			});

			$(this.el).empty().append(template.render(this.item));

			this.update();
	    },
	    
		proxy: function(x) {
			return $.proxy(this[x], this);
		},

		update: function() {
			if (this.item.metadata.metadata) {
				this.el.find("form#configurationForm textarea#metadatafield").val(this.item.metadata.metadata);
			}
			if (this.item.metadata.entity_id) {
				this.el.find("form#configurationForm input#entity_id").val(this.item.metadata.entity_id);
			}

			this.saveMetadata(this.item.metadata);

			this.el.find('div#userinteractions').empty();

			if (this.item.metadata.interaction && this.item.metadata.interaction.length > 0) {

				this.el.find('fieldset#userInteractionDisplay').show();
				for(var i = 0; i < this.item.metadata.interaction.length; i++) {
					var uir = new UserInteractionRule(this.item.metadata.interaction[i]);
					this.el.find('div#userinteractions').append(templateui.render(uir));
				}
			} else {
				this.el.find('fieldset#userInteractionDisplay').hide();	
			}

		},

		remove: function() {
			this.release();
		},

		setEntry: function(item) {
			this.item = item;
		},

		getItem: function() {

			this.item.metadata.metadata  = $("form#configurationForm textarea#metadatafield").val();
			this.item.metadata.entity_id = $("form#configurationForm input#entity_id").val();

			this.saveMetadata(this.item.metadata);

			return this.item;

		}
		


	});

	return EditorSAMLIdP;
	
});