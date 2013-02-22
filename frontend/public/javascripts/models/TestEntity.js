define(function(require, exports, module) {
	
	var
		Spine = require('spine'),

		TestEntity = require('./TestEntity');

	var TestEntity = Spine.Model.sub({
		init: function() {
			// this.constructor.__super__.init.apply(this, arguments);
			if (typeof this.metadata !== 'object') {
				this.metadata = {};
			};
			if (typeof this.results !== 'object') {
				this.results = {};
			};
			console.log("TestEntity init();");
		}, 
		addUserinteraction: function(msg) {
			/*
			 msg looks like this:
					"matches": {
						"url": "askdjf",
						# gör en 'startswith'
						match "title": "slkdjnsdkljn",
						# använder exakt match mot vad somär mellan < title > .. < /title> taggarna
								   "content": "lskjdf" # försöker hitta strängen någonstans på HTML sidan
								 },
								 "page-type": "login"/"user-consent" / ? ? ? ,
						"control" : {
							"type": "form" / "link",
							< typ specifik del >
						}
					}
		 	*/

		 	console.log("Model addUserinteraction()");
		 	console.log(JSON.stringify(msg));

			if (!this.metadata.interaction) {
				this.metadata.interaction = [];
			}
			// var type = msg['_action']; delete msg['_action'];
			// this.metadata.interaction[url] = [type, msg];
			this.metadata.interaction.push(msg);
			
			
			console.log("addUserinteraction() Metadata:");
			console.log(this.metadata);
		},
		
		/*
		 	Example of this.results
		
			{
				"testflowid": {
					"lastRun": 982347923,
					"result": [0, 2, 3, 2, 1, 0]
				},
				"testflowid2": {
					"lastRun": 
				}
			}
		 */
		updateResults: function(testflow, testresult) {
			var oldresult, newresult, changes;
			if (!this.results) this.results = {};
			oldresult = this.results[testflow];
			
			newresult = testresult.getSimpleResultObj();
			this.results[testflow] = newresult;
			
			if (typeof oldresult === "undefined") {
				changes = {
					"runBefore": false
				};
			} else {
				// console.log("Run before run now")
				// console.log(testresult)
				// console.log(oldresult.results);
				// console.log(newresult.results);
				changes = {
					"runBefore": true,
					"lastRun": oldresult.lastRun,
					"changed": !TestFlowResult.compare(oldresult, newresult)
				}
				// changes.changed = !!(Math.random() > 0.7);
			}
			changes.thisRun = newresult.lastRun;
			// console.log("Updating results");
			// console.log(JSON.parse(JSON.stringify(this)));
			return changes;
		},

		countResults: function() {
			var key, i,
				aggr = [0,0,0,0,0];

			for(key in this.results) {
				for (i = 0; i < this.results[key].results.length; i++) {
					aggr[this.results[key].results[i]]++;
				}
			}
			return aggr;
		},

		dependenciesMet: function(depends) {
			var i;
			for(i = 0; i < depends.length; i++) {
				console.log("Checking dependencies " + depends[i]);
				console.log(this.results);
				if (!this.results[depends[i]]) return false;
				// console.log("Depenncy STATUS WAS "+ this.results[depends[i]].status);
				if (this.results[depends[i]].status === 4) return false;
			}
			return true;
		},
		
		getTitle: function() {
			if (this.title) return this.title;
			return "Unnamed";
		},
		edit: function() {
			// console.log("Entity selected for editing...")
			// console.log(this);
			// console.trace()
			this.trigger("edit");
		}
	});
	TestEntity.configure("TestEntity", "title", "metadata", "results");
	
	return TestEntity;

});