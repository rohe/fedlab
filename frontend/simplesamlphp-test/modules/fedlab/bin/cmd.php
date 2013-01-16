#!/usr/bin/env php
<?php

/* This is the base directory of the simpleSAMLphp installation. */
$baseDir = dirname(dirname(dirname(dirname(__FILE__))));


/* Add library autoloader. */
require_once($baseDir . '/lib/_autoload.php');

if (count($argv) < 2) {
	echo "Wrong number of parameters. Run:   " . $argv[0] . "\n"; 
	exit(2);
}

// Needed in order to make session_start to be called before output is printed.
//$session = SimpleSAML_Session::getInstance();
$config = SimpleSAML_Configuration::getConfig('config.php');

$_SERVER['HTTP_HOST'] = 'fed-lab.org';
$_SERVER['SERVER_PORT'] = 80;

$action = $argv[1];

$raw = file_get_contents("php://stdin", "r");
$inputmeta = json_decode($raw, TRUE);

// echo "input: ";
// print_r($inputmeta);

try {
	

	if ($action === 'showList') {
		$initsso = 'http://';
		$initslo = 'http://';
		$attributeurl = 'http://';
		$inputmeta = array(
			'metadata' => '<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
                     entityID="https://skjak.uninett.no/simplesaml/module.php/saml/sp/metadata.php/fedlab-test-sp"
                     >
    <md:SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:1.1:protocol urn:oasis:names:tc:SAML:2.0:protocol">
        <md:AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
                                     Location="https://skjak.uninett.no/simplesaml/module.php/saml/sp/saml2-acs.php/fedlab-test-sp"
                                     index="0"
                                     />
        <md:AssertionConsumerService Binding="urn:oasis:names:tc:SAML:1.0:profiles:browser-post"
                                     Location="https://skjak.uninett.no/simplesaml/module.php/saml/sp/saml1-acs.php/fedlab-test-sp"
                                     index="1"
                                     />
        <md:AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Artifact"
                                     Location="https://skjak.uninett.no/simplesaml/module.php/saml/sp/saml2-acs.php/fedlab-test-sp"
                                     index="2"
                                     />
        <md:AssertionConsumerService Binding="urn:oasis:names:tc:SAML:1.0:profiles:artifact-01"
                                     Location="https://skjak.uninett.no/simplesaml/module.php/saml/sp/saml1-acs.php/fedlab-test-sp/artifact"
                                     index="3"
                                     />
        <md:SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
                                Location="https://skjak.uninett.no/simplesaml/module.php/saml/sp/saml2-logout.php/fedlab-test-sp"
                                />
        <md:AttributeConsumingService index="0">
            <md:RequestedAttribute Name="urn:oid:1.3.6.1.4.1.5923.1.1.1.6" />
            <md:ServiceName xml:lang="en">SimpleSAMLphp (Skjak, recent version)</md:ServiceName>
            <md:RequestedAttribute Name="urn:oid:1.3.6.1.4.1.5923.1.1.1.6" />
        </md:AttributeConsumingService>
    </md:SPSSODescriptor>
</md:EntityDescriptor>'
		);
	} else {
		$initsso = $inputmeta['initsso'];
		$initslo = $inputmeta['initslo'];
		$attributeurl = $inputmeta['attributeurl'];
	}


	// error_log("------- ------ ------ ----");
	// error_log("Init SSO  URL " . $initsso);
	// error_log("Init SLO  URL " . $initslo);
	// error_log("Attribute URL " . $attributeurl);
	// error_log("------- ------ ------ ----");

	$idpm = new sspmod_fedlab_IdPMetadata($config);
	error_log("Metadata to parse: " . $inputmeta['metadata']);
	$spm = new sspmod_fedlab_SPMetadata($inputmeta['metadata'], $initsso, $initslo, $attributeurl);


	if (empty($initsso)) throw new Exception('InitSSO parameter not found in metadata (EntityAttribute extension)');
	if (empty($attributeurl)) {
		$attributeurl = $initsso;
	}

	$idpentityid = 'https://fed-lab.org/simplesaml-test/module.php/fedlab/metadata.php';
	// $idpentityid = SimpleSAML_Utilities::getBaseURL() . 'module.php/fedlab/metadata.php';
	
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
		// 'sspmod_fedlab_tests_Metadata',
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

	$flows = array();
	$testers = array();
	foreach($testconfig AS $ct) {
		$newtester = new $ct($idpmetadata, $spm->parsed, $inputmeta['metadata'], $initsso, $initslo, $attributeurl);
		$testers[] = $newtester;

		$newflows = $newtester->getFlows();
		foreach($newflows AS $nf => $name) {
			$flows[] = array(
				'id' => $ct . '__' . $nf,
				'name' => $name
			);
		}
	}
} catch (Exception $e) {
	echo 'Error: ' . $e->getMessage() . "\n";
	exit(1);
}



if ($action === 'check') {
	
	try {
		$testprogramme = new sspmod_fedlab_TestProgramme($testconfig, $idpmetadata, $spm->parsed, $spm->xmlmetadata, $initsso, $initslo, $attributeurl);
		$test = new sspmod_fedlab_BasicSPTest($idpmetadata, $spm->parsed, $inputmeta['metadata'], $initsso, $initslo, $attributeurl);

		$res = $test->simpleTest();
		$result = array(
			'status' => 0,
			'id' => 'verify',
		);

	} catch (Exception $e) {
		$result = array(
			'id' => 'verify',
			'status' => 4,
			'message' => $e->getMessage()
		);
	}
	
	echo json_encode($result, TRUE);
	exit(0);
	


} else if ($action === 'runTest') {
	if (empty($argv[2])) throw new Exception('Missing parameter name of test');	
	$test = $argv[2];
	
	$splitted = explode('__', $test);
	$testername = $splitted[0];
	$flowname = $splitted[1];
	

	try {
		$testmachine = new $testername($idpmetadata, $spm->parsed, $inputmeta['metadata'], $initsso, $initslo, $attributeurl);

		$result = $testmachine->run($flowname);
		

		$status = 1;

		$resultarray = array();
		foreach($result AS $k => $tv) {
			if (isset($tv['descr'])) {
				$tv['name'] = $tv['descr']; unset($tv['descr']);
			}
			if (isset($tv['result'])) {
				$tv['message'] = $tv['result']; unset($tv['result']);
			}
			unset($tv['testrun']); unset($tv['type']);

			if ($status === 1) {
				if ($tv['status'] === 2) $status = 2;
				if ($tv['status'] === 3) $status = 3;
				if ($tv['status'] === 4) $status = 4;
			}
			if ($status === 2) {
				if ($tv['status'] === 3) $status = 3;
				if ($tv['status'] === 4) $status = 4;
			}
			if ($status === 3) {
				if ($tv['status'] === 4) $status = 4;
			}

			$resultarray[] = $tv;
		}
		
		$result = array(
			'status'=> $status,
			'id'=> $test,
			'tests'=> $resultarray,
		);

	} catch (Exception $e) {
		$result = array(
			'status' => 4,
			'id'=> $test,
			'tests' => array(array(
				'id' => 'generalerror',
				'name' => $e->getMessage(),
				'status' => 4,
			)),
		);
	}
	
	echo json_encode($result, TRUE);
	exit(0);
	
	
} else if ($action === 'showList') {
	
	echo json_encode($flows, true); 
	exit(0);
	
} 
error_log("No valid arguments provider to cmd.php command.");
exit(1);



