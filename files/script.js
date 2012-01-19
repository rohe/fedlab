$(document).ready(function() {
	

	
	$("div.controller input[name='filter']").change(function() {
		var value = $('div.controller input:radio[name=filter]:checked').val(); 
		
		// Show all
		if (value === 'radio0') {
			$("div.statusentry.status0").show();
			$("div.statusentry.status1").show();
			$("div.statusentry.status2").show();
			$("div.statusentry.status3").show();
			
		} else if (value === 'radio1') {
			$("div.statusentry.status0").show();
			$("div.statusentry.status1").hide();
			$("div.statusentry.status2").show();
			$("div.statusentry.status3").hide();

		} else {
			$("div.statusentry.status0").show();
			$("div.statusentry.status1").hide();
			$("div.statusentry.status2").hide();
			$("div.statusentry.status3").hide();

		}
	});
	
	$.getJSON('/data', function(data) {
		var 
			items = [];
		
		$.each(data, function(key, val) {
			var 
				descr = '',
				html = '',
				shtml = '',
				i;

			
			if (val.descr && val.descr.en) {
				descr = val.descr.en;
			}
			
			switch(val.totalStatus) {
				case 0:
					html += '<img class="totalstatus" src="/icons/status-error.png" />';
					break;

				case 2:
					html += '<img class="totalstatus" src="/icons/status-warning.png" />';
					break;
				
				case 1:
				default:
					html += '<img class="totalstatus" src="/icons/status-ok.png" />';
					break;
			}
			
			html += '<pre class="entityid"><code>' + val.entityid + '</code></pre>' + 
				'<h2>' + val.title + '</h2>' +
				'<p class="descr">' + descr + '</p>';
			
			for(i = 0; i < val.status.length; i++) {
				shtml = '';
				switch(val.status[i].status) {
					case 1:
						shtml += '<img src="/icons/accept.png" />' + val.status[i].title;
						break;

					case 2:
						shtml += '<img src="/icons/error.png" />' + val.status[i].title;
						break;
					
					case 3:
						shtml += '<img src="/icons/information.png" />' + val.status[i].title;
						break;

					
					default:
					case 0:
						shtml += '<img src="/icons/exclamation.png" />' + val.status[i].title;
						break;

				}
				html += '<div class="statusentry status' + val.status[i].status + '">' + shtml + '</div>';
				
			}
			
			html = html + '<pre class="debug"><code>' + val.text + '</code></pre>';
			
			html = '<div class="entry" id="entry-' + key + '">' + html + '</div>';


			items.push(html); 
		});
		
		$('<div/>', {'class': 'entries', html: items.join('') }).appendTo('body');
		
	});
	
});

