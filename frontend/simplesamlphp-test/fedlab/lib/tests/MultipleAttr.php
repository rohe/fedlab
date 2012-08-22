<?php

class sspmod_fedlab_tests_MultipleAttr extends sspmod_fedlab_BasicSPTest {


	
	protected function register() {
		$this->testruns = array(
			'multipleattr' => 'SP SHOULD find attributes in a second AttributeStatement, not only in the first.',

		);
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
		$a = new sspmod_fedlab_xml_AssertionMultipleAttrStatements();
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
		$msgStr = $msgStr->ownerDocument->saveXML($msgStr);
		
#		echo '<pre>'; echo(htmlspecialchars($msgStr)); exit;
		
#		$msgStr = base64_encode($msgStr);
#		$msgStr = htmlspecialchars($msgStr);

#		$this->log($testrun, 'created response: ' . $testrun);
		
		return array('url' => $consumerURL, 'Response' => $msgStr, 'RelayState' => $relayState);

	}
	
	

	protected function expectedResult($testrun, $body, $debugoutput) {
		
		$this->log($testrun, 'checking expected output... ');
		
		
		switch($testrun) {

			case 'multipleattr': 
					
				if ($this->containsName($body)) {
					$this->setResult(sspmod_fedlab_Tester::STATUS_OK, $testrun, $testrun, $this->testruns[$testrun], $debugoutput);

				} else {
					$this->setResult(sspmod_fedlab_Tester::STATUS_FATAL, $testrun, $testrun, $this->testruns[$testrun], $debugoutput);
				}
				break;
		
		}
	}

}


