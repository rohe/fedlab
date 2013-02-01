define(function(require, exports, module) {

	var
		$ = require('jquery'),
		hogan = require('lib/hogan');

	UWAP.utils.loadCSS("/stylesheets/testexecdisplay.css");

	var tmpl = require('lib/text!/templates/testFlow.html');
	var template = hogan.compile(tmpl);
	var tmplI = require('lib/text!/templates/testItem.html');
	var templateI = hogan.compile(tmplI);

	var TestExecDisplay = function(definitions, el) {
		var that = this;

		this.definitions = definitions;
		this.el = el || $("<div></div>");
		$(this.el).attr('id', 'TestExecDisplay').empty();

		this.callbacks = {};

		this.flowelements = {};

		// this.defcontainer = $('<div class="results"></div>').appendTo(this.el);

		$.each(this.definitions, function(i, item) {
			// item.sid = sid;		
			// console.log("DEF:", item.getDependencies());
			var fel = $(template.render(item)).appendTo(that.el)
			that.flowelements[item.sid] = fel;
		});
		console.log("Flowelements", this.flowelements);

		$(this.el).on('click', 'input.testFlowRun', this.proxy('run'));
		$(this.el).on('click', 'input.testFlowSShow', this.proxy('sshow'));
		$(this.el).on('click', 'input.testFlowSHide', this.proxy('shide'));
		$(this.el).on('click', 'input.testFlowDCShow', this.proxy('dcshow'));
		$(this.el).on('click', 'input.testFlowDCHide', this.proxy('dchide'));
		$(this.el).on('click', 'input.testFlowOthersShow', this.proxy('othersshow'));
		$(this.el).on('click', 'input.testFlowOthersHide', this.proxy('othershide'));
		$(this.el).on('click', 'div.testItem', this.proxy('messageToggle'));
	};

	/*
	 * Helper functions to get parent elements...
	 */
	TestExecDisplay.prototype.getFlow = function(e) {
		var el = $(e.target).closest("div.testFlow");
		return el;
	};
	TestExecDisplay.prototype.getTestItem = function(e) {
		var el = $(e.target).closest("div.testItem");
		return el;
	};

	/* 
	 * Set of functions event handlers for the test flow action buttons.
	 */
	TestExecDisplay.prototype.messageToggle = function(e) {
		var ti = this.getTestItem(e);
		ti.toggleClass("showDebugMessage");
	};
	TestExecDisplay.prototype.run = function(e) {
		// console.log("Run()");
		var sid = this.getFlow(e).attr("id");
		this.cleanup(sid);
		this.trigger("run", sid);
	};
	TestExecDisplay.prototype.othersshow = function(e) {
		this.getFlow(e).removeClass("showOnly");	
		$(this.el).removeClass("hideOthers");	
	};
	TestExecDisplay.prototype.othershide = function(e) {
		this.getFlow(e).addClass("showOnly");
		$(this.el).addClass("hideOthers");	
	};
	TestExecDisplay.prototype.sshow = function(e) {
		this.getFlow(e).addClass("successShow");
	};
	TestExecDisplay.prototype.shide = function(e) {
		this.getFlow(e).removeClass("successShow");
	};
	TestExecDisplay.prototype.dcshow = function(e) {
		this.getFlow(e).addClass("debugShow");
	};
	TestExecDisplay.prototype.dchide = function(e) {
		this.getFlow(e).removeClass("debugShow");
	};



	TestExecDisplay.prototype.cleanup = function() {
		var that = this;
		$.each(this.definitions, function(i, item) {
			// console.log("i, item", i, item);
			that.setFlowClean(item);
		});
	}


	/**
	 * Clean an presentation of a testflow, to be able to do a new testrun.
	 * @param {[type]} sid [description]
	 */
	TestExecDisplay.prototype.setFlowClean = function(testflow) {
		if (!this.flowelements[testflow.sid]) throw new Error('Not valid [sid]');
		var l = this.flowelements[testflow.sid];
		l.
			removeClass("completed").
			removeClass("success").
			removeClass("warning").
			removeClass("error").
			removeClass("critical").
			removeClass("info");
		l.find("div.testFlowResults").empty();
		l.find("pre.debugConsole").remove();

	}

	/**
	 * Testflow is running
	 * @param {[type]} sid [description]
	 */
	TestExecDisplay.prototype.setFlowRunning = function(testflow) {
		this.setFlowClean(testflow);
		var l = this.flowelements[testflow.sid];
		l.addClass("running");

		l.detach().prependTo(this.el);
	}

	/**
	 * Testrun completed for the testflow.
	 * @param {[type]} sid    [description]
	 * @param {[type]} result [description]
	 */
	TestExecDisplay.prototype.setFlowResult = function(result) {
		this.setFlowClean(result);
		var l = this.flowelements[result.sid];
		
		l.removeClass('running')
			.addClass('completed')
			.addClass(result.getStatusTag());
		l.find("div.lastRunInfo").html(result.getRunInfo());

		// l.detach().prependTo(l.parent());

		var testflowresel = l.find("div.testFlowResults");
		if (result.tests) {
			$.each(result.tests, function(i, test) {
				$(templateI.render(test)).appendTo(testflowresel);
			});
		} else {
			
		}

		this.updateDependencies(result);


		l.append("<pre style=\"clear: both\" class=\"clearfix debugConsole\">" + TestExecDisplay.escapeHTML(result.debug) + "</div>");
	}


	TestExecDisplay.prototype.updateDependencies = function(result) {

		console.log("updateDependencies() on ", result);
		var dependsOnClass = '.dependsOn-' + result.sid;
		console.log("dependson : ", dependsOnClass);

		var actUpon = $(this.el).find(dependsOnClass);

		if (result.ok()) {
			actUpon.addClass("label-success");
		} else {
			actUpon.addClass("label-important");
			actUpon.find('i.iconCheck').addClass('icon-ok-sign');
		}
	}





	TestExecDisplay.prototype.proxy = function(f) {
		return $.proxy(this[f], this)
	}

	TestExecDisplay.prototype.on = function(type, callback) {
		if (!this.callbacks[type]) this.callbacks[type] = [];
		this.callbacks[type].push(callback);
		return this;
	}
	TestExecDisplay.prototype.emit = function(type, parameters) {
		if (this.callbacks[type]) {
			$.each(this.callbacks[type], function(i, c) {
				this.callbacks[type][i].apply(this, Array.prototype.slice.call(arguments, 1))
			});
		}
		return this;
	}

	TestExecDisplay.prototype.appendTo = function(el) {
		$(this.el).appendTo(el);
	} 



	TestExecDisplay.escapeHTML = function(str) {
		if (!str) return '';
		return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
	};


	return TestExecDisplay;
});