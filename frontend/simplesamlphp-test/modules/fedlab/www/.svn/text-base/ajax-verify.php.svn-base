<?php

#$config = SimpleSAML_Configuration::getInstance();
#$statconfig = SimpleSAML_Configuration::getConfig('module_statistics.php');
$session = SimpleSAML_Session::getInstance();
#$metadata = SimpleSAML_Metadata_MetaDataStorageHandler::getMetadataHandler();

SimpleSAML_Logger::debug('ajax-verify.php called');

$result = array();

try {

	$xmldata = $_REQUEST['xmlmetadata'];
	$initurl = $_REQUEST['initurl'];
	$initslo = $_REQUEST['initslo'];

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
		'sspmod_fedlab_BasicSPTest',
		'sspmod_fedlab_AuthnRequestVerify',
		'sspmod_fedlab_ExtendedSPTest',
		'sspmod_fedlab_tests_CheckRequestID',
		'sspmod_fedlab_tests_Metadata',
		'sspmod_fedlab_tests_Replay',
		'sspmod_fedlab_tests_MultipleAttr',	
		'sspmod_fedlab_tests_TrickySignature',
		'sspmod_fedlab_tests_TrickySignature2',
		'sspmod_fedlab_tests_MultipleAssertions',
		'sspmod_fedlab_tests_SLOTest',
		'sspmod_fedlab_tests_IdPInitSLOTest',
		'sspmod_fedlab_tests_IdPInitSLONoCookie',
	);
	$testprogramme = new sspmod_fedlab_TestProgramme($testconfig, $idpmetadata, $metadata, $xmldata, $initurl, $initslo);
	$session->setData('fedlab', 'testprogramme', $testprogramme);	
	

	$test = new sspmod_fedlab_BasicSPTest($idpmetadata, $metadata, $entity, $initurl, $initslo);
	
	error_log('before test');
	
	$test->simpleTest();
	error_log('after test');
	$result = array(
		'status' => 'success',
	);
} catch(Exception $e) {
	error_log('exception');
	$result = array(
		'status' => 'error',
		'message' => $e->getMessage(),
	);	
}
/* 
 * The first two headers prevent the browser from caching the response (a problem with IE and GET requests) 
 * and the third sets the correct MIME type for JSON.
 */
header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type: application/json');

echo json_encode($result);

error_log('json return: ' . json_encode($result));
exit;

