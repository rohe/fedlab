<?php

class sspmod_fedlab_tests_Metadata extends sspmod_fedlab_Tester {




	protected function getXML() {
		$xml = new SimpleXMLElement($this->metadataXML);
		$xml->registerXPathNamespace('saml2',  'urn:oasis:names:tc:SAML:2.0:assertion');
		$xml->registerXPathNamespace('saml2p', 'urn:oasis:names:tc:SAML:2.0:protocol');		
		$xml->registerXPathNamespace('md', 'urn:oasis:names:tc:SAML:2.0:metadata');
		return $xml;
	}

	protected function register() {
		$this->testruns = array(
			'metadata' => 'Testing metadata content'
		);
	}
	
	public function run($testrun) {
		
		$this->validateXML();
		$this->reviewEndpoints();
		$this->reviewContent();

		return $this->flushResults();
	}
	
	
	
	
	public function reviewContent() {
		$xml = $this->getXML();
		if ($xml->xpath('/md:EntityDescriptor') ) {
			$this->setResult(sspmod_fedlab_Tester::STATUS_OK, 'metadata', 'metadata_rootnode', 'Metadata: Root node MUST be an md:EntityDescriptor');
		} else {
			$this->setResult(sspmod_fedlab_Tester::STATUS_FATAL, 'metadata', 'metadata_rootnode', 'Metadata: Root node MUST be an md:EntityDescriptor');
		}
		
		if ($sso = $xml->xpath("md:SPSSODescriptor[contains(@protocolSupportEnumeration, 'urn:oasis:names:tc:SAML:2.0:protocol')]")) {
			$this->setResult(sspmod_fedlab_Tester::STATUS_OK, 'metadata', 'metadata_spssodescriptor', 'Metadata MUST contain an SPSSODescriptor with protocolSupportEnumeration=urn:oasis:names:tc:SAML:2.0:protocol');
			
			$sso[0]->registerXPathNamespace('saml2',  'urn:oasis:names:tc:SAML:2.0:assertion');
			$sso[0]->registerXPathNamespace('saml2p', 'urn:oasis:names:tc:SAML:2.0:protocol');		
			$sso[0]->registerXPathNamespace('md', 'urn:oasis:names:tc:SAML:2.0:metadata');
			
#			echo '<pre>'; print_r($sso[0]); exit;
			// if($key = $xml->xpath("md:SPSSODescriptor[contains(@protocolSupportEnumeration, 'urn:oasis:names:tc:SAML:2.0:protocol')]/md:KeyDescriptor")) {
			// 	$this->setResult(sspmod_fedlab_Tester::STATUS_OK, 'metadata', 'metadata_key', 'Metadata contains a X.509 certificate');
			// } else {
			// 	$this->setResult(sspmod_fedlab_Tester::STATUS_ERROR, 'metadata', 'metadata_key', 'Metadata contains a X.509 certificate');
			// }
			
		} else {
			$this->setResult(sspmod_fedlab_Tester::STATUS_FATAL, 'metadata', 'metadata_spssodescriptor', 'Metadata MUST contain an SPSSODescriptor with protocolSupportEnumeration=urn:oasis:names:tc:SAML:2.0:protocol');
		}
	}
	
	public function validateXML() {
		
		if (!isset($this->metadataXML)) throw new Exception('Metadata not available.');
		
		$doc = new DOMDocument();
		$res = $doc->loadXML($this->metadataXML);
		if($res !== TRUE) {
			throw new Exception('Failed to parse Metadata XML: ' . $this->metadataXML);
		}
		
#		echo '<pre>'; print_r($res);
		
		$val = SimpleSAML_Utilities::validateXML($doc, 'saml-schema-metadata-2.0.xsd');
		
		if ($val) {
			$this->setResult(sspmod_fedlab_Tester::STATUS_FATAL, 'metadata', 'metadata_schemavalid', 'Metadata MUST be schema valid', $val);
		} else {
			$this->setResult(sspmod_fedlab_Tester::STATUS_OK, 'metadata', 'metadata_schemavalid', 'Metadata MUST be schema valid');
		}
		
	}
	
	public function reviewEndpoints() {
		
		$entities = SimpleSAML_Metadata_SAMLParser::parseDescriptorsString($this->metadataXML);
		$entity = array_pop($entities);
		$spmetadata =  $entity->getMetadata20SP();
		
#		$spmetadata = $this->metadataXML->getMetadata20SP();
		
		$allHTTPS = TRUE;
		$acspost = FALSE;
		
		if (isset($spmetadata)) {
#			echo '<pre>';
#			print_r($spmetadata);
		}
		
		
		if (isset($spmetadata['AssertionConsumerService'])) {
			foreach($spmetadata['AssertionConsumerService'] AS $e) {
				if ($e['Binding'] === 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST')
					$acspost = TRUE;
				if (substr($e['Location'], 0, 5) !== 'https') {
					#echo 'comparing [' . substr($e['Location'], 0, 5) . ']';					
					$allHTTPS = FALSE;	
				}

			}
		}
		
		if (isset($spmetadata['SingleLogoutService'])) {
			foreach($spmetadata['SingleLogoutService'] AS $e) {
				// if ($e['Binding'] === 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect')
				// 	$acspost = TRUE;
				if (substr($e['Location'], 0, 5) !== 'https') $allHTTPS = FALSE;
			}
		}
		
		if ($allHTTPS) {
			$this->setResult(sspmod_fedlab_Tester::STATUS_OK, 'metadata', 'https', 'All endpoints in SP metadata SHOULD be HTTPS (not http) (saml2int)');
		} else {
			$this->setResult(sspmod_fedlab_Tester::STATUS_FATAL, 'metadata', 'https', 'All endpoints in SP metadata SHOULD be HTTPS (not http) (saml2int)');
		}
		
		if ($acspost) {
			$this->setResult(sspmod_fedlab_Tester::STATUS_OK, 'metadata', 'acspost', 'SP Metadata MUST contain at least an ACS endpoint with the HTTP-POST binding (saml2int)');
		} else {
			$this->setResult(sspmod_fedlab_Tester::STATUS_FATAL, 'metadata', 'acspost', 'SP Metadata MUST contain at least an ACS endpoint with the HTTP-POST binding (saml2int)');
		}
		
	}
	
}


