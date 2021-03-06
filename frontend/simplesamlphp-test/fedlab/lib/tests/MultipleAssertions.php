<?php

class sspmod_fedlab_tests_MultipleAssertions extends sspmod_fedlab_BasicSPTest {


	
	protected function register() {
		$this->testruns = array(
			'multipleassertion1' => 'SP SHOULD find attributes in a second Assertion/AttributeStatement, not only in one of them (test 1 of 2 - attributes in first).',
			'multipleassertion2' => 'SP SHOULD find attributes in a second Assertion/AttributeStatement, not only in one of them (test 2 of 2 - attributes in last).',
			'multipleassertion3' => 'SP SHOULD NOT accept attributes in unsigned 2nd assertion. (test 1 of 2)',
			'multipleassertion3b' => 'SP SHOULD NOT accept attributes in unsigned 2nd assertion. (test 2 of 2)',
			'multipleassertion4' => 'SP SHOULD NOT accept authnstatement in unsigned 2nd assertion. (test 1 of 2)',
			'multipleassertion4b' => 'SP SHOULD NOT accept authnstatement in unsigned 2nd assertion. (test 2 of 2)',
		);
	}
	

	function getConfig($testrun) {
		$config = parent::getConfig($testrun);
		
		switch($testrun) {
			case 'multipleassertion3' : 
			case 'multipleassertion4' : 
			case 'multipleassertion3b' : 
			case 'multipleassertion4b' :
				$config['signAssertion'] = TRUE;
				$config['signResponse'] = FALSE;
				break;
		}
		return $config;
	}

	protected function getAssertion($testrun, $request, $attributes = NULL, $sign = FALSE, $includeAuthn = TRUE) {
		

		$idpMetadata = SimpleSAML_Configuration::loadFromArray($this->idpmetadata);
		$spMetadata = SimpleSAML_Configuration::loadFromArray($this->metadata);

		$requestId = $request->getId();
		$consumerURL = $request->getAssertionConsumerServiceURL();

		
		$spentityid = $spMetadata->getString('entityid');
		$idpentityid = $idpMetadata->getString('entityid');

		$consumerURLf = $spMetadata->getDefaultEndpoint('AssertionConsumerService', array('urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST'), $consumerURL);
		$consumerURL = $consumerURLf['Location'];
		
		$config = $this->getConfig($testrun);
		
		$authnInstant = time();
		
		// Build assertion
		$a = new sspmod_fedlab_xml_Assertion();
		if ($sign) {
			$keyArray = SimpleSAML_Utilities::loadPrivateKey($idpMetadata, TRUE);
			$certArray = SimpleSAML_Utilities::loadPublicKey($idpMetadata, FALSE);

			$privateKey = new XMLSecurityKey(XMLSecurityKey::RSA_SHA1, array('type' => 'private'));
			$privateKey->loadKey($keyArray['PEM'], FALSE);

			$a->setSignatureKey($privateKey);

			if ($certArray === NULL) throw new Exception('No certificates found. [1]');
			if (!array_key_exists('PEM', $certArray)) throw new Exception('No certificates found. [2]');

			$a->setCertificates(array($certArray['PEM']));
		}
		$a->includeAuthn = $includeAuthn;
		
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

		$a->setSessionIndex(SimpleSAML_Utilities::generateID());

		/* Add attributes. */

		$attributeNameFormat = $config['attributeNameFormat'];
		$a->setAttributeNameFormat($attributeNameFormat);
		// $attributes = array(
		// 		'urn:oid:1.3.6.1.4.1.5923.1.1.1.6' => array('andreas@uninett.no'),
		// 		'urn:mace:dir:attribute-def:eduPersonPrincipalName' => array('andreas@uninett.no'),
		// 	);
		$a->setAttributes($attributes);

		$nameId = array(
			'Format' => $config['nameIdFormat'],
			'SPNameQualifier' => $spentityid,
			'Value' => SimpleSAML_Utilities::generateID(),
		);
		$a->setNameId($nameId);
		// Assertion builded....
		
		$inresponseto = $this->getInResponseToAssertion($testrun, $requestId);
		if (!empty($inresponseto)) {
			$a->setInResponseTo($inresponseto);
		}
		
		// $assertion->setAuthenticatingAuthority($state['saml:AuthenticatingAuthority']);

		/* Maybe encrypt the assertion. */
		// $a = sspmod_saml2_Message::encryptAssertion($idpMetadata, $spMetadata, $a);
		
		
		
		return $a;
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

		$protocolBinding = SAML2_Const::BINDING_HTTP_POST;

		$config = $this->getConfig($testrun);
		





#		print_r($requestId);



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
		
			
		$realAttr = array(
			'urn:oid:1.3.6.1.4.1.5923.1.1.1.6' => array('andreas@uninett.no'),
			'urn:mace:dir:attribute-def:eduPersonPrincipalName' => array('andreas@uninett.no'),
		);
		$fakeAttr = array('urn:foo' => array('bar'));
		
		switch($testrun) {
			
			/* getAssertion($testrun, $request, $attributes = NULL, $sign = FALSE, $includeAuthn = TRUE) { */
			
			case 'multipleassertion1':
				$response->setAssertions(array(
					$this->getAssertion($testrun, $request, $realAttr, $config['signAssertion'], TRUE),
					$this->getAssertion($testrun, $request, $fakeAttr, $config['signAssertion'], TRUE),
				));
				break;

			case 'multipleassertion2':
				$response->setAssertions(array(
					$this->getAssertion($testrun, $request, $fakeAttr, $config['signAssertion'], TRUE),
					$this->getAssertion($testrun, $request, $realAttr, $config['signAssertion'], TRUE),
				));
				break;

			case 'multipleassertion3':
				$response->setAssertions(array(
					$this->getAssertion($testrun, $request, $fakeAttr, TRUE, TRUE),
					$this->getAssertion($testrun, $request, $realAttr, FALSE, TRUE),
				));
				break;

			case 'multipleassertion3b':
				$response->setAssertions(array(
					$this->getAssertion($testrun, $request, $realAttr, FALSE, TRUE),
					$this->getAssertion($testrun, $request, $fakeAttr, TRUE, TRUE),
				));
				break;
					
			case 'multipleassertion4':
				$response->setAssertions(array(
					$this->getAssertion($testrun, $request, $realAttr, TRUE, FALSE),
					$this->getAssertion($testrun, $request, $fakeAttr, FALSE, TRUE),
				));
				break;

			case 'multipleassertion4b':
				$response->setAssertions(array(
					$this->getAssertion($testrun, $request, $fakeAttr, FALSE, TRUE),
					$this->getAssertion($testrun, $request, $realAttr, TRUE, FALSE),
				));
				break;

				
		}

		$this->tweakResponse($testrun, $response);
		
		$msgStr = $response->toSignedXML();
		$msgStr = $msgStr->ownerDocument->saveXML($msgStr);
		
		return array('url' => $consumerURL, 'Response' => $msgStr, 'RelayState' => $relayState);

	}
	
	

	protected function expectedResult($testrun, $body, $debugoutput) {
		
		switch($testrun) {
			case 'multipleassertion1':
			case 'multipleassertion2':
				if ($this->containsName($body)) {
					$this->setResult(sspmod_fedlab_Tester::STATUS_OK, $testrun, $testrun, $this->testruns[$testrun], $debugoutput);
				} else {
					$this->setResult(sspmod_fedlab_Tester::STATUS_FATAL, $testrun, $testrun, $this->testruns[$testrun], $debugoutput);
				}
				break;

			case 'multipleassertion3':
			case 'multipleassertion3b':
			case 'multipleassertion4':
			case 'multipleassertion4b':
				if ($this->containsName($body)) {
					$this->setResult(sspmod_fedlab_Tester::STATUS_FATAL, $testrun, $testrun, $this->testruns[$testrun], $debugoutput);
				} else {
					$this->setResult(sspmod_fedlab_Tester::STATUS_OK, $testrun, $testrun, $this->testruns[$testrun], $debugoutput);

				}
				break;

		}

	}

}


