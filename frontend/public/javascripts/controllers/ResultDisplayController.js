define(function(require, exports, module) {

	var 
		$ = require('jquery'),
		Class = require('../lib/resig'),
		APIconnector = require('../api/APIconnector')
		;

	var ResultDisplayController = Class.extend({
		init: function(el) {
			this.el = el;
			console.log("Initing ResultDisplayController", el);

			this.el.on('click', 'a.sortBy', $.proxy(function(e) {
				var k = $(e.currentTarget).data("sortbykey");
				if (k === "null") k = null;

				console.log($(e.currentTarget));

				if (typeof k === 'undefined') return;

				console.log("Set sort key to ", k);
				this.sortby = k;
				this.renderTableBody();

			}, this));

			this.routingEnabled = true;
			$(window).bind('hashchange', $.proxy(this.route, this));
			this.route();
		},
		load: function(type) {
			var that = this;
			// $(this.el).empty();
			this.type = type;
			this.api = new APIconnector(type, null);

			this.sortby = null;
			this.definitions = null;
			this.results = null;


			console.log("loadDefinitions()");
			this.api.getDefinitions(function(definitions) {
				console.log("loadDefinitions() result ", definitions);
				that.definitions = definitions;

				that.api.getResults(function(results) {
					console.log("load() result", results);
					that.results = results;
					that.render();
				});
			});


			console.log("load(ed)");


		},
		route: function() {
			if (!this.routingEnabled) return;
			var hash = window.location.hash;
			if (hash.length < 3) {
				this.setHash('/');
			}
			hash = hash.substr(2);

			var parameters;
			var validTypes = ['saml', 'connect'];

			console.log("Routing...", hash);

			if (hash.match(/^\/$/)) {

				this.el.append('');

			} else if (parameters = hash.match(/^\/post$/)) {

				console.log('ROUTING LOAD /')

			} else if (parameters = hash.match(/^\/([0-9a-z]+)$/)) {

				if (validTypes.indexOf(parameters[1]) === -1) {
					this.setHash('/');
					return;
				}

				console.log('ROUTING LOAD ' + parameters[1]);
				this.load(parameters[1]);

			} else {
				console.error('No match found for router...');
			}

			// console.log("HASH Change", window.location.hash);
		},
		setHash: function(hash) {
			this.routingEnabled = false;
			window.location.hash = '#!' + hash;
			// console.log("Setting hash to " + hash);
			this.routingEnabled = true;
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

			$(this.el).find('.results').remove();
			$(this.el).append(table);
			$(this.el).find('.tooltipped').tooltip();

			$(this.el).find('#testtype').html(this.type);

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
				// that.load();
			});

		}
	});

	return ResultDisplayController;

});