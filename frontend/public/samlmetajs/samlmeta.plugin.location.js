(function($) {
	var geocoder = new google.maps.Geocoder();
	var map = null;
	var mapmarker = null;
	var UI = {
		updateMarkerAddress: function (str) {
			$("#locationDescr").html(str);
		},
		geocodePosition: function (pos) {
			geocoder.geocode({
				latLng: pos
			}, function (responses) {
				if (responses && responses.length > 0) {
					UI.updateMarkerAddress(responses[0].formatted_address);
				} else {
					UI.updateMarkerAddress('Cannot determine address at this location.');
				}
			});
		},

		updateMarkerPosition: function (latLng) {
			$("input#geolocation").val(latLng.lat() + ',' + latLng.lng());
		},

		setLocation: function (location) {
			$("input#geolocation").val(location);
			$("input#includeLocation").attr('checked', true);
		}

	};
	var guessLocationHandler = function (position) {
		console.log(position);
		var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
		map.panTo(latLng);
		mapmarker.setPosition(latLng);
		UI.geocodePosition(latLng);
		UI.setLocation('' + position.coords.latitude + ',' + position.coords.longitude);
	};

	SAMLmetaJS.plugins.location = {
		tabClick: function (handler) {
			handler($("a[href='#location']"));
		},

		addTab: function (pluginTabs) {
			var hasgeolocation = (
				typeof navigator.geolocation !== 'undefined' &&
				typeof navigator.geolocation.getCurrentPosition !== 'undefined'
			);
			pluginTabs.list.push('<li><a href="#location">Location</a></li>');
			pluginTabs.content.push(
				'<div id="location">' +
					'<div class="content">' +
						'<div id="map_info">' +
							'<p><input type="checkbox" id="includeLocation" name="includeLocation" /> ' +
							'<label for="includeLocation">Associate this entity with the location below.' +
							'Drag the marker to set the correct location.</label></p>' +
							'<p><input type="input" id="geolocation" style="width: 20em" disabled="disabled" name="location" value="" />' +
							'<span id="locationDescr"></span>' +
							'</p>' +
							(hasgeolocation ? '<button id="guessLocation">Guess my location</button>' : '') +
						'</div>' +
						'<div id="map_canvas" style="width:100%; height:500px"></div>' +
					'</div>' +
				'</div>'
			);
		},

		setUp: function () {
			var latLng = new google.maps.LatLng(53.852527, 14.238281);
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
			UI.updateMarkerPosition(latLng);
			UI.geocodePosition(latLng);

			// Add dragging event listeners.
			google.maps.event.addListener(mapmarker, 'dragstart', function () {
				UI.updateMarkerAddress('Dragging...');
			});

			google.maps.event.addListener(mapmarker, 'drag', function () {
				UI.updateMarkerPosition(mapmarker.getPosition());
			});

			google.maps.event.addListener(mapmarker, 'dragend', function () {
				UI.updateMarkerPosition(mapmarker.getPosition());
				UI.geocodePosition(mapmarker.getPosition());

				$("input#includeLocation").attr('checked', true);
			});

			$("#tabs").bind("tabsshow", function (event, ui) {
				if (ui.panel.id === "location") {
					console.log('google resize');
					google.maps.event.trigger(map, 'resize');
					// SAMLmetaJS.map.checkResize();
				}
			});

			$("#guessLocation").click(function (event) {
				event.preventDefault();
				navigator.geolocation.getCurrentPosition(guessLocationHandler);
			});
		},

		fromXML: function (entitydescriptor) {
			var spl, latLng, location;

			if (entitydescriptor.hasLocation()) {
				location = entitydescriptor.getLocation();
				UI.setLocation(location);
				spl = location.split(',');
				latLng = new google.maps.LatLng(spl[0], spl[1]);

				map.panTo(latLng);
				mapmarker.setPosition(latLng);
				UI.geocodePosition(latLng);
			}
		},

		toXML: function (entitydescriptor) {
			if ($("input#includeLocation").attr('checked')) {
				entitydescriptor.setLocation($("input#geolocation").val());
			}
		},
		validate: function () {
			return true;  // TODO: check if the input looks like a latitude and longitude tuple
		}
	};

}(jQuery));
