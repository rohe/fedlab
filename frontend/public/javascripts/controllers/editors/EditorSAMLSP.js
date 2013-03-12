define(function(require, exports, module) {
		

	var
		$ = require('jquery'),
		// EntityEditor = require('controllers/editors/EntityEditor'),
		OICProvider = require('models/OICProvider'),
		UserInteractionRule = require('models/UserInteractionRule'),

		Editor = require('./Editor'),
		hogan = require('lib/hogan');

	require('bootstrap');

	// UWAP.utils.loadCSS("/stylesheets/saml.css");

	var tmpl = require('lib/text!/templates/editor.samlconsumer.html');
	var template = hogan.compile(tmpl);

	var tmplui = require('lib/text!/templates/uirule.html');
	var templateui = hogan.compile(tmplui);

	var EditorSAMLSP = Editor.extend({
		init: function(pane, el) {
			this.item = {metadata: {}};
			this.identifier = 'sp';
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
			console.log("Render() with template EditorSAMLProvider ");
			console.log(this.item);

			if (this.item.metadata.metadata) $("form#configurationForm textarea#metadatafield").val(this.item.metadata.metadata);
			if (this.item.metadata.initsso) $("form#configurationForm input#fedlab_initsso").val(this.item.metadata.initsso);
			if (this.item.metadata.attributeurl) $("form#configurationForm input#fedlab_attributeurl").val(this.item.metadata.attributeurl);
			if (this.item.metadata.initslo) $("form#configurationForm input#fedlab_initslo").val(this.item.metadata.initslo);


			this.el.find('div#userinteractions').empty();
			console.log("LOOKING FOR UI", this.item);
			if (this.item.metadata.interaction && this.item.metadata.interaction.length > 0) {
				this.el.find('fieldset#userInteractionDisplay').show();
				for(var i = 0; i < this.item.metadata.interaction.length; i++) {
					var uir = new UserInteractionRule(this.item.metadata.interaction[i]);
					console.log("Uir,", uir);
					this.el.find('div#userinteractions').append(templateui.render(uir));
				}
			} else {
				console.log("HIDING", this.el);
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


			this.item.metadata = {
				metadata: $("form#configurationForm textarea#metadatafield").val(),
				initsso: $("form#configurationForm input#fedlab_initsso").val(),
				attributeurl: $("form#configurationForm input#fedlab_attributeurl").val(),
				initslo: $("form#configurationForm input#fedlab_initslo").val()
			};

			this.saveMetadata(this.item.metadata);

			return this.item;

		},
		addUserInteraction: function(ia) {
			console.log("Adding user interaction to connect editor item", ia);
			if (!this.item.metadata.interaction) this.item.metadata.interaction = [];
			this.item.metadata.interaction.push(ia);
			this.update();
		},
		resetInteraction: function(e) {
			if (e) {
				e.stopPropagation();
				e.preventDefault();
			}
			
			delete this.item.metadata.interaction;
			this.update();
			// this.item.save();
			// this.item.edit();
				
		}

	});

	return EditorSAMLSP;
	
});