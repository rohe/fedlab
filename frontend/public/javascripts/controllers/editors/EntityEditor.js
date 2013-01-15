define(function(require, exports, module) {

	var
		Spine = require(),
		OICProviderEditor = require('controllers/editors/OICProviderEditor');

	var EntityEditor = Spine.Controller.sub({
		init: function() {
			if (typeof this.type !== 'function') {
				throw 'Missing required property on Editor: type';
			}			
			this.item.bind("destroy", this.proxy(this.remove));
			this.render();
		},
		render: function() {
			console.log("Render() with template ID " + this.templateID);
			console.log(this.item);
			var template = $("#" + this.templateID).tmpl( this.item );
			$(this.el).html( template );
		},
		remove: function() {
			this.release();
		},
		setEntry: function(item) {
			this.item = item;
		}
	});

	return EntityEditor;

});