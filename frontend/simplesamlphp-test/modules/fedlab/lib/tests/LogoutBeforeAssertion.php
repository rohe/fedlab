<?php

class sspmod_fedlab_tests_LogoutBeforeAssertion extends sspmod_fedlab_BasicSPTest {


	
	protected function register() {
		$this->testruns = array(
			'LogoutBeforeAssertion' 	=> 'This test sends IdP initiated LogoutRequest to SP before the authn Response.',
		);
	}

	
	public function run($testrun) {


		$this->crawler->reset();
		

		/* ----- o ------ o ------
		 * Initiate authentication. Send authentication request.
		 * ----- o ------ o ------
		 */

		$this->log($testrun, 'Getting an authentication request');
		$result1 = $this->crawler->getURLraw($this->initurl);
		
		// Fail if no authentication request was made
		$this->expectAuthenticationRequest($result1);

		$request = $result1['Request'];
		$requestRaw = $result1['RequestRaw'];
		$relaystate = $result1['RelayState'];
		
		
		
		
		
		
		/* ----- o ------ o ------
		 * IdP Initiated Logout...
		 * ----- o ------ o ------
		 */
		
		// First create a response...
		$this->log($testrun, 'Creating a Response');
		$samlResponse = $this->createResponse($testrun, $request, $relaystate);
	
		

		// Create logout request
		$this->log($testrun, 'Creating a LogoutRequest');
		$lr = $this->createLogoutRequest($testrun, $samlResponse);

		$this->logoutrequestPrepared($lr);
		
		$binding = new SAML2_HTTPRedirect();
		$binding->setDestination($lr['url']);
		
		$redirURL = $binding->getRedirectURL($lr['RequestObj']);
		
		#error_log('getRedirectURL returns: ['. $redirURL . ']');
		
		
		$this->log($testrun, 'Sending a LogoutRequest');
		$result4 = $this->crawler->getURLraw($redirURL);
		$logoutResponse = $result4['Request'];
		$logoutResponseRaw = $result4['RequestRaw'];
		
		$this->expectLogoutResponse($logoutResponseRaw);
		

		/* ----- o ------ o ------
		 * Create Response with Assertion...
		 * ----- o ------ o ------
		 */

		// Sent response and get web page as result
		$this->responsePrepared($samlResponse);
		$result2 = $this->crawler->sendResponse($samlResponse['url'], $samlResponse['Response'], $samlResponse['RelayState']);
		
		

		// Get authentication request
		$this->log($testrun, 'Do a new GET to the first page to check if the user is logged in.');
		$result5 = $this->crawler->getURLraw($this->attributeurl);
		
		$this->log($testrun, 'Prepare debug output');
		# getDebugOutput($testrun, $body, $request, $relaystate, $response, $logoutRequest, $logoutRelayState, $LogoutResponse, $result2) {
			
			
		/**
		 * body		Web page shown after logout.
		 * request	The authentication request
		 * relaystate The relaystate of the authentication request
		 * response	The Response
		 * logoutRequest	The logout request
		 * logoutRelayState 
		 * result2	The web site shown at attribute page accessing after flow.
		 */
		// $debugoutput = $this->getDebugOutputExtended($testrun, 
		// 	$requestRaw, 
		// 	isset($samlResponse['RelayState']) ? $samlResponse['RelayState'] : NULL, 
		// 	isset($samlResponse['Response']) ? $samlResponse['Response'] : NULL,
		// 	isset($lr['Request']) ? $lr['Request'] : NULL, 
		// 	isset($result4['RelayState']) ? $result4['RelayState'] : NULL, 
		// 	isset($logoutResponseRaw) ? $logoutResponseRaw : NULL, 
		// 	$result5['body']);

		$this->log($testrun, 'Check output if user is logged in.');
		$this->expectedResult($testrun, $result5['body'], null);
		
#		error_log('url to logout: ' . $this->initslo);
#		echo '<pre>'; print_r($this->flushResults()); exit;

		return $this->flushResults();
	}
	
	
	
	
 	protected function expectedResult($testrun, $body, $debugoutput) {

		if ($this->containsName($body)) {
			error_log('Contains name: ' . $body);
		} else {
			error_log('NOT Contains name: ' . $body);
		}

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
			case 'LogoutBeforeAssertion':



				if ($this->containsName($body)) {
					$this->setResult(sspmod_fedlab_Tester::STATUS_FATAL, $testrun, $testrun, $this->testruns[$testrun], $debugoutput);
				} else {
					$this->setResult(sspmod_fedlab_Tester::STATUS_OK, $testrun, $testrun, $this->testruns[$testrun], $debugoutput);
				}
				break;

			// SHOULD NOT WORK
			case 'xxx':
				if ($this->containsName($body)) {
					$this->setResult(sspmod_fedlab_Tester::STATUS_ERROR, $testrun, $testrun, $this->testruns[$testrun], $debugoutput);
				} else {
					$this->setResult(sspmod_fedlab_Tester::STATUS_OK, $testrun, $testrun, $this->testruns[$testrun], $debugoutput);
				}
				break;


			// SHOULD WORK FATAL


			case 'xx':

			
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
	
	protected function getNameID($testrun, $nameid) {
		switch($testrun) {
			case 'idpslo_badnameid': 
				$nameid['Value'] = 'urn:foo:invalid:NameID';
				break;
			case 'idpslo_badnameidformat':
				$nameid['Format'] = 'urn:foo:invalid:NameID';
				break;
			case 'idpslo_badnameidspnamequalifier':
				$nameid['SPNameQualifier'] = 'urn:foo:invalid:NameID';
				break;

		}
		return $nameid;
	}
	
	protected function getSessionIndex($testrun, $sessionindex) {
		switch($testrun) {
			case 'idpslo_badsessionindex':
				$sessionindex = '_XXX';
				break;
		}
		return $sessionindex;
	}
	

	protected function createLogoutRequest($testrun, $samlResponse) {

		$idpMetadata = SimpleSAML_Configuration::loadFromArray($this->idpmetadata);
		$spMetadata = SimpleSAML_Configuration::loadFromArray($this->metadata);
		
		// Get SingleLogoutService URL
		$consumerURLf = $spMetadata->getDefaultEndpoint('SingleLogoutService', array('urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect'));
		$consumerURL = $consumerURLf['Location'];

		
		$lr = sspmod_fedlab_xml_Message::buildLogoutRequest($idpMetadata, $spMetadata);
		// $lr->setSessionIndex($association['saml:SessionIndex']);
		// $lr->setNameId($association['saml:NameID']);
		$lr->setSessionIndex($this->getSessionIndex($testrun, $samlResponse['SessionIndex']));
		$lr->setNameId($this->getNameID($testrun, $samlResponse['NameID']));
		
		
		if ($this->signRequest($testrun)) {
			$keyArray = SimpleSAML_Utilities::loadPrivateKey($idpMetadata, TRUE);
			$certArray = SimpleSAML_Utilities::loadPublicKey($idpMetadata, FALSE);

			$privateKey = new XMLSecurityKey(XMLSecurityKey::RSA_SHA1, array('type' => 'private'));
			$privateKey->loadKey($keyArray['PEM'], FALSE);

			$lr->setSignatureKey($privateKey);

			if ($certArray === NULL) throw new Exception('No certificates found. [1]');
			if (!array_key_exists('PEM', $certArray)) throw new Exception('No certificates found. [2]');

			$lr->setCertificates(array($certArray['PEM']));
		}
		

		
		

		
		$this->tweakLogoutRequest($testrun, $lr);

		$msgStr = $lr->toSignedXML();
		$this->tweakLogoutRequestDOM($testrun, $msgStr);
		$msgStr = $msgStr->ownerDocument->saveXML($msgStr);

	#	echo '<pre>'; echo(htmlspecialchars($msgStr)); exit;

#		$msgStr = base64_encode($msgStr);
#		$msgStr = htmlspecialchars($msgStr);

		return array('url' => $consumerURL, 'Request' => $msgStr, 'RequestObj' => $lr);
	}
	
	
	

	protected function tweakLogoutRequest($testrun, &$logoutRequest) {
		switch($testrun) {
			case 'idpslo_badissuer':
				$logoutRequest->setIssuer('urn:foo');
				break;
			
			case 'idpslo_baddestination':
				$logoutRequest->setDestination('urn:foo');
				break;
		}
	}
	
	
	
	protected function tweakLogoutRequestDOM($testrun, &$logoutRequest) {
		
	}
	
	
	
 	protected function requireLoginOK($testrun, $body) {
		if (!strstr($body, 'andreas@uninett.no')) {
			throw new Exception('Login was not OK. Could not find attribute name on page after login.');
		} 
	}

	protected function signRequest($testrun) {
		if ($testrun == 'idpslo_nosignature') return FALSE;
		return TRUE;
	}
	
	/**
	 * body		Web page shown after logout.
	 * request	The authentication request
	 * relaystate The relaystate of the authentication request
	 * response	The Response
	 * logoutRequest	The logout request
	 * logoutRelayState 
	 * result2	The web site shown at attribute page accessing after flow.
	 */
	protected function getDebugOutputExtended($testrun, $request, $relaystate, $response, $logoutRequest, $logoutRelayState, $LogoutResponse, $result2) {
		


		$sb2 = 'NA';
		if(preg_match('|<body.*?>(.*?)</body>|is', $result2, $matches)) {
			$sb2 = strip_tags($matches[1], '<p><span><div><table><tr><td><ul><li><ol><dd><dt><dl><code><pre>');
		}
		
		
		$html = '<div class="debugoutput">

					<p>AuthnRequest:</p>
					<div><pre class="debugbox"><code>' . htmlspecialchars(SimpleSAML_Utilities::formatXMLString($request)) . '</code></pre></div>

					<p>RelayState:</p>
					<div><pre class="debugbox"><code>' . htmlspecialchars(var_export($relaystate, TRUE)) . '</code></div>

					<p>LogoutRequest:</p>
					<div><pre class="debugbox"><code>' . htmlspecialchars(SimpleSAML_Utilities::formatXMLString($logoutRequest)) . '</code></pre></div>

					<p>LogoutRequest RelayState:</p>
					<div><pre class="debugbox"><code>' . var_export($logoutRelayState, TRUE) . '</div>
';

if (isset($LogoutResponse)) {
	$html .= '<p>LogoutResponse:</p>
	<div><pre class="debugbox"><code>' . htmlspecialchars(SimpleSAML_Utilities::formatXMLString($LogoutResponse)) . '</code></pre></div>';	 
}


		$html .= '
					<p>Response:</p>
					<div><pre class="debugbox"><code>' . htmlspecialchars(SimpleSAML_Utilities::formatXMLString($response)) . '</code></pre></div>


					<p>Resulting output from web page after trying to access the attribute viewer again after being logged out (should not be logged in then):</p>
					<div class="htmlout">' . $sb2 . '</div>

				</div>
		';
		#echo '<div>' . $html . '</div>'; exit;
		return $html;
	}
	
	function getConfig($testrun) {
		$config = parent::getConfig($testrun);

		return $config;
	}
	
	
}


