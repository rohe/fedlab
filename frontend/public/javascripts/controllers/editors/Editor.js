define(function(require, exports, module) {
		

	var
		$ = require('jquery'),
		Class = require('../../lib/resig');

	var Editor = Class.extend({
		init: function(pane, el) {
			this.pane = pane;
			this.el = el || $("<div></div>");
			$(this.el).attr('id', 'EditorContainer');
			console.log("Initializing editor");

			var storedConfig = localStorage.getItem(this.identifier +'-metadata');
			if (storedConfig) {
				console.log("   ====== STORED CONFIG: YES")
				this.item.metadata = JSON.parse(storedConfig);
				console.log(this.item.metadata);
			}
			console.log("   ====== STORED CONFIG: NO")

			
		},
		appendTo: function(el) {
			this.el.appendTo(el);
		},
		getItem: function() {
			return {};
		},
		saveMetadata: function(metadata) {
			console.log("====== STORED CONFIG: Storing idp metadata...", metadata);
			localStorage.setItem(this.identifier + '-metadata', JSON.stringify(metadata));
		},
		// addUserinteraction: function(ia) {
		// 	console.log("Adding user interaction to connect editor item", ia);
		// 	if (!this.item.metadata.interaction) this.item.metadata.interaction = [];
		// 	this.item.metadata.interaction.push(ia);
		// 	this.update();
		// },
		update: function() {
			console.log("Update() not implemented by this editor.")
		},
		resetInteraction: function(e) {
			if (e) {
				e.stopPropagation();
				e.preventDefault();
			}
			
			delete this.item.metadata.interaction;
			this.update();
				
		},
		addUserInteraction: function(ia) {
			console.log("Adding user interaction to connect editor item", ia);
			if (!this.item.metadata.interaction) this.item.metadata.interaction = [];
			this.item.metadata.interaction.push(ia);

			this.saveMetadata(this.item.metadata);
			
			this.update();
			this.pane.verify();
		}
	});

	return Editor;

});