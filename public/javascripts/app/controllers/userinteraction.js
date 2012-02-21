(function ($, exports) {

	exports.UserInteraction = Spine.Controller.sub({
		tag: "div",
		events: {
			"click .iacancel": "complete"	
		},
		init: function(url, body) {
			var that = this;
			this.url = url;
			this.body = body;
			console.log("Interaction init()");
			console.log(this.el);

			window.addEventListener("message", this.proxy(this.receiveMessage), false);  

			$("body").append('<div class="backgroundfade"></div>');
			
			$(this.el).addClass("userinteraction");
			$(this.el).append('<div class="userinteractioninstructions">Your provider displays a web page that we think would need user interaction. ' +
				'Perform the needed action, and we\'ll learn what user interaction is needed to continue. ' +
				'<input type="submit" class="iacancel" name="iacancel" value="Cancel user interaction" /></div>');

			$("<iframe></iframe>")
				.addClass('userinteraction')
				.attr('src', "data:text/html," + encodeURI(this.body))
				.appendTo(this.el);


			// console.log('init() EntitySelector')
		},
		complete: function() {
			this.release();
			$("div.backgroundfade").remove();
			window.removeEventListener("message", this.proxy(this.receiveMessage), false);  
		},
		receiveMessage: function(e) {
			e.preventDefault();
			console.log("Received message from iframe...");
			console.log(e.data);
			this.trigger("userinteraction", e.data);
			this.complete();
		}

	});
	exports.UserInteraction.include(Spine.Events);
	
	
	
})(jQuery, window);