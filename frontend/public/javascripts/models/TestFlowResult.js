define(function(require, exports, module) {
	
	var 
		$ = require('jquery'),
		// Spine = require('spine'),

		TestItemResult = require('./TestItemResult'),
		FlowDefinition = require('./FlowDefinition'),

		prettydate = require('lib/prettydate/pretty');




	var TestFlowResult = function(obj) {
		for(var k in obj) {
			if (obj.hasOwnProperty(k)) this[k] = obj[k];
		}
		this.sid = FlowDefinition.getSID(this.id);
	}
	TestFlowResult.prototype.getSimpleResultObj = function() {
		var res = {}, i;
		res.lastRun = Math.round(new Date().getTime());
		res.results = [];
		for (i = 0; i < this.tests.length; i++) {
			// console.log("Adding a new result item: ")
			// console.log(this.tests[i]);
			res.results.push(this.tests[i].status);
		} 
		res.status = this.status;
		return res;
	}



	TestFlowResult.prototype.getRunInfo = function() {
			
		var t;

		if (!this.changes) return '';

		t = '<p>Last run <span class="lastRunDate" title="' + this.changes.thisRun + '">' + prettydate.prettyDate(this.changes.thisRun) + '</span>';

		if (this.changes.lastRun) {
			t += ', and the previous one ran ' + prettydate.prettyInterval(this.changes.thisRun - this.changes.lastRun) + ' that';
		}
		t += '.</p>';

		if (this.changes.changed) {
			t += '<p><img src="/images/bell.png" /> The results differ!</p>';
		} else {
			// t += '<p>The result was not changed.</p>';
		}

		return t;
	};

	TestFlowResult.prototype.getStatusTag = function() {
		// console.log("get statustag on [TestFlow] " + this.status);			
		switch(this.status) {
			case 0: return "info";
			case 1: return "success";
			case 2: return "warning";
			case 3: return "error";
			case 4: return "critical";
			default: return "info";
		}
	}

	TestFlowResult.prototype.ok = function() {
		return this.status < 4;
	}

	TestFlowResult.compare = function(r1, r2) {
		var i,
			a1 = r1.results,
			a2 = r2.results;
		
		if (r1.status !== r2.status) return false;
		if (a1.length !== a2.length) return false;
		for(i = 0; i < a1.length; a1++) {
			if (a1[i] !== a2[i]) return false;
		}
		return true;
	};


	TestFlowResult.build = function(sid, obj) {
		var id, tests;
		
		// id = obj.id; delete obj.id;
		tests = obj.tests; delete obj.tests;
		
		// obj.fid = id;
		obj.sid = sid;
		
		var result = new TestFlowResult(obj);
		var testresults = [];
		
		if (tests) {
			for(var i = 0; i < tests.length; i++) {
				testresults.push(new TestItemResult(tests[i]));
			}
			result.tests = testresults;
		}
		// result.save();
		return result;
	}


	return TestFlowResult;
});

