<?php

$session = SimpleSAML_Session::getInstance();
SimpleSAML_Logger::debug('IdP Endpoint accessed....');

$config = SimpleSAML_Configuration::getInstance();
$metadata = SimpleSAML_Metadata_MetaDataStorageHandler::getMetadataHandler();


$samlredir = new SAML2_HTTPRedirect();
$request = $samlredir->receive();


$entityid = $request->getIssuer();

error_log('Entity ID was [' . $entityid . ']');


$idpm = new sspmod_fedlab_IdPMetadata($config);
$spm = new sspmod_fedlab_SPMetadata($entityid, TRUE);

#$spm->debug();



$idpentityid = SimpleSAML_Utilities::getBaseURL() . 'module.php/fedlab/metadata.php';
$idpmetadata = array(
	'entityid' => $idpentityid,
	'certificate' => 'server.crt',
	'privatekey' => 'server.pem',
);


	
	$test = new sspmod_fedlab_BasicSPTest($idpmetadata, $spm->parsed, $entity, $initurl, $initslo, $attributeurl);
	
	$crawler = new sspmod_fedlab_SAMLCrawler();	
	$requestRaw = sspmod_fedlab_SAMLCrawler::getHTTPRedirectMessage();
	
	
	echo '<h2>Request</h2>' . "\n";
	echo '<textarea style="width: 90%; height: 300px">';
	echo htmlspecialchars(SimpleSAML_Utilities::formatXMLString($requestRaw));
	echo '</textarea>';
#	print_r($request); 
		
	$relaystate = NULL;
	if (isset($_REQUEST['RelayState'])) $relaystate = $_REQUEST['RelayState'];
	
	
	# createResponse($testrun, $request, $relayState = NULL) {
	$samlResponse = $test->createResponseP('idp', $request, $relaystate);


	echo '<h2>Prepared Response</h2>' . "\n";
	echo '<textarea style="width: 90%; height: 300px">';
	echo htmlspecialchars(SimpleSAML_Utilities::formatXMLString($samlResponse['Response']));
	echo '</textarea>';
	
	echo '<pre>'; print_r($samlResponse); echo '</pre>';

	echo '<form method="post" action="' . $samlResponse['url'] . '">';
	echo ' <input type="hidden" name="SAMLResponse" value="' . base64_encode($samlResponse['Response']) . '" />';
	if (!empty($relaystate)) {
		echo ' <input type="hidden" name="RelayState" value="' . htmlspecialchars($relaystate) . '" />';
	}
	
	echo ' <input type="submit" name="submit" value="Send SAML Response" />';
	echo '</form>';

	exit;

	
	$result = $this->crawler->sendResponse($samlResponse['url'], $samlResponse['Response'], $samlResponse['RelayState']);


	$result2 = $this->crawler->getURLraw($this->initurl);


	if (strstr($result2['body'], 'andreas@uninett.no')) {
		return TRUE;
	}
	#exit;
	#echo '<pre>test:'; print_r($result); exit;
	#echo $result['body']; exit;
	throw new Exception('Could not find attribute printed on page.');




	















