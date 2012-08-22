<?php

class sspmod_fedlab_tests_TrickySignature2 extends sspmod_fedlab_BasicSPTest {


	
	protected function register() {
		$this->testruns = array(
			'trickysignature2' => 'SP SHOULD NOT accept an signed assertion, where the signature is referring to another assertion.',
		);
	}
	

	function getConfig($testrun) {
		$config = parent::getConfig($testrun);
		
		$config['signAssertion'] = TRUE;
		$config['signResponse'] = FALSE;
		
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
		


		$response->setAssertions(array(
			$this->getAssertion($testrun, $request, $realAttr, $config['signAssertion'], TRUE),
			$this->getAssertion($testrun, $request, $fakeAttr, $config['signAssertion'], TRUE),
		));


		$this->tweakResponse($testrun, $response);
		
		$msgStr = $response->toSignedXML();
		$this->tweakResponseDOM($testrun, $msgStr);
		$msgStr = $msgStr->ownerDocument->saveXML($msgStr);
		
		return array('url' => $consumerURL, 'Response' => $msgStr, 'RelayState' => $relayState);

	}
	
	protected function tweakResponseDOM($testrun, &$response) {
		// return;
		
		$xpath = new DOMXpath($response->ownerDocument);
		$xpath->registerNamespace('saml2',  'urn:oasis:names:tc:SAML:2.0:assertion');
		$xpath->registerNamespace('saml2p',  'urn:oasis:names:tc:SAML:2.0:protocol');
		$xpath->registerNamespace('md',  'urn:oasis:names:tc:SAML:2.0:metadata');
		$xpath->registerNamespace('ds', 'http://www.w3.org/2000/09/xmldsig#');

		$firstAssertionQ = $xpath->query("/saml2p:Response/saml2:Assertion[1]");
		$firstAssertion = $firstAssertionQ->item(0);

		
		$firstSignatureQ = $xpath->query("/saml2p:Response/saml2:Assertion[1]/ds:Signature");
		$firstSignature = $firstSignatureQ->item(0);
		
		$secondSignatureQ = $xpath->query("/saml2p:Response/saml2:Assertion[2]/ds:Signature");
		$secondSignature = $secondSignatureQ->item(0);		
		
		$this->log($testrun, 'before query: ');
		
		$firstAssertion->replaceChild($secondSignature->cloneNode(TRUE), $firstSignature);
		
		$this->log($testrun, 'found elements: ');
		
		
	}	

	protected function expectedResult($testrun, $body, $debugoutput) {
		
		if ($this->containsName($body)) {
			$this->setResult(sspmod_fedlab_Tester::STATUS_FATAL, $testrun, $testrun, $this->testruns[$testrun], $debugoutput);
		} else {
			$this->setResult(sspmod_fedlab_Tester::STATUS_OK, $testrun, $testrun, $this->testruns[$testrun], $debugoutput);
		}


	}

}


