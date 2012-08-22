<?php

class sspmod_fedlab_ExtendedSPTest extends sspmod_fedlab_BasicSPTest {


	
	protected function register() {
		$this->testruns = array(
			'statuscode' => 'SP should not accept a Response as valid, when the StatusCode is not success',
			'nameid_persistent' 	=> 'SP should accept a NameID with Format: persistent',
			'nameid_email' 			=> 'SP should accept a NameID with Format: e-mail',
			'nameid_foo' 			=> 'Do SP work with unknown NameID Format, such as : foo',
			'nosubjectconfirmationdata'	=> 'SP should accept a Response without a SubjectConfirmationData element',
			'inresponseto_unsolicited'	=> 'SP should accept unsolicited response (no inresponseto attribute)',
			'inresponseto_invalid'	=> 'SP should not accept a InResponseTo which is chosen randomly',
			'inresponseto_invalid_assertion'	=> 'SP should not accept a InResponseTo which is chosen randomly (in assertion only)',
			'inresponseto_invalid_response'	=> 'SP should not accept a InResponseTo which is chosen randomly (in response only)',
			'inresponseto_missing_response' => 'Do the SP allow the InResponseTo attribute to be missing from the Response element?',
			'inresponseto_missing_assertion' => 'Do the SP allow the InResponseTo attribute to be missing from the SubjectConfirmationData element?',
#			'statuscode_verify' 	=> 'SP should not accept a Response with Status code indicating error',
			'destination' 			=> 'SP should not accept a broken DestinationURL attribute',
			'destination_assertion' 			=> 'SP should not accept a broken Recipient attribute in assertion SubjectConfirmationData/@Recipient',
			'destination_response' 			=> 'SP should not accept a broken DestinationURL attribute in response',
			'subjectconfirmationdata_multiplerecipient1' => 'SP should accept a Response with two SubjectConfirmationData elements representing two recipients (test 1 of 2, correct one last)',
			'subjectconfirmationdata_multiplerecipient2' => 'SP should accept a Response with two SubjectConfirmationData elements representing two recipients (test 1 of 2, correct one first)',
			'subjectconfirmation_multiplerecipient1' => 'SP should accept a Response with two SubjectConfirmation elements representing two recipients (test 1 of 2, correct one last)',
			'subjectconfirmation_multiplerecipient2' => 'SP should accept a Response with two SubjectConfirmation elements representing two recipients (test 1 of 2, correct one first)',
			'subjectconfirmation_address' => 'SP should accept a Response with a SubjectConfirmationData elements with a correct @Address attribute',
			'subjectconfirmation_address_wrong' => 'SP should nnot accept a Response with a SubjectConfirmationData elements with a incorrect @Address attribute',
			'subjectconfirmation_address_multiple1' => 'SP should accept a Response with multiple SubjectConfirmation elements with /SubjectConfirmationData/@Address-es, where one is correct  (test 1 of 2, correct one last)',
			'subjectconfirmation_address_multiple2' => 'SP should accept a Response with multiple SubjectConfirmation elements with /SubjectConfirmationData/@Address-es, where one is correct  (test 1 of 2, correct one first)',
			'subjectconfirmationdata_address_multiple1' => 'SP should accept a Response with multiple SubjectConfirmationData elements with /SubjectConfirmationData/@Address-es, where one is correct  (test 1 of 2, correct one last)',
			'subjectconfirmationdata_address_multiple2' => 'SP should accept a Response with multiple SubjectConfirmationData elements with /SubjectConfirmationData/@Address-es, where one is correct  (test 1 of 2, correct one first)',

			'assertion_condition_unknown' => 'SP Should not accept an assertion containing an uknown Condition',
			'assertion_condition_notbefore' 	=> 'SP should not accept a Response with a Condition with a NotBefore in the future.',
			'assertion_condition_expired' 		=> 'SP should not accept a Response with a Condition with a NotOnOrAfter in the past.',
			'assertion_subjectconfirmationdata_expired' => 'SP should not accept a Response with a SubjectConfirmationData@NotOnOrAfter in the past',
			'assertion_authnstatement_expired'	=> 'SP should not accept a Response with a AuthnStatement where SessionNotOnOrAfter is set in the past',
			'assertion_authnstatement_missing'	=> 'SP should not accept a Response with a AuthnStatement missing',
			'issueinstant_future'			=> 'SP should not accept an IssueInstant far (24 hours) into the future',
			'issueinstant_past'				=> 'SP should not accept an IssueInstant far (24 hours) into the past',
			'xsdatetime_milliseconds'		=> 'SP should accept xs:datetime with millisecond precision http://www.w3.org/TR/xmlschema-2/#dateTime',
			'xsdatetime_microseconds'		=> 'SP should accept xs:datetime with microsecond precision http://www.w3.org/TR/xmlschema-2/#dateTime',
			
			
			'assertion_audience_empty' 			=> 'SP should not accept a Response with a Condition with a empty set of Audience.',
			'assertion_audience_wrong' 			=> 'SP should not accept a Response with a Condition with a wrong Audience.',
			'assertion_audience_prepend' 		=> 'SP should accept a Response with a Condition with an addition Audience prepended.',
			'assertion_audience_append' 		=> 'SP should accept a Response with a Condition with an addition Audience appended.',
			'assertion_audience_intersect1'		=> 'SP should not accept multiple AudienceRestrictions where the intersection is zero. (test 1 of 2)',
			'assertion_audience_intersect2'		=> 'SP should not accept multiple AudienceRestrictions where the intersection is zero. (test 2 of 2)',
			'assertion_audience_intersect3'		=> 'SP should accept multiple AudienceRestrictions where the intersection includes the correct audience.',
			'signedassertion' 			=> 'SP should accept that only the Assertion is signed instead of the Response.',
			'signedassertionandresponse' 			=> 'SP should accept that both the Response and the Assertion is signed.',
			'relaystate_lost'			=> 'Do SP work when RelayState information is lost?',
			'samlp_extensions'		=> 'Do SP accept an unknown Extensions element in the Response?',
			'wrongnamespace' => 'SP MUST not accept response when the saml-namespace is invalid',
		);
	}
	

	function getConfig($testrun) {
		$config = parent::getConfig($testrun);
		
		switch($testrun) {
			case 'nameid_persistent' : 
				$config['nameIdFormat'] = 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent';
				break;

			case 'nameid_email' : 
				$config['nameIdFormat'] = 'urn:oasis:names:tc:SAML:2.0:nameid-format:email';
				break;

			case 'nameid_foo' : 
				$config['nameIdFormat'] = 'urn:oasis:names:tc:SAML:2.0:nameid-format:foo';
				break;
				
			case 'assertion_condition_notbefore' : 
				$config['notBeforeSkew'] = 3600;
				break;
				
			case 'assertion_condition_expired' : 
				$config['assertionLifetime'] = -3600;
				break;
				
			case 'signedassertion' : 
				$config['signAssertion'] = TRUE;
				$config['signResponse'] = FALSE;
				break;

			case 'signedassertionandresponse' : 
				$config['signAssertion'] = TRUE;
				$config['signResponse'] = TRUE;
				break;
			
			case 'assertion_subjectconfirmationdata_expired':
				$config['SubjectConfirmationDataLifetime'] = -3600;
				break;

			case 'assertion_condition_unknown':
				$config['extracondition'] = 'fff';
				break;
			
			case 'assertion_authnstatement_expired':
				$config['sessionLifetime'] = -3600;
				break;
			
			case 'nosubjectconfirmationdata':
				$config['addSubjectConfirmationData'] = FALSE;
				break;
				
			case 'subjectconfirmationdata_multiplerecipient1':
			case 'subjectconfirmationdata_multiplerecipient2':
			case 'subjectconfirmationdata_address_multiple1':
			case 'subjectconfirmationdata_address_multiple2':
				$config['iterateSubjectConfirmationData'] = TRUE;
				break;
			
			case 'issueinstant_past':
				$config['issueInstantMod'] = -3600*24;
				break;
			case 'issueinstant_future':
				$config['issueInstantMod'] = 3600*24;
				break;
			
			case 'xsdatetime_milliseconds':
				$config['dateFormat'] = 'Y-m-d\TH:i:s.263\Z';
				break;
				
			case 'xsdatetime_microseconds':
				$config['dateFormat'] = 'Y-m-d\TH:i:s.263234\Z';
				break;
			
			case 'assertion_authnstatement_missing':
				$config['includeAuthn'] = FALSE;
				break;
		}

		return $config;
	}
	

	
	protected function expectedResult($testrun, $body, $debugoutput) {
		switch ($testrun) {
			
			
			// Info:
			case 'relaystate_lost':
			case 'nameid_foo':
			case 'samlp_extensions':
			case 'inresponseto_missing_response':
			case 'inresponseto_missing_assertion':
			case 'subjectconfirmationdata_address_multiple1':
			case 'subjectconfirmationdata_address_multiple2':
			case 'nosubjectconfirmationdata':
			case 'subjectconfirmationdata_multiplerecipient1':
			case 'subjectconfirmationdata_multiplerecipient2':
			case 'assertion_audience_empty':
			
			
				if ($this->containsName($body)) {
					$this->setResult(sspmod_fedlab_Tester::STATUS_INFO, $testrun, $testrun, $this->testruns[$testrun], 'Test succeeded' . $debugoutput);
				} else {
					$this->setResult(sspmod_fedlab_Tester::STATUS_INFO, $testrun, $testrun, $this->testruns[$testrun], 'Test did not succeed' . $debugoutput);
				}
				break;
			
			// SHOULD NOT WORK - FATAL
			case 'inresponseto_invalid':
			case 'inresponseto_invalid_assertion':
			case 'inresponseto_invalid_response':
			
			case 'destination':
			case 'destination_response':
			case 'destination_assertion':
			case 'assertion_condition_notbefore':
			case 'assertion_condition_expired':
			case 'assertionLifetime':
			case 'assertion_subjectconfirmationdata_expired':

			case 'assertion_audience_intersect1':
			case 'assertion_audience_intersect2':
			case 'statuscode':
			case 'assertion_condition_unknown':
			case 'assertion_authnstatement_expired':
			case 'assertion_audience_wrong':
			case 'subjectconfirmation_address_wrong':
			case 'assertion_authnstatement_missing':
			case 'wrongnamespace':
			
				if ($this->containsName($body)) {
					$this->setResult(sspmod_fedlab_Tester::STATUS_FATAL, $testrun, $testrun, $this->testruns[$testrun], $debugoutput);
				} else {
					$this->setResult(sspmod_fedlab_Tester::STATUS_OK, $testrun, $testrun, $this->testruns[$testrun], $debugoutput);
				}
				break;
			
			// SHOULD NOT WORK
			case 'issueinstant_past':
			case 'issueinstant_future':


				if ($this->containsName($body)) {
					$this->setResult(sspmod_fedlab_Tester::STATUS_ERROR, $testrun, $testrun, $this->testruns[$testrun], $debugoutput);
				} else {
					$this->setResult(sspmod_fedlab_Tester::STATUS_OK, $testrun, $testrun, $this->testruns[$testrun], $debugoutput);
				}
				break;
			

			// SHOULD WORK FATAL


			case 'nameid_persistent': 
			case 'assertion_audience_prepend':
			case 'assertion_audience_append':		
			case 'assertion_audience_intersect3': 
			case 'subjectconfirmation_multiplerecipient1':
			case 'subjectconfirmation_multiplerecipient2':
			case 'subjectconfirmation_address':
			case 'subjectconfirmation_address_multiple1':
			case 'subjectconfirmation_address_multiple2':
			case 'xsdatetime_milliseconds':
			case 'xsdatetime_microseconds':

				if ($this->containsName($body)) {
					$this->setResult(sspmod_fedlab_Tester::STATUS_OK, $testrun, $testrun, $this->testruns[$testrun], $debugoutput);
				} else {
					$this->setResult(sspmod_fedlab_Tester::STATUS_FATAL, $testrun, $testrun, $this->testruns[$testrun], $debugoutput);
				}
				break;

			
			// SHOULD WORK
			case 'nameid_email': 
			case 'inresponseto_unsolicited':
			case 'signedassertion':
			case 'signedassertionandresponse':

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
	
	protected function getDestinationAssertion($testrun, $default) {
		if ($testrun === 'destination') return array('http://localhost:8080/saml/bogus');
		if ($testrun === 'destination_assertion') return array('http://localhost:8080/saml/bogus');
		if ($testrun === 'subjectconfirmationdata_multiplerecipient1') return array('http://localhost:8080/saml/bogus', $default[0]);
		if ($testrun === 'subjectconfirmationdata_multiplerecipient2') return array($default[0], 'http://localhost:8080/saml/bogus');
		if ($testrun === 'subjectconfirmation_multiplerecipient1') return array('http://localhost:8080/saml/bogus', $default[0]);
		if ($testrun === 'subjectconfirmation_multiplerecipient2') return array($default[0], 'http://localhost:8080/saml/bogus');

		return parent::getDestinationAssertion($testrun, $default);
	}
	
	protected function getDestinationResponse($testrun, $default) {
		if ($testrun === 'destination') return 'http://localhost:8080/saml/bogus';
		if ($testrun === 'destination_response') return 'http://localhost:8080/saml/bogus';
		return parent::getDestinationResponse($testrun, $default);
	}

	
	protected function getInResponseToAssertion($testrun, $default) {
		if ($testrun === 'inresponseto_invalid') return SimpleSAML_Utilities::generateID();
		if ($testrun === 'inresponseto_invalid_assertion') return SimpleSAML_Utilities::generateID();
		if ($testrun === 'inresponseto_unsolicited') return NULL;
		if ($testrun === 'inresponseto_missing_assertion') return NULL;
		return $default;
	}

	protected function getInResponseToResponse($testrun, $default) {
		if ($testrun === 'inresponseto_invalid') return SimpleSAML_Utilities::generateID();
		if ($testrun === 'inresponseto_invalid_response') return SimpleSAML_Utilities::generateID();
		if ($testrun === 'inresponseto_unsolicited') return NULL;
		if ($testrun === 'inresponseto_missing_response') return NULL;
		return $default;
	}
	
	protected function getValidAudience($testrun, $default) {
		if ($testrun === 'assertion_audience_empty') return array(array());
		if ($testrun === 'assertion_audience_prepend') {
			$a = array(array('urn:foo', $default[0][0]));
			return $a;
		}
		
		if ($testrun === 'assertion_audience_append') {
			$a = array(array($default[0][0], 'urn:foo'));
			return $a;
		}
		
		if ($testrun === 'assertion_audience_intersect1') {
			$a = array($default[0], array('urn:foo')); 
			return $a;
		}
		
		if ($testrun === 'assertion_audience_intersect2') {
			$a = array(array('urn:foo'), $default[0] );
			return $a;
		}
		
		if ($testrun === 'assertion_audience_wrong') {
			$a = array(array('urn:foo'));
			return $a;
		}
		
		if ($testrun === 'assertion_audience_intersect3') {
			$a = array($default[0], $default[0] );
			return $a;
		}
		
		return $default;
	}
	
	protected function getRelayState($testrun, $default) {
		if ($testrun === 'relaystate_lost') return NULL;
		return $default;
	}

	
	protected function tweakResponse($testrun, &$response) {
		if ($testrun === 'statuscode') {
			$response->setStatus(array(
				'Code' => 'urn:oasis:names:tc:SAML:2.0:status:AuthnFailed', 
				'SubCode' => 'urn:error:nested', 
				'Message' => 'This is an error. SP should not like this.'));
		}
		if ($testrun === 'samlp_extensions') {
			$response->extensions = TRUE;
		}
	}
	
	protected function tweakResponseText($testrun, &$response) {
		if ($testrun === 'wrongnamespace') {
#			error_log('Type class: ' . get_class($response));
			$response = str_replace('urn:oasis:names:tc:SAML:2.0:assertion', 'urn:assertion:bogus:namespace', $response);

		}
	}
	
	protected function getAddresses($testrun, $default) {
		if ($testrun === 'subjectconfirmation_address') {
			return array($_SERVER['SERVER_ADDR']);
		}
		if ($testrun === 'subjectconfirmation_address_wrong') {
			return array('1.2.3.4');
		}
		if ($testrun === 'subjectconfirmation_address_multiple1') {
			return array('1.2.3.4', $_SERVER['SERVER_ADDR']);
		}
		if ($testrun === 'subjectconfirmation_address_multiple2') {
			return array($_SERVER['SERVER_ADDR'], '1.2.3.4');
		}

		if ($testrun === 'subjectconfirmationdata_address_multiple1') {
			return array('1.2.3.4', $_SERVER['SERVER_ADDR']);
		}
		if ($testrun === 'subjectconfirmationdata_address_multiple2') {
			return array($_SERVER['SERVER_ADDR'], '1.2.3.4');
		}
		return $default;
	}
	
}


