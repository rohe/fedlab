

var eventHandler = function(i) {
	return function(e) {
		var formel = $(e.target).closest("form");
		e.preventDefault();
		e.stopPropagation();
		var obj = {};
		obj["index"] = i;
		obj["type"] = "form";
		obj["set"] = {};
		if ($(e.target).attr("name")) {
			obj.set[$(e.target).attr("name")] = $(e.target).attr("value");
			obj.click = $(e.target).attr("name") || '_dummy';
		}

		$(formel).find(":input").each(function() {
			if ($(this).attr("type") === "hidden") return;
			if ($(this).attr("type") === "submit") {
				hasSubmit = true;
				return;
			}
			if ($(this).attr("disabled")) return;
			if ($(this).attr("name")) {
				obj.set[$(this).attr("name")] = $(this).attr("value");
			}
		});
		console.log(JSON.stringify(obj));
		window.parent.postMessage(obj, "*");
	}
}




$(document).ready(function() {

	// $("body").append('<p>Hello world!</p>');

	$("a").bind("click", function(e) {
		e.preventDefault();
		e.stopPropagation();
		var obj = {
			"type": "link",
			"path": $(e.currentTarget).attr("href")
		};
		window.parent.postMessage(obj, "*");
		console.log("=>Posting object to parent window");
	});
	$("form").each(function(i, formitem) {

		console.log("    ====> BUMP");
		var hasSubmit = false;
		$(formitem).find(":input[type=submit]").add($(formitem).find(":input[type=image]")).each(function(i, inpel) {
			$(inpel).show();
			hasSubmit = true;
		});
		if (!hasSubmit) {
			$(formitem).prepend('<input type="submit" name="_injected_submit" value="Submit" />');	
		}

		$(formitem).find(":input[type=submit]").add($(formitem).find(":input[type=image]")).bind("click", eventHandler(i));

		

	});
});