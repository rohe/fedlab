<?php

class sspmod_fedlab_AuthnRequestVerify extends sspmod_fedlab_BasicSPTest {


	
	protected function register() {
		$this->testruns = array(
			'requestmessage' 	=> 'Verify various aspects of the generated AuthenRequest message',
		);
	}
	
	public function run($testrun) {

		$this->crawler->reset();
		$result = $this->crawler->getURLraw($this->initurl);
		
		$request = $result['Request'];
		
		$this->checkNamePolicy($request);
		$this->checkProtocolBinding($request);
		$this->checkACS($request);
		$this->checkIssueInstant($request);

		return $this->flushResults();
	}
	
	protected function checkIssueInstant($request) {
		$i = $request->getIssueInstant();
		
		$msg = 'AuthnRequeset: The saml2p:AuthnRequest message MUST NOT contain an IssueInstant more than a few seconds away.';
		$id = 'authnrequest_issueinstant';
		
		if (abs(time() - $i) < 60) {
			$this->setResult(sspmod_fedlab_Tester::STATUS_OK, 'requestmessage', $id, $msg, 'Issue instant was correct (drifting less than 1 minute) ' . abs(time() - $i) . ' seconds');
		} else {
			$this->setResult(sspmod_fedlab_Tester::STATUS_FATAL, 'requestmessage', $id, $msg, 'Issue instant is drifting ' . abs(time() - $i) . ' seconds');
		}
	}
	
	protected function checkACS($request) {
		$acs = $request->getAssertionConsumerServiceURL();
		
		
		$msg = 'AuthnRequeset: The saml2p:AuthnRequest message issued by a Service Provider MUST contain an AssertionConsumerServiceURL attribute identifying the desired response location. (saml2int)';
		$id = 'authnrequest_acs';
		
		if (isset($acs)) {
			$this->setResult(sspmod_fedlab_Tester::STATUS_OK, 'requestmessage', $id, $msg, 'AssertionConsumerServiceURL was set');
		} else {
			$this->setResult(sspmod_fedlab_Tester::STATUS_ERROR, 'requestmessage', $id, $msg, 'AssertionConsumerServiceURL was not set.');
		}
	}
	
	
	protected function checkProtocolBinding($request) {
		$protocolBinding = $request->getProtocolBinding();
		
		
		$msg = 'AuthnRequeset: The ProtocolBinding attribute, if present, MUST be set to urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST. (saml2int)';
		$id = 'authnrequest_protocolbinding';
		
		if ($protocolBinding) {
			if ($protocolBinding == 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST') {
				$this->setResult(sspmod_fedlab_Tester::STATUS_OK, 'requestmessage', $id, $msg, 'Protocolbinding was set to: ' . $protocolBinding);
			} else {
				$this->setResult(sspmod_fedlab_Tester::STATUS_ERROR, 'requestmessage', $id, $msg, 'Protocolbinding was set to: ' . $protocolBinding);
			}
		} else {
			$this->setResult(sspmod_fedlab_Tester::STATUS_ERROR, 'requestmessage', $id, $msg, 'Protocolbinding was not set.');
		}
		
		
	}
	protected function checkNamePolicy($request) {
		// echo '<pre>';
		// print_r($request);
		// exit;
		
		$nameIdPolicy = $request->getNameIdPolicy();
		
		$msg = 'AuthnRequest SHOULD contain one saml2p:NameIDPolicy element (saml2int)';
		$id = 'authnrequest_nameidpolicy_one';
		if (isset($nameIdPolicy) ) {
			$this->setResult(sspmod_fedlab_Tester::STATUS_OK, 'requestmessage', $id, $msg, 'AuthnRequest contains a saml2p:NameIDPolicy element');
		} else {
			$this->setResult(sspmod_fedlab_Tester::STATUS_ERROR, 'requestmessage', $id, $msg, 'AuthnRequest contains no saml2p:NameIDPolicy element');
		}
		
		if (isset($nameIdPolicy)) {
			
			$msg = 'AuthnRequest: The saml2p:NameIDPolicy Format attribute, if present, SHOULD be set to one of the following values: transient or persistent (saml2int)';
			$id = 'authnrequest_nameidpolicy_format';
			
			if (isset($nameIdPolicy['Format'])) {
				if (in_array($nameIdPolicy['Format'], array(
					'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent', 
					'urn:oasis:names:tc:SAML:2.0:nameid-format:transient'
					))) {
					$this->setResult(sspmod_fedlab_Tester::STATUS_OK, 'requestmessage', $id, $msg, 'Format was set to: ' . $nameIdPolicy['Format']);
				} else {
					$this->setResult(sspmod_fedlab_Tester::STATUS_ERROR, 'requestmessage', $id, $msg, 'Format was set to: ' . $nameIdPolicy['Format']);
				}
			} else {
				$this->setResult(sspmod_fedlab_Tester::STATUS_OK, 'requestmessage', $id, $msg, 'Format was not present');
			}	
			
			
			$msg = 'AuthnRequest: The saml2p:AuthnRequest message SHOULD contain a saml2p:NameIDPolicy element with an AllowCreate attribute of true.';
			$id = 'authnrequest_nameidpolicy_allowcreate';
			
			if (isset($nameIdPolicy['AllowCreate'])) {
				if ($nameIdPolicy['AllowCreate']) {
					$this->setResult(sspmod_fedlab_Tester::STATUS_OK, 'requestmessage', $id, $msg, 'AllowCreate was set to true.');
				} else {
					$this->setResult(sspmod_fedlab_Tester::STATUS_ERROR, 'requestmessage', $id, $msg, 'AllowCreate was set to false.');
				}
			} else {
				$this->setResult(sspmod_fedlab_Tester::STATUS_ERROR, 'requestmessage', $id, $msg, 'AllowCreate was not set.');
			}
			
			
		}
		
		
	#	print_r($nameIdPolicy);
	}

	
}


