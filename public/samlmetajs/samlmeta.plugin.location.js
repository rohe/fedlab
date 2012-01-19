(function($) {
	var geocoder = new google.maps.Geocoder();
	var map = null;
	var mapmarker = null;

	function updateMarkerAddress (str) {
		$("#locationDescr").html(str);
//			document.getElementById('address').innerHTML = str;
	}

	function geocodePosition (pos) {
		geocoder.geocode({
			latLng: pos
		}, function(responses) {
			if (responses && responses.length > 0) {
				updateMarkerAddress(responses[0].formatted_address);
			} else {
				updateMarkerAddress('Cannot determine address at this location.');
			}
		});
	}

	function updateMarkerStatus (str) {
//			$("#locationDescr").html(str);
//			document.getElementById('markerStatus').innerHTML = str;
	}

	function updateMarkerPosition (latLng) {
		$("input#geolocation").val(latLng.lat() + ',' + latLng.lng());
		// document.getElementById('info').innerHTML = [
		// latLng.lat(),
		// latLng.lng()
		// ].join(', ');
	}

	function setLocation (location) {
		$("input#geolocation").val(location);
		$("input#includeLocation").attr('checked', true);
	}

	SAMLmetaJS.plugins.location = {
		tabClick: function (handler) {
			handler($("a[href='#location']"));
		},

		addTab: function (pluginTabs) {
			pluginTabs.list.push('<li><a href="#location">Location</a></li>');
			pluginTabs.content.push(
				'<div id="location">' +
					'<div class="content">' +
						'<div id="map_info">' +
							'<p><input type="checkbox" id="includeLocation" name="includeLocation" /> ' +
							'<label for="includeLocation">Associate this entity with the location below.' +
							'Drag the marker to set the correct location.</label></p>' +
							'<p><input type="input" id="geolocation" style="width: 30em" disabled="disabled" name="location" value="" />' +
							'<span id="locationDescr"></span>' +
							'</p>' +
						'</div>' +
						'<div id="map_canvas" style="width:100%; height:500px"></div>' +
					'</div>' +
				'</div>'
			);
		},

		setUp: function () {
			var latLng = new google.maps.LatLng(53.852527,14.238281);
			var myOptions = {
				zoom: 4,
				center: latLng,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};

			map = new google.maps.Map($("#map_canvas")[0], myOptions);
			mapmarker = new google.maps.Marker({
				position: latLng,
				title: 'Point A',
				map: map,
				draggable: true
			});

			// Update current position info.
			updateMarkerPosition(latLng);
			geocodePosition(latLng);

			// Add dragging event listeners.
			google.maps.event.addListener(mapmarker, 'dragstart', function() {
				updateMarkerAddress('Dragging...');
			});

			google.maps.event.addListener(mapmarker, 'drag', function() {
				updateMarkerStatus('Dragging...');
				updateMarkerPosition(mapmarker.getPosition());
			});

			google.maps.event.addListener(mapmarker, 'dragend', function() {
				updateMarkerStatus('Drag ended');
				updateMarkerPosition(mapmarker.getPosition());
				geocodePosition(mapmarker.getPosition());

				$("input#includeLocation").attr('checked', true);
			});

			$("#tabs").bind("tabsshow", function(event, ui) {
				if (ui.panel.id === "location") {
					console.log('google resize');
					google.maps.event.trigger(map, 'resize');
					// SAMLmetaJS.map.checkResize();
				}
			});
		},

		fromXML: function (entitydescriptor) {
			var spl, latLng;

			if (!entitydescriptor.entityAttributes) {
				return;
			}

			if (entitydescriptor.location) {
				SAMLmetaJS.UI.setLocation(entitydescriptor.location);
				spl = entitydescriptor.location.split(',');
				latLng = new google.maps.LatLng(spl[0],spl[1]);

				map.panTo(latLng);
				mapmarker.setPosition(latLng);
			}
		},

		toXML: function (entitydescriptor) {
			if ($("input#includeLocation").attr('checked')) {
				entitydescriptor.location = $("input#geolocation").val();
			}
		}
	};

}(jQuery));
