/*
 * JavaScript Pretty Date
 * Copyright (c) 2011 John Resig (ejohn.org)
 * Licensed under the MIT and GPL licenses.
 */

define(function(require, exports, module) {
	

	var $ = require('jquery');

	// Takes an ISO time and returns a string representing how
	// long ago the date represents.
	function prettyDate(time){
		var date = new Date(time),
			diff = (((new Date()).getTime() - date.getTime()) / 1000),
			day_diff = Math.floor(diff / 86400);
				
		if ( isNaN(day_diff) || day_diff < 0 ) return;
				
		return day_diff == 0 && (
				diff < 60 && "just now" ||
				diff < 120 && "1 minute ago" ||
				diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
				diff < 7200 && "1 hour ago" ||
				diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||
			day_diff == 1 && "Yesterday" ||
			day_diff < 7 && day_diff + " days ago" ||
			day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago";
	}


	function prettyInterval(time){
		
		var diff = time /1000,
			day_diff = Math.floor(diff / 86400);
				
		if ( isNaN(day_diff) || day_diff < 0 ) return;
				
		return day_diff == 0 && (
				diff < 60 && Math.floor( diff ) + " seconds before" ||
				diff < 120 && "1 minute before" ||
				diff < 3600 && Math.floor( diff / 60 ) + " minutes before" ||
				diff < 7200 && "1 hour ago" ||
				diff < 86400 && Math.floor( diff / 3600 ) + " hours before") ||
			day_diff == 1 && "the day before" ||
			day_diff < 7 && day_diff + " days before" ||
			day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks before";
	}

	// If jQuery is included in the page, adds a jQuery plugin to handle it as well
	// if ( typeof $ != "undefined" )
	$.fn.prettyDate = function(){
		return this.each(function(){
			var title = parseInt($(this).attr('title'), 10);
			var date = prettyDate(title);
			if ( date )
				jQuery(this).text( date );
		});
	};

	return {
		prettyDate: prettyDate,
		prettyInterval: prettyInterval
	};

});