<?php

class sspmod_fedlab_SPMetadata {

	public $xmlmetadata;
	public $parsed;
	
	public $initsso = NULL;
	public $initslo = NULL;
	public $attributeurl = NULL;

	public function __construct($metadata, $initurl, $initslo, $attributeurl) {

		$this->xmlmetadata = $metadata;
		$this->getMetadata();
		$this->parse();

		$this->initsso = $initurl;
		$this->initslo = $initslo;
		$this->attributeurl = $attributeurl;
	}
	public function debug() {
		error_log(var_export($this->initsso, TRUE));
	}
	
	private function getMetadata() {
		
		$entities = SimpleSAML_Metadata_SAMLParser::parseDescriptorsString($this->xmlmetadata);
		$entity = array_pop($entities);
		$this->parsed =  $entity->getMetadata20SP();		
	}
	
	
	private function parse() {

		// if (empty($this->parsed['EntityAttributes'])) {
		// 	throw new Exception('Could not find EntityAttributes in Service Provider Metadata');
		// }

		// if (empty($this->parsed['EntityAttributes']['https://www.fed-lab.org/attributes/initsso'])) {
		// 	throw new Exception('Could not find EntityAttribute initSSO in Service Provider Metadata');
		// }
		// $this->initsso = $this->parsed['EntityAttributes']['https://www.fed-lab.org/attributes/initsso'][0];
		
		// if (empty($this->parsed['EntityAttributes']['https://www.fed-lab.org/attributes/attributeurl'])) {
		// 	throw new Exception('Could not find EntityAttribute attributeurl in Service Provider Metadata');
		// }
		// $this->attributeurl = $this->parsed['EntityAttributes']['https://www.fed-lab.org/attributes/attributeurl'][0];

		// if (!empty($this->parsed['EntityAttributes']['https://www.fed-lab.org/attributes/initslo'])) {
		// 	$this->initslo = $this->parsed['EntityAttributes']['https://www.fed-lab.org/attributes/initslo'][0];
		// }

		$acs = SimpleSAML_Utilities::getDefaultEndpoint($this->parsed['AssertionConsumerService'], array(SAML2_Const::BINDING_HTTP_POST));
		$slo = SimpleSAML_Utilities::getDefaultEndpoint($this->parsed['SingleLogoutService'], array(SAML2_Const::BINDING_HTTP_REDIRECT));

		if (empty($acs)) throw new Exception('Could not find AssertionConsumerService in Metadata.');
		if (empty($slo)) throw new Exception('Could not find SingleLogoutService in Metadata.');

	}
	

	public function getSLO() {	
		return SimpleSAML_Utilities::getDefaultEndpoint($this->parsed['SingleLogoutService'],
			array(SAML2_Const::BINDING_HTTP_REDIRECT));
	}
	
	public function getACS() {
		return SimpleSAML_Utilities::getDefaultEndpoint($this->parsed['AssertionConsumerService'],
			array(SAML2_Const::BINDING_HTTP_POST));
	}

}
