(function ($, exports) {


	exports.PublishController = Spine.Controller.sub({
		events: {
			"click input#dopublish": "publish"
		},
		init: function(args, fedlab) {
			this.fedlab = fedlab;

		},
		enable: function() {
			$(this.el).show()
			$(this.el).find("input#dopublish").removeAttr("disabled");
		},
		disable: function() {
			$(this.el).find("input#dopublish").attr("disabled", "disabled");
		},
		publish: function() {
			var post = {}, that = this;
			if (!this.fedlab.results) return;

			post.operation = "publish";
			post.pincode = $(this.el).find("input.pincode").attr("value");
			post.data = {
				lastRun: Math.round(new Date().getTime()),
				results: {}
			};
			

			for(var key in this.fedlab.results) {
				post.data.results[key] = this.fedlab.results[key].status;
			}

			console.log("publish results");
			console.log(post);

			$.ajax({
				url: "/api/results/publish",
				cache: false,
				type: "POST",
				dataType: "json",
				contentType: "application/json; charset=utf-8",	
				data: JSON.stringify(post),
				success: function(response) {
					console.log("Success posting results");
					that.disable();
					alert("Successfully published testresults");
				},
				error: function(error) {
					console.log("Error posting results: " + error);
					alert("Error posting results: " + error);
				}
				
			});

			
		}
	})
	
})(jQuery, window);