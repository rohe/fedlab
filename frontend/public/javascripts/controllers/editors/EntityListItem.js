define(function(require, exports, module) {
	
	var
		$ = require('jquery'),
		Spine = require('spine');

	require('lib/jquery.tmpl.min');

	var EntityListItem = Spine.Controller.sub({
		tag: "li",
		item: null,
		prepared: null,
		init: function() {
			// this.item.bind("entityactive", this.proxy(this.photoactivated));
			this.item.bind("edit", this.proxy(this.startedit));
			this.item.bind("destroy", this.proxy(this.remove));
			this.item.bind("change", this.proxy(this.prepare));
		},
		prepare: function(item) {

			console.log("checking this.el: " + typeof this.el, this.el);

			$(this.el).html($("#providerItem").tmpl(this.item));
			$(this.el).addClass("autosave");
			setTimeout(this.proxy(function() {
				$(this.el).removeClass("autosave");
			}), 600);
			return this;
		},

		startedit: function(item) {
			// // console.log(item);
			$(this.el).addClass('active');
		},
		
		remove: function() {
			// console.log("Destroy item detected...");
			// console.log(this);
			this.release();
		}
		
		
	});

	return EntityListItem;
});