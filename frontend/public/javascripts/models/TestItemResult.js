define(function(require, exports, module) {
	
	var 
		Spine = require('spine');


	var TestItemResult = Spine.Model.sub({
		init: function() {
			// console.log("initing item"); //console.log(this);
		},
		getStatusTag: function() {

			// console.log("get statustag on [TestItem] " + this.status);
			// console.log(this);

			// return "STATUS:" + this.status;

			if (typeof this.status === undefined || this.status === null) return "info";
			switch(this.status) {
				case 0: return "info";
				case 1: return "success";
				case 2: return "warning";
				case 3: return "error";
				case 4: return "critical";
				default: return "info";
			}
		},
		getMessage: function() {
			if (!this.message) return '';

			return this.message;

			// try {
			// 	return JSON.parse(this.message);
			// } catch(e) {
			// 	return this.message;
			// }
			// return '';
		},
		hasMessage: function() {
			return !!(this.message);
		},
		hasMessageClass: function() {
			return this.hasMessage() ? 'hasMessage' : '';
		}
	});

	TestItemResult.configure("TestItemResult", "tid", "name", "status", "message", "debug");

	return TestItemResult;

});

