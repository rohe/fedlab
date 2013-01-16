define(function(require, exports, module) {

	var 
		Class = require('../lib/resig'),
		APIconnector = require('../api/APIconnector')
		;

	var ResultDisplayController = Class.extend({
		init: function(el, type) {
			this.el = el;
			console.log("Initing ResultController", el);

			this.api = new APIconnector(type, null);

			this.sortby = null;
			this.definitions = null;
			this.results = null;
			this.loadDefinitions();

			this.el.on('click', 'a.sortBy', $.proxy(function(e) {
				var k = $(e.currentTarget).data("sortbykey");
				if (k === "null") k = null;

				console.log($(e.currentTarget));

				if (typeof k === 'undefined') return;

				console.log("Set sort key to ", k);
				this.sortby = k;
				this.renderTableBody();

			}, this))
		},
		getStatusTag: function(status) {
			// console.log("get statustag on [TestFlow] " + this.status);
			status = parseInt(status, 10);
			switch(status) {
				case 0: return "info";
				case 1: return "success";
				case 2: return "warning";
				case 3: return "error";
				case 4: return "critical";
				default: return "info";
			}
		},
		getStatusIcon: function(status) {
			// console.log("get statustag on [TestFlow] " + this.status);
			status = parseInt(status, 10);
			switch(status) {
				case 0: return '<img src="/images/information.png" />';
				case 1: return '<img src="/images/accept.png" />';
				case 2: return '<img src="/images/error.png" />';
				case 3: return '<img src="/images/exclamation.png" />';
				case 4: return '<img src="/images/exclamation.png" />';
				default: return '<img src="/images/information.png" />';
			}
		},
		render: function() {
			var thead, tbody;

			console.log("render()   defintions, results");
			console.log(this.definitions);
			console.log(this.results);
			console.log("-------");
			var table = $('<table class="results table table-striped table-bordered table-condensed"></table>');
			var header = $('<tr class="header"></tr>')
				.append('<th><a href="#" data-sortByKey="null" class="sortBy">Test flows</a></th>');
			var row, key;

			for(key in this.results) {
				header.append('<th><a href="#" style="text-decoration: none" data-sortbykey="' + key + '" class="sortBy tooltipped" rel="tooltip" title="' + this.results[key].name + '">' + this.results[key].short + '</a></th>');
			}

			thead = $('<thead></thead>').append(header);
			table.append(thead);

			tbody = $('<tbody></tbody>');
			table.append(tbody);


			$(this.el).append(table);
			$(this.el).find('.tooltipped').tooltip();

			this.renderTableBody();
		},

		getComparable: function(a, b) {
			var ax, bx;
			ax = (5 - parseInt(a, 10)) || 0;
			bx = (5 - parseInt(b, 10)) || 0;
			// console.log("Parsed", ax, bx);
			return ax-bx;
		},

		getSorted: function() {

			var keys = [], that = this;

			console.log("Class", this);
			for(var k in this.definitions) {
				if (this.definitions.hasOwnProperty(k)) keys.push(k);
			}

			if (this.sortby === null) return keys;

			keys.sort(function(a, b) {
				// console.log("About to sort, ", that.results, a, b);
				// console.log(that.results[sortby].data.results);
				var res = that.getComparable(
					that.results[that.sortby].data.results[that.definitions[b].id],
					that.results[that.sortby].data.results[that.definitions[a].id]);
				// console.log("RES WAS", that.results[that.sortby].data.results[that.definitions[a].id], that.results[that.sortby].data.results[that.definitions[b].id], res);
				return res;
			});

			return keys;
		},

		renderTableBody: function() {
			var tbody = this.el.find("tbody").empty();

			var sorted = this.getSorted();
			var testflow;

			for(var i = 0; i < sorted.length; i++) {

				testflow = sorted[i];

			// for(var testflow in this.definitions) {
				row = $('<tr></tr>');

				if (this.definitions[testflow].name) {
					row.append('<td class="flowname">' + this.definitions[testflow].name + '</td>');
				} else {
					row.append('<td class="flowname">' + this.definitions[testflow].id + '</td>');
				}

				var 
					allSuccess = true,
					allError = true,
					status;

				for(key in this.results) {
					status = this.results[key].data.results[this.definitions[testflow].id];
					if (status) {
						console.log("status is ", JSON.stringify(status));
						if (status === '4') allSuccess = false;
						if (status == 1) allError = false;
						row.append('<td class="resultcode ' + 
								this.getStatusTag(status) + '">' + 
								this.getStatusIcon(status) +
								'</td>');
					} else {
						allError = false;
						allSuccess = false;
						row.append('<td class="resultcode empty">&nbsp;</td>');
					}
					
				}
				if (allSuccess) row.addClass("success");
				if (allError) row.addClass("error");

				tbody.append(row);
			}

		},

		loadDefinitions: function() {
			var that = this;

			console.log("loadDefinitions()");
			this.api.getDefinitions(function(definitions) {
				console.log("loadDefinitions() result ", definitions);
				that.definitions = definitions;
				that.load();
			});

		},
		load: function() {
			var that = this;

			console.log("load()");

			this.api.getResults(function(results) {
				console.log("load() result", results);
				that.results = results;
				that.render();
			});

		}
	});

	return ResultDisplayController;

});