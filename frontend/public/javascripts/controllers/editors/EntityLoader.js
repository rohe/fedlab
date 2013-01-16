define(function(require, exports, module) {
	
	var
		Spine = require('spine'),
		EntityListItem = require('./EntityListItem');



	var EntityLoader = Spine.Controller.sub({
		events: {
			"click li a.entityOpen": "openentity",
			"click li a.entityDel": "delEntity",
			"click li a.entityDup": "dupEntity",
			"click #createnewitem": "newEntity"
		},
		items: [],
		init: function(){
			var that = this;

			if (!this.modelType || typeof this.modelType !== 'function') {
				throw "EntityLoader init() must include a modelType.";
			}
			
			// console.log("Initing EntityLoader()")
			this.modelType.bind("create", this.proxy(this.addOne));
			this.modelType.bind("refresh", this.proxy(this.addAll));
			this.modelType.bind("edit", this.proxy(this.clearActive));

			$(this.el).find("#configdrop").bind("dragover", function(e) {
				e.stopPropagation();
				e.preventDefault();
				
			});
			$(this.el).find("#configdrop").bind("dragleave", function(e) {
				e.stopPropagation();
				e.preventDefault();
				
			});

			$(this.el).find("#configexport").bind("click", function(e) {
				var i;
				var obj = [];
				var href = "data:application/octet-stream;charset=utf-8;base64,";

				for(i = 0; i < that.items.length; i++) {
					obj.push(that.items[i].item);
				}
				href += btoa(JSON.stringify(obj));
				$(e.target).attr("href", href);
				console.log("Setting href  " + href);
				// return false;
				// window.location.href = href;
			});

			$(this.el).find("#configexport").bind("dragstart", function(e) {
				var dataTransfer = e.originalEvent.dataTransfer;
				var url = "application/pdf:HTML5CheatSheet.pdf:http://thecssninja.come/demo/gmail_dragout/html5-cheat-sheet.pdf";
				//url = "https://raw.github.com/andreassolberg/DiscoJuice/master/discojuice/discojuice.control.js";

				$(e.target).attr("data-downloadurl", "application/pdf:HTML5CheatSheet.pdf:http://thecssninja.come/demo/gmail_dragout/html5-cheat-sheet.pdf");

				e.stopPropagation();
				e.preventDefault();
				console.log("Drag start...");
				var r = dataTransfer.setData("DownloadURL", url);
				console.log('What: ' + (r ? 'YES': 'NO'));
			});

			$(this.el).find("#configdrop").bind("drop", function(event) {
				
				var dataTransfer = event.originalEvent.dataTransfer;
				var freader;
				var obj;
				event.stopPropagation();
				event.preventDefault();

				if (dataTransfer.files.length > 0) { 
					console.log("Drop event");
					console.log(dataTransfer.files[0]);

					freader = new FileReader();
					freader.onload = function(evt) {  
						var i, newentry;
						try {
							obj = JSON.parse(evt.target.result); // 
							
							for(i = 0; i < obj.length; i++) {
								newentry = new that.modelType(obj[i]);
								console.log(obj[i]);
								console.log(newentry);
								newentry.save();
							}

						} catch(e) {
							alert("Invalid configuration data provided: Cannot import: " + e.message);
						}
					};
					
					freader.readAsText(dataTransfer.files[0]);

				}

			});
			
		},	

		activated: function() {
			
		},
		clearActive: function() {
			$(this.el).find("ul li").removeClass("active");
		},
		addOne: function(item) {
			var entity = new EntityListItem({item: item});
			$(this.el).find("ul").append(entity.prepare().el);
			this.items.push(entity);

		},
		addAll: function() {
			this.items = [];
			this.modelType.each(this.proxy(this.addOne));
		},
		ready: function() {
			this.items[this.current].item.activate();
		},
		openentity: function(e) {
			// console.log("open entity");
			e.preventDefault();
			$(e.target).tmplItem().data.edit();
			// console.log("/open entity");
		},
		dupEntity: function(e) {
			// console.log("Dup entity");
			e.preventDefault();
			var newentry = $(e.target).tmplItem().data.dup();
			newentry.title = newentry.title + ' (copy)';
			newentry.save();
			
			newentry.edit();
		},
		delEntity: function(e) {
			e.preventDefault();
			$(e.target).tmplItem().data.destroy();
		},
		newEntity: function(e) {
			// console.log("new item");
			e.preventDefault();
			var newentry = new this.modelType();
			// console.log("Brand new item created");
			// 			console.log(newentry);
			newentry.save();
			newentry.edit();
		}
		
	});
	
	return EntityLoader;
	
});