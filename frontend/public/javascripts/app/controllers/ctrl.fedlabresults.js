(function ($, exports) {

	exports.FedLabResults = Spine.Controller.sub({
		init: function() {
			this.definitions = null;
			this.results = null;
			this.loadDefinitions();
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
			var table = $('<table class="tablesorter results"></table>');
			var header = $('<tr class="header"></tr>')
				.append('<th>Test flows</th>');
			var row, key;

			for(key in this.results) {
				header.append('<th><attr title="' + this.results[key].name + '">' + this.results[key].short + '</attr></th>');
			}
			

			thead = $('<thead></thead>').append(header);
			table.append(thead);

			tbody = $('<tbody></tbody>');

			for(var testflow in this.definitions) {
				row = $('<tr></tr>');

				if (this.definitions[testflow].name) {
					row.append('<td class="flowname">' + this.definitions[testflow].name + '</td>');
				} else {
					row.append('<td class="flowname">' + this.definitions[testflow].id + '</td>');
				}


				for(key in this.results) {
					if (this.results[key].data.results[this.definitions[testflow].id]) {
						row.append('<td class="resultcode ' + 
								this.getStatusTag(this.results[key].data.results[this.definitions[testflow].id]) + '">' + 
								this.getStatusIcon(this.results[key].data.results[this.definitions[testflow].id]) +
								'</td>');
					} else {
						row.append('<td class="resultcode empty">&nbsp;</td>');
					}
					
				}
				tbody.append(row);
				

			}
			table.append(tbody);

			console.log("Tablesorter()");
			table.tablesorter({
				debug: true
			});

			$(this.el).append(table);
	

		},
		loadDefinitions: function() {
			var that = this;
			$.ajax({
				url: "/api/definitions",
				dataType: 'json',
				cache: false,
				type: "GET",
				// data: postdata,
				success: function(response) {
					console.log("==> Response DEFINITIONS");
					// console.log(response);

					if (response.status === "ok") {	
						console.log("Success");
						that.definitions = response.result;
						that.load();
					}

				},
				error: function(error) {
					console.log("Error: " + error);
				}
				
			});
		},
		load: function() {
			var that = this;
			$.ajax({
				url: "/api/results",
				dataType: 'json',
				cache: false,
				type: "GET",
				// data: postdata,
				success: function(response) {
					console.log("==> Response RESULTS");
					// console.log(response);

					if (response.status === "ok") {	
						// console.log("Success");
						// console.log(that);
						// console.log(response.results);
						that.results = response.results;
						that.render();
					}

				},
				error: function(error) {
					console.log("Error: " + error);
				}
				
			});
		}
	})

})(jQuery, window);