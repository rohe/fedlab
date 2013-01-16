define(function(require, exports, module) {

	var
		Spine = require('spine');

	require('lib/jquery.tmpl.min');

	var PublishController = Spine.Controller.sub({
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
			var 
				post = {}, 
				pincode,
				that = this,
				data;

			if (!this.fedlab.results) return;


			pincode = $(this.el).find("input.pincode").attr("value");
			data = {
				lastRun: Math.round(new Date().getTime()),
				results: {}
			};
			for(var key in this.fedlab.results) {
				data.results[key] = this.fedlab.results[key].status;
			}

			console.log("publish results");
			console.log(this.fedlab);
			console.log(pincode, data);
			// return;

			this.connector.publishResults(pincode, data, function(res) {

				if (res instanceof Error) {
					alert('Error occured  ' + res);
					return;
				}

				console.log("Success posting results");
				that.disable();
				alert("Successfully published testresults");
			});


			
		}
	});

	return PublishController;


});