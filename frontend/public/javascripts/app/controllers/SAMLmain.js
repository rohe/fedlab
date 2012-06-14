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
			

		},
		verify: function() {
			
		}
	});


	exports.SAMLmain = SAMLmain;
	
	
	
})(jQuery, window);