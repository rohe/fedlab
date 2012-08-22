<?php

$config = SimpleSAML_Configuration::getInstance();
#$statconfig = SimpleSAML_Configuration::getConfig('module_statistics.php');
$session = SimpleSAML_Session::getInstance();
$metadata = SimpleSAML_Metadata_MetaDataStorageHandler::getMetadataHandler();



$xmldata = $session->getData('fedlab', 'xmlmetadata');
$initurl = $session->getData('fedlab', 'initurl');
$initslo = $session->getData('fedlab', 'initslo');

SimpleSAML_Utilities::validateXMLDocument($xmldata, 'saml-meta');
$entities = SimpleSAML_Metadata_SAMLParser::parseDescriptorsString($xmldata);
$entity = array_pop($entities);
$metadata =  $entity->getMetadata20SP();

/* Trim metadata endpoint arrays. */
$metadata['AssertionConsumerService'] = array(SimpleSAML_Utilities::getDefaultEndpoint($metadata['AssertionConsumerService'], array(SAML2_Const::BINDING_HTTP_POST)));
$metadata['SingleLogoutService'] = array(SimpleSAML_Utilities::getDefaultEndpoint($metadata['SingleLogoutService'], array(SAML2_Const::BINDING_HTTP_REDIRECT)));

$idpentityid = SimpleSAML_Utilities::getBaseURL() . 'module.php/fedlab';

$idpmetadata = array(
	'entityid' => $idpentityid,
	'certificate' => 'server.crt',
	'privatekey' => 'server.pem',
);

$testconfig = array(
	// 'sspmod_fedlab_BasicSPTest',
	// 'sspmod_fedlab_AuthnRequestVerify',
	// 'sspmod_fedlab_ExtendedSPTest',
	// 'sspmod_fedlab_tests_Metadata',
	// 'sspmod_fedlab_tests_Replay',
	// 'sspmod_fedlab_tests_MultipleAttr',	
	// 'sspmod_fedlab_tests_TrickySignature',
	// 'sspmod_fedlab_tests_TrickySignature2',
	// 'sspmod_fedlab_tests_MultipleAssertions',
	'sspmod_fedlab_tests_SLOTest',
);
$testprogramme = new sspmod_fedlab_TestProgramme($testconfig, $idpmetadata, $metadata, $xmldata, $initurl, $initslo);
$session->setData('fedlab', 'testprogramme', $testprogramme);

do {
	$result = $testprogramme->runNext();

	echo '<pre>';
	print_r($result);
	
} while (!is_null($result));


