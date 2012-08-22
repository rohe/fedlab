<?php

class sspmod_fedlab_tests_IdPInitSLOTest extends sspmod_fedlab_BasicSPTest {


	
	protected function register() {
		$this->testruns = array(
			'BasicIdPInitSLOTest' 	=> 'Basic IdP-initated Logout Test',
			'idpslo_badnameid' 		=> 'SP MUST NOT accept LogoutRequest when NameID content is wrong',
			'idpslo_badnameidformat' 			=> 'SP MUST NOT accept LogoutRequest when NameID@Format is wrong',
			'idpslo_badnameidspnamequalifier' 	=> 'SP MUST NOT accept LogoutRequest when NameID@SPNameQualifier is wrong',
			'idpslo_badsessionindex' 	=> 'SP MUST NOT logout user when invalid SessionIndex is sent',
			'idpslo_badissuer' 			=> 'SP MUST NOT accept LogoutRequest when Issuer is wrong',
			'idpslo_baddestination' 	=> 'SP MUST NOT accept LogoutRequest when Destination is wrong',
			'idpslo_nosignature' => 'SP MUST NOT accept unsigned LogoutRequest',
		);
	}

	
	public function run($testrun) {


		$this->crawler->reset();
		
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
		
		#error_log('getRedirectURL returns: ['. $redirURL . ']');
		
		
		$this->log($testrun, 'Sending a LogoutRequest');
		$result4 = $this->crawler->getURLraw($redirURL);
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

		
		$this->log($tesrun, 'Check output if user is logged in.');
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
			case 'yyy':

				if ($this->containsName($body)) {
					$this->setResult(sspmod_fedlab_Tester::STATUS_FATAL, $testrun, $testrun, $this->testruns[$testrun], $debugoutput);
				} else {
					$this->setResult(sspmod_fedlab_Tester::STATUS_OK, $testrun, $testrun, $this->testruns[$testrun], $debugoutput);
				}
				break;

			// SHOULD NOT WORK
			case 'BasicIdPInitSLOTest':
				if ($this->containsName($body)) {
					$this->setResult(sspmod_fedlab_Tester::STATUS_ERROR, $testrun, $testrun, $this->testruns[$testrun], $debugoutput);
				} else {
					$this->setResult(sspmod_fedlab_Tester::STATUS_OK, $testrun, $testrun, $this->testruns[$testrun], $debugoutput);
				}
				break;


			// SHOULD WORK FATAL


			case 'idpslo_badnameid':
			case 'idpslo_badnameidformat':
			case 'idpslo_badnameidspnamequalifier':
			case 'idpslo_badsessionindex':
			case 'idpslo_badissuer':
			case 'idpslo_baddestination':
			case 'idpslo_nosignature':
			
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
	
	
	protected function getDebugOutputExtended($testrun, $body, $request, $relaystate, $response, $logoutRequest, $logoutRelayState, $LogoutResponse, $result2) {
		

		$sb = 'NA';
		if(preg_match('|<body.*?>(.*?)</body>|is', $body, $matches)) {
			$sb = strip_tags($matches[1], '<p><span><div><table><tr><td><ul><li><ol><dd><dt><dl><code><pre>');
		}
		
		$sb2 = 'NA';
		if(preg_match('|<body.*?>(.*?)</body>|is', $result2, $matches)) {
			$sb2 = strip_tags($matches[1], '<p><span><div><table><tr><td><ul><li><ol><dd><dt><dl><code><pre>');
		}
		
		
		$html = '<div class="debugoutput">

					<p>AuthnRequest:</p>
					<div><pre class="debugbox"><code>' . htmlspecialchars(SimpleSAML_Utilities::formatXMLString($request)) . '</code></pre></div>

					<p>RelayState:</p>
					<div><pre class="debugbox"><code>' . var_export($relaystate, TRUE) . '</div>

					<p>Response:</p>
					<div><pre class="debugbox"><code>' . htmlspecialchars(SimpleSAML_Utilities::formatXMLString($response)) . '</code></pre></div>


					<p>LogoutRequest:</p>
					<div><pre class="debugbox"><code>' . htmlspecialchars(SimpleSAML_Utilities::formatXMLString($logoutRequest)) . '</code></pre></div>

					<p>LogoutRequest RelayState:</p>
					<div><pre class="debugbox"><code>' . var_export($logoutRelayState, TRUE) . '</div>';
		
		if (isset($LogoutResponse)) {
			$html .= '<p>LogoutResponse:</p>
			<div><pre class="debugbox"><code>' . htmlspecialchars(SimpleSAML_Utilities::formatXMLString($LogoutResponse)) . '</code></pre></div>';	 
		}

		$html .= '
					<p>Resulting output from web page after logout:</p>
					<div class="htmlout">' . $sb . '</div>

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


