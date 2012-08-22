<?php

class sspmod_fedlab_tests_SLOTest extends sspmod_fedlab_BasicSPTest {


	
	protected function register() {
		$this->testruns = array('BasicSLOTest' => 'Basic SP-initated Logout Test');
	}

	
	public function run($testrun) {

		$this->crawler->reset();
		
		// Get authentication request
		$result1 = $this->crawler->getURLraw($this->initurl);
		
		// Fail if no authentication request was made
		if (!isset($result1['Request'])) throw new Exception('Initiation URL did not return a authentication request');		
		$request = $result1['Request'];
		$requestRaw = $result1['RequestRaw'];
		$relaystate = $result1['RelayState'];
		
		// Create Response
		$samlResponse = $this->createResponse($testrun, $request, $relaystate);
		// Sent response and get web page as result
		$result2 = $this->crawler->sendResponse($samlResponse['url'], $samlResponse['Response'], $samlResponse['RelayState']);
		
		// Check output
		
		$this->requireLoginOK($testrun, $result2['body']);

		// SP Initiated Logout...
		$result3 = $this->crawler->getURLraw($this->initslo);
		
		$logoutRequest = $result3['Request'];
		$logoutRequestRaw = $result3['RequestRaw'];
		$logoutRelayState = $result3['RelayState'];
		
				
		
		// Create logout response
		$this->log($testrun, 'Creating LogoutResponse');
		$logoutResponse = $this->createLogoutResponse($testrun, $logoutRequest, $logoutRelayState);
		
		
		$binding = new SAML2_HTTPRedirect();
		$binding->setDestination($logoutResponse['url']);
		$redirURL = $binding->getRedirectURL($logoutResponse['ResponseObj']);

		
		$this->log($testrun, 'Sending LogoutResponse');
		$result4 = $this->crawler->getURLraw($redirURL);

		// Get authentication request
		$this->log($testrun, 'Sending a new request to the initURL endpoint, to verify if user is logged in or not');
		$result5 = $this->crawler->getURLraw($this->initurl);
		
		# getDebugOutput($testrun, $body, $request, $relaystate, $response, $logoutRequest, $logoutRelayState, $LogoutResponse, $result2) {
		$debugoutput = $this->getDebugOutputExtended($testrun, $result4['body'], $requestRaw, $samlResponse['RelayState'], $samlResponse['Response'],
			$logoutRequestRaw, $logoutResponse['RelayState'], $logoutResponse['Response'], $result5['body']);


		$this->expectedResult($testrun, $result5['body'], $debugoutput);

		
#		error_log('url to logout: ' . $this->initslo);
#		echo '<pre>'; print_r($this->flushResults()); exit;

		return $this->flushResults();
	}
	
 	protected function expectedResult($testrun, $body, $debugoutput) {

		if (strstr($body, 'andreas@uninett.no')) {
			$this->setResult(sspmod_fedlab_Tester::STATUS_FATAL, $testrun, $testrun, $this->testruns[$testrun], $debugoutput);
		} else {
			$this->setResult(sspmod_fedlab_Tester::STATUS_OK, $testrun, $testrun, $this->testruns[$testrun], $debugoutput);

		}

	}
	

	protected function createLogoutResponse($testrun, $logoutRequest, $logoutRelayState) {

		$this->log($testrun, 'Creating response with relaystate [' . $logoutRelayState. ']');

		$idpMetadata = SimpleSAML_Configuration::loadFromArray($this->idpmetadata);
		$spMetadata = SimpleSAML_Configuration::loadFromArray($this->metadata);
		
		// Get SingleLogoutService URL
		$consumerURLf = $spMetadata->getDefaultEndpoint('SingleLogoutService', array('urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect'));
		$consumerURL = $consumerURLf['Location'];


		/* Create an send response. */
		$response = sspmod_saml2_Message::buildLogoutResponse($idpMetadata, $spMetadata);
		$response->setRelayState($logoutRequest->getRelayState());
		$response->setInResponseTo($logoutRequest->getId());
		
		
		
		
		$keyArray = SimpleSAML_Utilities::loadPrivateKey($idpMetadata, TRUE);
		$certArray = SimpleSAML_Utilities::loadPublicKey($idpMetadata, FALSE);

		$privateKey = new XMLSecurityKey(XMLSecurityKey::RSA_SHA1, array('type' => 'private'));
		$privateKey->loadKey($keyArray['PEM'], FALSE);

		$response->setSignatureKey($privateKey);

		if ($certArray === NULL) throw new Exception('No certificates found. [1]');
		if (!array_key_exists('PEM', $certArray)) throw new Exception('No certificates found. [2]');

		$response->setCertificates(array($certArray['PEM']));
		
		
		
		
		
		#$this->tweakResponse($testrun, $response);

		$msgStr = $response->toUnsignedXML();
		#$this->tweakResponseDOM($testrun, $msgStr);
		$msgStr = $msgStr->ownerDocument->saveXML($msgStr);

	#	echo '<pre>'; echo(htmlspecialchars($msgStr)); exit;

#		$msgStr = base64_encode($msgStr);
#		$msgStr = htmlspecialchars($msgStr);

		return array('url' => $consumerURL, 'Response' => $msgStr, 'ResponseObj' => $response, 'RelayState' => $logoutRelayState);
	}
	
	
 	protected function requireLoginOK($testrun, $body) {
		if (!strstr($body, 'andreas@uninett.no')) {
			throw new Exception('Login was not OK. Could not find attribute name on page after login.');
		} 
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
				<div><pre class="debugbox"><code>' . var_export($logoutRelayState, TRUE) . '</div>

				<p>LogoutResponse:</p>
				<div><pre class="debugbox"><code>' . htmlspecialchars(SimpleSAML_Utilities::formatXMLString($LogoutResponse)) . '</code></pre></div>


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


