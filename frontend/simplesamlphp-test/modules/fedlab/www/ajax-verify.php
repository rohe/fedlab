<?php
ini_set('display_errors', 0);

$session = SimpleSAML_Session::getInstance();
SimpleSAML_Logger::debug('ajax-verify.php called');

$result = array();

error_log('Entity ID was [' . $_REQUEST['entityid'] . ']');



try {

	$idpm = new sspmod_fedlab_IdPMetadata($config);
	$spm = new sspmod_fedlab_SPMetadata($_REQUEST['entityid']);
	
	$spm->debug();
	
	$initurl = $spm->initsso;
	$initslo = $spm->initslo;
	$attributeurl = $spm->attributeurl;
	if (empty($initurl)) throw new Exception('InitSSO parameter not found in metadata (EntityAttribute extension)');
	if (empty($attributeurl)) {
		$attributeurl = $initurl;
	}

	$idpentityid = SimpleSAML_Utilities::getBaseURL() . 'module.php/fedlab/metadata.php';
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
		'sspmod_fedlab_tests_SessionFixtation',
 		'sspmod_fedlab_tests_LogoutBeforeAssertion',
	);
	$testprogramme = new sspmod_fedlab_TestProgramme($testconfig, $idpmetadata, $spm->parsed, $spm->xmlmetadata, $initurl, $initslo, $attributeurl);
	$session->setData('fedlab', 'testprogramme', $testprogramme);	
	
	$test = new sspmod_fedlab_BasicSPTest($idpmetadata, $spm->parsed, $entity, $initurl, $initslo, $attributeurl);
	
	error_log('before test2');
	
	$test->simpleTest();
	error_log('after test');
	$result = array(
		'status' => 'success',
	);
} catch(Exception $e) {
	$err = $e->getTraceAsString();
	foreach(split("\n", $err) AS $el) {
		error_log('exception: ' .  $el);
	}
	
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

