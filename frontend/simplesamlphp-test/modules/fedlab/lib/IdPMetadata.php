<?php

class sspmod_fedlab_IdPMetadata {

	private $config;

	public function __construct($config) {
		$this->config = $config;
	}
	
	public function getMetadata() {
		$idpentityid = SimpleSAML_Utilities::getBaseURL() . 'module.php/fedlab/metadata.php';
		$metaArray = array(
			'metadata-set' => 'saml20-idp-remote',
			'entityid' => $idpentityid,
			'SingleSignOnService' => SimpleSAML_Utilities::getBaseURL() . 'module.php/fedlab/SingleSignOnService.php',
			'SingleLogoutService' => SimpleSAML_Utilities::getBaseURL() . 'module.php/fedlab/SingleLogoutService.php',
		#	'certFingerprint' => $certFingerprint,
			'certificate' => 'server.crt',
		);
		$metaArrayConfig = SimpleSAML_Configuration::loadFromArray($metaArray);
		$certInfo = SimpleSAML_Utilities::loadPublicKey($metaArrayConfig, TRUE);
		
		$metaBuilder = new SimpleSAML_Metadata_SAMLBuilder($idpentityid);
		$metaBuilder->addMetadataIdP20($metaArray);
		$metaBuilder->addOrganizationInfo($metaArray);
		$metaBuilder->addContact('technical', array(
			'emailAddress' => $this->config->getString('technicalcontact_email', NULL),
			'name' => $this->config->getString('technicalcontact_name', NULL),
		));
		$metaxml = $metaBuilder->getEntityDescriptorText();
		
		return $metaxml;
	}
	

}
