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

			
		},
		appendTo: function(el) {
			this.el.appendTo(el);
		},
		getItem: function() {
			return {};
		},
		// addUserinteraction: function(ia) {
		// 	console.log("Adding user interaction to connect editor item", ia);
		// 	if (!this.item.metadata.interaction) this.item.metadata.interaction = [];
		// 	this.item.metadata.interaction.push(ia);
		// 	this.update();
		// },
		update: function() {
			console.log("Update() not implemented by this editor.")
		}
	});

	return Editor;

});