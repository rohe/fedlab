define(function(require, exports, module) {

	var
		$ = require('jquery'),
		Spine = require('spine');

	var ResultController = Spine.Controller.sub({
		events: {
			"click input.testFlowRun": "run",
			"click input.testFlowSShow": "sshow",
			"click input.testFlowSHide": "shide",
			"click input.testFlowDCShow": "dcshow",
			"click input.testFlowDCHide": "dchide",
			"click input.testFlowOthersShow": "othersshow",
			"click input.testFlowOthersHide": "othershide",
			"click div.testItem": "messageToggle"
		},
		init: function() {
			this.routingEnabled = true;

		},

		getFlow: function(e) {
			var el = $(e.target).closest("div.testFlow");
			return el;
		},
		getTestItem: function(e) {
			var el = $(e.target).closest("div.testItem");
			return el;
		},
		messageToggle: function(e) {
			var ti = this.getTestItem(e);
			ti.toggleClass("showDebugMessage");
		},
		run: function(e) {
			// console.log("Run()");
			var sid = this.getFlow(e).attr("id");
			this.cleanup(sid);
			this.trigger("run", sid);
		},
		othersshow: function(e) {
			this.getFlow(e).removeClass("showOnly");	
			$("div#results").removeClass("hideOthers");	
		},
		othershide: function(e) {
			this.getFlow(e).addClass("showOnly");
			$("div#results").addClass("hideOthers");	
		},		
		sshow: function(e) {
			this.getFlow(e).addClass("successShow");
		},
		shide: function(e) {
			this.getFlow(e).removeClass("successShow");
		},
		dcshow: function(e) {
			this.getFlow(e).addClass("debugShow");
		},
		dchide: function(e) {
			this.getFlow(e).removeClass("debugShow");
		},
		
		escapeHTML: function(str) {
			if (!str) return '';
			return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
		},
		cleanup: function(sid) {
			if (sid) {
				$("div#" + sid).find("div.testFlowResults").empty();
				$("div#" + sid).find("pre.debugConsole").remove();
				$("div#" + sid).
					removeClass("completed").
					removeClass("success").
					removeClass("warning").
					removeClass("error").
					removeClass("critical").
					removeClass("info");
				
			} else {
				$(this.el).find("div.testFlow").each(function(i, item) {
					$(item).find("div.testFlowResults").empty();
					$(item).find("pre.debugConsole").remove();
					$(item).
						removeClass("completed").
						removeClass("success").
						removeClass("error").
						removeClass("warning").
						removeClass("critical").
						removeClass("info");
				});
			}

		},
		
		/*
		 Example of the changes property:
		
			changes = {
				"runBefore": true,
				"lastRun": 387684375,
				"changed": false
			}			
		*/

		updateFlowResults: function(testflow, sid, testresults) {

			console.log("=====> updateFlowResults(" + testflow + ":" + sid + ")");
			console.log(testresults);

			
			var testflowel = $(this.el).find("div#" + sid);
			
			// console.log("Found testflowel"); console.log(testflowel);
			
			testflowel.removeClass("running");
			testflowel.addClass("completed");
			testflowel.addClass(testresults.getStatusTag());

			if (testresults.changes) {
				if (testresults.changes.changed) {
					testflowel.addClass("changed");
				} else {
					testflowel.removeClass("changed");
				}
			}

			testflowel.find("div.lastRunInfo").html(testresults.getRunInfo());

			var testflowresel = testflowel.find("div.testFlowResults");
			
			if (testresults.tests) {
				$.each(testresults.tests, function(i, test) {
					// var status = Math.floor(test.status / 100);
					// test.statusClass = "fail";
					// if (status === 2) test.statusClass = "success";
					// console.log("    <======> Appending Test result");
					// console.log("Check status tag: " + test.getStatusTag());
					var testel = testflowresel.append($("#testItem").tmpl(test));
					// testel.find("pre").html(JSON.stringify(JSON.parse(test.message), undefined, 2));
					// testel.find("pre").html(test.message);

					// syntaxHighlight($item.data.message)  
					// testel.addClass(test.getStatusTag());
				});
			} else {
				
			}

			testflowel.append("<pre style=\"clear: both\" class=\"clearfix debugConsole\">" + this.escapeHTML(testresults.debug) + "</div>");

		},
		
		shaddow: function(testflow, sid, shaddow) {
			if (shaddow) {
				$("div#" + sid).addClass("shaddow");		
			} else {
				$("div#" + sid).removeClass("shaddow");
			}
			
		},
		
		startFlow: function(testflow, sid) {
			this.cleanup(sid);
			$("div#" + sid).addClass("running");

		}
		
		
		
	});

	return ResultController;
});