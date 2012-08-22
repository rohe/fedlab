<?php

class sspmod_fedlab_tests_IdPInitSLONoCookie extends sspmod_fedlab_tests_IdPInitSLOTest {

	protected $crawler2;
	
	function __construct($idpmetadata, $metadata, $metadataXML, $initurl, $initslo) {
		parent::__construct($idpmetadata, $metadata, $metadataXML, $initurl, $initslo);		
		$this->crawler2 = new sspmod_fedlab_SAMLCrawler();
	}
	
	protected function register() {
		$this->testruns = array(
			'idpslo_nocookie' => 'SP MUST accept LogoutRequest with sessionindex in a separate session, not relying on the session-cookie.',
			'idpslo_nosessionindex' => 'SP MUST accept an LogoutRequest with no sessionindex (sent in separate session, no session-cookies)',
			'idpslo_sessionindexTwo1' => 'SP MUST accept an LogoutRequest with two sesionindexes (first valid) (sent in separate session, no session-cookies)',
			'idpslo_sessionindexTwo2' => 'SP MUST accept an LogoutRequest with two sesionindexes (second valid) (sent in separate session, no session-cookies)',
		);
	}

	protected function getSessionIndex($testrun, $sessionindex) {
		switch($testrun) {
			case 'idpslo_nosessionindex':
				$sessionindex = NULL;
				break;
			case 'idpslo_sessionindexTwo1':
				$sessionindex = array($sessionindex, 'urn:foo:badsessionindex');
				break;
			case 'idpslo_sessionindexTwo2':
				$sessionindex = array('urn:foo:badsessionindex', $sessionindex);
				break;
		}
		return $sessionindex;
	}

	
	public function run($testrun) {

		$this->crawler->reset();
		$this->crawler2->reset();
		
		// Get authentication request
		$this->log($testrun, 'Getting an authentication request');
		$result1 = $this->crawler->getURLraw($this->initurl);
		
		// Fail if no authentication request was made
		if (!isset($result1['Request'])) throw new Exception('Initiation URL did not return a authentication request');		
		$request = $result1['Request'];
		$requestRaw = $result1['RequestRaw'];
		$relaystate = $result1['RelayState'];
		
		// Create Response
		$this->log($testrun, 'Creating a Response');
		$samlResponse = $this->createResponse($testrun, $request, $relaystate);
		// Sent response and get web page as result
		$result2 = $this->crawler->sendResponse($samlResponse['url'], $samlResponse['Response'], $samlResponse['RelayState']);
		
		
		// error_log('Getting an authentication request');
		// $result2b = $this->crawler->getURLraw($this->initurl);
		
		// Check output
		$this->log($testrun, 'Verifying that the user is logged in');
		$this->requireLoginOK($testrun, $result2['body']);




		// IdP Initiated Logout...

		// Create logout request
		$this->log($testrun, 'Creating a LogoutRequest');
		$lr = $this->createLogoutRequest($testrun, $samlResponse);
		
		$binding = new SAML2_HTTPRedirect();
		$binding->setDestination($lr['url']);
		
		$redirURL = $binding->getRedirectURL($lr['RequestObj']);
		
		$this->log($testrun, 'Sending a LogoutRequest');
		$result4 = $this->crawler2->getURLraw($redirURL);
		$logoutResponse = $result4['Request'];
		$logoutResponseRaw = $result4['RequestRaw'];

		// Get authentication request
		$this->log($testrun, 'Do a new GET to the first page to check if the user is logged in.');
		$result5 = $this->crawler->getURLraw($this->initurl);
		
		$this->log($testrun, 'Prepare debug output');
		# getDebugOutput($testrun, $body, $request, $relaystate, $response, $logoutRequest, $logoutRelayState, $LogoutResponse, $result2) {
			
		// error_log($testrun);
		// error_log($result5['body']);
		// error_log($requestRaw);
		// error_log($samlResponse['RelayState']);
		// error_log($samlResponse['Response']);
		// error_log($lr['Request']);
		// error_log($result4['RelayState']);
		// error_log('logout response' . var_export($logoutResponseRaw, TRUE));
		$debugoutput = $this->getDebugOutputExtended($testrun, $result5['body'], $requestRaw, 
			isset($samlResponse['RelayState']) ? $samlResponse['RelayState'] : NULL, 
			isset($samlResponse['Response']) ? $samlResponse['Response'] : NULL,
			isset($lr['Request']) ? $lr['Request'] : NULL, 
			isset($result4['RelayState']) ? $result4['RelayState'] : NULL, 
			isset($logoutResponseRaw) ? $logoutResponseRaw : NULL, 
			$result5['body']);

		
		$this->log($testrun, 'Check output if user is logged in.');
		$this->expectedResult($testrun, $result5['body'], $debugoutput);

		
#		error_log('url to logout: ' . $this->initslo);
#		echo '<pre>'; print_r($this->flushResults()); exit;

		return $this->flushResults();
	}
	
 	protected function expectedResult($testrun, $body, $debugoutput) {
			

		switch($testrun) {
			// Info:
			case 'xxx':
				if ($this->containsName($body)) {
					$this->setResult(sspmod_fedlab_Tester::STATUS_INFO, $testrun, $testrun, $this->testruns[$testrun], 'Test succeeded' . $debugoutput);
				} else {
					$this->setResult(sspmod_fedlab_Tester::STATUS_INFO, $testrun, $testrun, $this->testruns[$testrun], 'Test did not succeed' . $debugoutput);
				}
				break;

			// SHOULD NOT WORK - FATAL
			case 'idpslo_nocookie':
			case 'idpslo_nosessionindex':
			case 'idpslo_sessionindexTwo1':
			case 'idpslo_sessionindexTwo2':

				if ($this->containsName($body)) {
					$this->setResult(sspmod_fedlab_Tester::STATUS_FATAL, $testrun, $testrun, $this->testruns[$testrun], $debugoutput);
				} else {
					$this->setResult(sspmod_fedlab_Tester::STATUS_OK, $testrun, $testrun, $this->testruns[$testrun], $debugoutput);
				}
				break;

			// SHOULD NOT WORK
			case 'eee':
				if ($this->containsName($body)) {
					$this->setResult(sspmod_fedlab_Tester::STATUS_ERROR, $testrun, $testrun, $this->testruns[$testrun], $debugoutput);
				} else {
					$this->setResult(sspmod_fedlab_Tester::STATUS_OK, $testrun, $testrun, $this->testruns[$testrun], $debugoutput);
				}
				break;


			// SHOULD WORK FATAL


			case 'sddd':
			
				if ($this->containsName($body)) {
					$this->setResult(sspmod_fedlab_Tester::STATUS_OK, $testrun, $testrun, $this->testruns[$testrun], $debugoutput);
				} else {
					$this->setResult(sspmod_fedlab_Tester::STATUS_FATAL, $testrun, $testrun, $this->testruns[$testrun], $debugoutput);
				}
				break;


			// SHOULD WORK
			case 'aaa':

				if ($this->containsName($body)) {
					$this->setResult(sspmod_fedlab_Tester::STATUS_OK, $testrun, $testrun, $this->testruns[$testrun], $debugoutput);
				} else {
					$this->setResult(sspmod_fedlab_Tester::STATUS_ERROR, $testrun, $testrun, $this->testruns[$testrun], $debugoutput);
				}
				break;

			default:
				$this->setResult(sspmod_fedlab_Tester::STATUS_FATAL, $testrun, $testrun, $this->testruns[$testrun], 'Undefined expected outcome from test');
		}




	}
	
	
	
	
}


