<?php

class sspmod_fedlab_BasicSPTest extends sspmod_fedlab_Tester {

	protected $crawler;

	function __construct($idpmetadata, $metadata, $metadataXML, $initurl, $initslo) {
		parent::__construct($idpmetadata, $metadata, $metadataXML, $initurl, $initslo);		
		$this->crawler = new sspmod_fedlab_SAMLCrawler();
	}
	
	protected function register() {
		$this->testruns = array('BasicTest' => 'Basic Login test');
	}
	
	public function simpleTest() {
		$result = $this->crawler->getURLraw($this->initurl);

		if (!isset($result['Request'])) {
			#echo '<pre>test:'; print_r($result); exit;
			throw new Exception('Initiation URL did not return a authentication request');
		}
		#exit;
		#echo '<pre>test:'; print_r($result); exit;
		$samlResponse = $this->createResponse('simpletest', $result['Request'], $result['RelayState']);
		$result = $this->crawler->sendResponse($samlResponse['url'], $samlResponse['Response'], $samlResponse['RelayState']);
		
		
		$result2 = $this->crawler->getURLraw($this->initurl);
		
		
		if (strstr($result2['body'], 'andreas@uninett.no')) {
			return TRUE;
		}
		#exit;
		#echo '<pre>test:'; print_r($result); exit;
		#echo $result['body']; exit;
		throw new Exception('Could not find attribute printed on page.');
	}
	
	public function run($testrun) {

		$this->crawler->reset();
		
		// Get authentication request
		$result = $this->crawler->getURLraw($this->initurl);
		
		// Fail if no authentication request was made
		if (!isset($result['Request'])) throw new Exception('Initiation URL did not return a authentication request');		
		$request = $result['Request'];
		$requestRaw = $result['RequestRaw'];
		$relaystate = $result['RelayState'];
		
		// Create Response
		$samlResponse = $this->createResponse($testrun, $request, $relaystate);
		// Sent response and get web page as result
		$result = $this->crawler->sendResponse($samlResponse['url'], $samlResponse['Response'], $samlResponse['RelayState']);
		
		// Check output
		$debugoutput = $this->getDebugOutput($testrun, $result['body'], $requestRaw, $samlResponse['RelayState'], $samlResponse['Response']);
		$this->expectedResult($testrun, $result['body'], $debugoutput);
		
#		echo '<pre>'; print_r($this->flushResults()); exit;

		return $this->flushResults();
	}
	
	protected function containsName($body) {
		if (strstr(htmlspecialchars_decode($body), 'xs:string">andreas@uninett.no')) return FALSE;
#		if (preg_match('|AttributeValue|', $body)) return FALSE;
		if (strstr($body, 'andreas@uninett.no')) return TRUE;
		return FALSE;
	}
	
	protected function getDebugOutput($testrun, $body, $request, $relaystate, $response) {
		

		$sb = 'NA';
		if(preg_match('|<body.*?>(.*?)</body>|is', $body, $matches)) {
			$sb = strip_tags($matches[1], '<p><span><div><table><tr><td><ul><li><ol><dd><dt><dl><code><pre>');
		}
		
		$html = '<div class="debugoutput">

					<p>AuthnRequest:</p>
					<div><pre class="debugbox"><code>' . htmlspecialchars(SimpleSAML_Utilities::formatXMLString($request)) . '</code></pre></div>

					<p>RelayState:</p>
					<div><pre class="debugbox"><code>' . var_export($relaystate, TRUE) . '</div>


					<p>Response:</p>
					<div><pre class="debugbox"><code>' . htmlspecialchars(SimpleSAML_Utilities::formatXMLString($response)) . '</code></pre></div>

					<p>Resulting output from web page:</p>
					<div class="htmlout">' . $sb . '</div>


				</div>
		';
		#echo '<div>' . $html . '</div>'; exit;
		return $html;
	}
	
	function getConfig($testrun) {
		$config = array(
			'dateFormat' => NULL,
			'signAssertion' => FALSE,
			'signResponse' => TRUE,
			'issueInstantMod' => 0,
			'notBeforeSkew' => -30,
			'assertionLifetime' => 300,
			'sessionLifetime' => 8*60*60,
			'SubjectConfirmationDataLifetime' => 300,
			'attributeNameFormat' => 'urn:oasis:names:tc:SAML:2.0:attrname-format:uri',
			'nameIdFormat' => 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
			'extracondition' => NULL,
			'addSubjectConfirmationData' => TRUE,
			'iterateSubjectConfirmationData' => FALSE,
			'includeAuthn' => TRUE,
		);

		return $config;
	}
	
 	protected function expectedResult($testrun, $body, $debugoutput) {

		if (strstr($body, 'andreas@uninett.no')) {
			$this->setResult(sspmod_fedlab_Tester::STATUS_OK, $testrun, $testrun, $this->testruns[$testrun], $debugoutput);
		} else {
			$this->setResult(sspmod_fedlab_Tester::STATUS_ERROR, $testrun, $testrun, $this->testruns[$testrun], $debugoutput);
		}

	}
	
	
	protected function getDestinationAssertion($testrun, $default) {
		return $default;
	}
	
	protected function getDestinationResponse($testrun, $default) {
		return $default;
	}
	
	
	protected function getIssuerAssertion($testrun, $default) {
		return $default;
	}

	protected function getIssuerResponse($testrun, $default) {
		return $default;
	}
	
	protected function getValidAudience($testrun, $default) {
		return $default;
	}
	
	protected function getAuthnContext($testrun, $default) {
		return $default;
	}
	
	protected function getInResponseToAssertion($testrun, $default) {
		return $default;
	}

	protected function getInResponseToResponse($testrun, $default) {
		return $default;
	}

	protected function getRelayState($testrun, $default) {
		return $default;
	}
	
	protected function tweakResponse($testrun, &$response) {
	}

	protected function tweakResponseDOM($testrun, &$response) {
	}

	protected function tweakResponseText($testrun, &$response) {
	}

	protected function getSubjectConfirmationDataRecipients($testrun, $default) {
		return $default;
	}

	protected function getAddresses($testrun, $default) {
		return $default;
	}
	
	protected function createResponse($testrun, $request, $relayState = NULL) {

		$this->log($testrun, 'Creating response with relaystate [' . $relayState. ']');

		$idpMetadata = SimpleSAML_Configuration::loadFromArray($this->idpmetadata);
		$spMetadata = SimpleSAML_Configuration::loadFromArray($this->metadata);

		$requestId = $request->getId();
		$consumerURL = $request->getAssertionConsumerServiceURL();

		
		$spentityid = $spMetadata->getString('entityid');
		$idpentityid = $idpMetadata->getString('entityid');


		$consumerURLf = $spMetadata->getDefaultEndpoint('AssertionConsumerService', array('urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST'), $consumerURL);
		$consumerURL = $consumerURLf['Location'];


#		print_r($spMetadata); exit;
#		print_r($spMetadata->getString('AssertionConsumerServiceURL'))
		
		$protocolBinding = SAML2_Const::BINDING_HTTP_POST;

		$config = $this->getConfig($testrun);
		
		$authnInstant = time();

		// Build assertion
		$a = new sspmod_fedlab_xml_Assertion();
		if ($config['signAssertion']) {
			$keyArray = SimpleSAML_Utilities::loadPrivateKey($idpMetadata, TRUE);
			$certArray = SimpleSAML_Utilities::loadPublicKey($idpMetadata, FALSE);

			$privateKey = new XMLSecurityKey(XMLSecurityKey::RSA_SHA1, array('type' => 'private'));
			$privateKey->loadKey($keyArray['PEM'], FALSE);

			$a->setSignatureKey($privateKey);

			if ($certArray === NULL) throw new Exception('No certificates found. [1]');
			if (!array_key_exists('PEM', $certArray)) throw new Exception('No certificates found. [2]');

			$a->setCertificates(array($certArray['PEM']));
		}
		
		$a->includeAuthn = $config['includeAuthn'];
		$a->addSubjectConfirmationData = $config['addSubjectConfirmationData'];
		$a->iterateSubjectConfirmationData = $config['iterateSubjectConfirmationData'];
		
		$a->subjectAddresses = $this->getAddresses($testrun, array(NULL));
		
		if (isset($config['dateFormat'])) {
			$a->dateformat = $config['dateFormat'];
		}
		
		$a->setIssueInstant(time() + $config['issueInstantMod']);
		
		$a->extracondition = $config['extracondition'];
		$a->setIssuer($this->getIssuerAssertion($testrun, $idpentityid));
		$a->setDestination($this->getDestinationAssertion($testrun, array($consumerURL)));
		$a->setValidAudiences($this->getValidAudience($testrun, array(array($spentityid))));
		
		$a->setNotBefore(time() + $config['notBeforeSkew']);
		$assertionLifetime = $config['assertionLifetime'];
		$a->setNotOnOrAfter(time() + $assertionLifetime);

		$a->notOnOrAfterSubjectConfirmationData = time() + $config['SubjectConfirmationDataLifetime'];

		$a->setAuthnContext($this->getAuthnContext($testrun, SAML2_Const::AC_PASSWORD));

		$a->setAuthnInstant( $authnInstant );

		$sessionLifetime = $config['sessionLifetime'];
		$a->setSessionNotOnOrAfter(time() + $sessionLifetime);


		$sessionIndex = SimpleSAML_Utilities::generateID();
		$a->setSessionIndex($sessionIndex);

		/* Add attributes. */

		$attributeNameFormat = $config['attributeNameFormat'];
		$a->setAttributeNameFormat($attributeNameFormat);
		$attributes = array(
				'urn:oid:1.3.6.1.4.1.5923.1.1.1.6' => array('andreas@uninett.no'),
				'urn:mace:dir:attribute-def:eduPersonPrincipalName' => array('andreas@uninett.no'),
			);
		$a->setAttributes($attributes);

		$nameId = array(
			'Format' => $config['nameIdFormat'],
			'SPNameQualifier' => $spentityid,
			'Value' => SimpleSAML_Utilities::generateID(),
		);
		$a->setNameId($nameId);
		// Assertion builded....

#		print_r($requestId);

		$inresponseto = $this->getInResponseToAssertion($testrun, $requestId);
		if (!empty($inresponseto)) {
			$a->setInResponseTo($inresponseto);
		}
		
		// $assertion->setAuthenticatingAuthority($state['saml:AuthenticatingAuthority']);

		/* Maybe encrypt the assertion. */
		// $a = sspmod_saml2_Message::encryptAssertion($idpMetadata, $spMetadata, $a);
		


		// Build the response
		$signResponse = $config['signResponse'];

		$response = new sspmod_fedlab_xml_Response();

		$response->setIssuer($this->getIssuerResponse($testrun, $idpentityid));

		
		$response->setDestination($this->getDestinationResponse($testrun, $consumerURL));
		

		if ($signResponse) {
			// self::addSign($srcMetadata, $dstMetadata, $r);
			
			$keyArray = SimpleSAML_Utilities::loadPrivateKey($idpMetadata, TRUE);
			$certArray = SimpleSAML_Utilities::loadPublicKey($idpMetadata, FALSE);

			$privateKey = new XMLSecurityKey(XMLSecurityKey::RSA_SHA1, array('type' => 'private'));
			$privateKey->loadKey($keyArray['PEM'], FALSE);

			$response->setSignatureKey($privateKey);

			if ($certArray === NULL) throw new Exception('No certificates found. [1]');
			if (!array_key_exists('PEM', $certArray)) throw new Exception('No certificates found. [2]');

			$response->setCertificates(array($certArray['PEM']));
			
		}

		$inresponseto = $this->getInResponseToResponse($testrun, $requestId);
		if (!empty($inresponseto)) {
			$response->setInResponseTo($inresponseto);
		}


		$response->setRelayState($this->getRelayState($testrun, $relayState));
		$response->setAssertions(array($a));

		$this->tweakResponse($testrun, $response);
		
		$msgStr = $response->toSignedXML();
		$this->tweakResponseDOM($testrun, $msgStr);
		$msgStr = $msgStr->ownerDocument->saveXML($msgStr);
		
		$this->tweakResponseText($testrun, $msgStr);
		
#		echo '<pre>'; echo(htmlspecialchars($msgStr)); exit;
		
#		$msgStr = base64_encode($msgStr);
#		$msgStr = htmlspecialchars($msgStr);
		
		return array('url' => $consumerURL, 'Response' => $msgStr, 
			'NameID' => $nameId, 
			'SessionIndex' => $sessionIndex,
			'RelayState' => $relayState);

	}
	
}


