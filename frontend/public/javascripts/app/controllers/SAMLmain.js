(function ($, exports) {

	/**
	 * Main controller for dealing with testing SAML SP.
	 * This class is instanciated after metadata is successfully configured.
	 * @type {[type]}
	 */
	var SAMLmain = Spine.Class.sub({
		init: function(container, metadata) {
			this.container = container;
			this.metadata = metadata;

			this.connector = new APIconnector("saml", this.metadata);
			this.connector.verify($.proxy(this.verifyok, this), this.verifyfailed);
		},
		verifyok: function() {
			this.connector.getDefinitions(this.definitionLoaded, 
				function(err) {
					console.log("Error: " + err.message);
				}
			);
		},
		verifyfailed: function(f) {
			alert("Failed " + f);
		},
		definitionLoaded: function(def) {
			console.log("Definitions loaded ", def);
		}
	});


	exports.SAMLmain = SAMLmain;
	
	
	
})(jQuery, window);