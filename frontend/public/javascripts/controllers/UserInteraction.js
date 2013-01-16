define(function(require, exports, module) {
	
	var 
		Spine = require('spine');
		
	var UserInteraction = Spine.Controller.sub({
		tag: "div",
		events: {
			"click .iacancel": "complete"	
		},
		init: function(url, body, title) {
			var that = this;
			var matchoptionsdiv;
			this.completed = false;
			this.url = url;
			this.body = body;
			this.title = title;
			console.log("Interaction init()");
			console.log(this.el);

			window.addEventListener("message", this.proxy(this.receiveMessage), false);  

			$("body").append('<div class="backgroundfade"></div>');
			
			$(this.el).addClass("userinteraction");

			$(this.el).append('<div class="uisect userinteractioninstructions" >Your provider displays a web page that we think would need user interaction.</div>');

			matchoptionsdiv = $('<div class="matchoptionsdiv" style=""></div>');
			$('<div class="uisect userinteractionoptions">We need to know exactly how we can detect a page that would need this specific user interaction. ' +
				'Select at least one matching rule that you know will be the same each time this user interaction is required. ' +
				'</div>')
				.append(matchoptionsdiv)
				.appendTo(this.el);

			matchoptionsdiv.append('<p><label for="uiurl"><input type="checkbox" id="uiurl" name="uiurl" checked="checked" /> ' +
				'The URL starts with </label><input type="text" id="uiurlval" class="matchinput uiurlval" name="uiurlval" value="' + this.url + '" /></p>');

			if (this.title) {
				matchoptionsdiv.append('<p><label for="uititle"><input type="checkbox" id="uititle" name="uititle"  /> The HTML page title is <tt>' + this.title + '</tt>.</label></p>');	
			}

			matchoptionsdiv.append('<p><label for="uicontent"><input type="checkbox" id="uicontent" name="uicontent" /> ' +
				'The page content contains this string </label><input type="text" id="uicontentval" class="matchinput uicontentval" name="uicontentval" value="" /></p>');


			matchoptionsdiv.append('<p>Which type of user interaction is this? ' +
				'<div class="uitypediv" style="margin: 0px; padding: 0px">' + 
				'<label class="radio" for="uitype1"><input type="radio" name="uitype" id="uitype1" value="login"> Login page</label>' + 
				'<label class="radio" for="uitype2"><input type="radio" name="uitype" id="uitype2" value="user-consent">Authorization, Grant or Consent</label>' + 
				'<label class="radio" for="uitype3"><input type="radio" name="uitype" id="uitype3" value="other" checked="checked">Other</label>' + 
				'</div>' + 
				'</p>');


			$(this.el).append('<div class="uisect userinteractioninstructions" style="">Perform the needed action, and we\'ll learn what user interaction is needed to continue. ' +
				'<input type="submit" class="btn btn-mini btn-inverse iacancel" name="iacancel" value="Cancel user interaction" /></div>');

			


			$("<iframe></iframe>")
				.addClass('userinteraction')
				.attr('src', "data:text/html," + encodeURI(this.body))
				.appendTo(this.el);

			// console.log('init() EntitySelector')
		},
		complete: function() {
			this.completed = true;
			console.log("Clearning up contorller userinteraction... Removing...");
			$("div.backgroundfade").remove();
			window.removeEventListener("message", this.proxy(this.receiveMessage), false);  
			this.release();
		},
		getMatches: function() {
			var m = {};
			if ($(this.el).find("input#uiurlval").val() && $(this.el).find("input#uiurl").prop("checked")) {
				m["url"] = $(this.el).find("input#uiurlval").val();
			}
			if ($(this.el).find("input#uititle") && $(this.el).find("input#uititle").prop("checked")) {
				m["title"] = this.title;
			}
			if ($(this.el).find("input#uicontent").prop("checked")) {
				m["content"] = $(this.el).find("input#uicontentval").val();
			}
			return m;
		},
		getPageType: function() {
			return $(this.el).find("input:radio[name=uitype]:checked").val();
		},
		receiveMessage: function(e) {
			var iobj = {};
			e.preventDefault();
			e.stopPropagation();

			if (this.completed) {
				console.log("ALREADY DONE. Returning without actions");
				return;
			}

			iobj.matches = this.getMatches();
			iobj["page-type"] = this.getPageType();
			iobj.control = e.data;
			

			console.log("   <=========================> Received message from iframe...");
			console.log(iobj);
			console.log(e.data);

			this.trigger("userinteraction", iobj);
			this.complete();
			console.log("DONE...");
		}

	});
	UserInteraction.include(Spine.Events);
	return UserInteraction;
});