(function ($, exports) {


	exports.PublishController = Spine.Controller.sub({
		events: {
			"click input#dopublish": "publish"
		},
		init: function(args, fedlab) {
			this.fedlab = fedlab;

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
				url: "/api",
				dataType: 'json',
				cache: false,
				type: "POST",
				data: post,
				success: function(response) {
					console.log("Success posting results");
					$(that.el).find("input#dopublish").attr("disabled", "disabled");
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