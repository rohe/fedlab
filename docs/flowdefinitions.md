# Flow definitions


Output from cmd script looks like this. On the wire it is made into an property list with 'sid' as key. sid is a hash of the id encoded for use as xml:id.

OpenID Connect example definitions:

	[{
		depends: ['mj-07'],
		endpoints: ['authorization_endpoint', 'token_endpoint'],
		id: 'oic-code+idtoken+token-token',
		descr: '1) Request with response_type=\'code id_token token\'\n2) AccessTokenRequest\nAuthentication method used is \'client_secret_post\'',
		name: 'Flow with response_type=\'code token idtoken\''
	}, {
		depends: ['oic-code-token'],
		endpoints: ['authorization_endpoint', 'token_endpoint', 'userinfo_endpoint'],
		id: 'oic-code-token-userinfo_bb',
		descr: '1) Request with response_type=\'code\'\n2) AccessTokenRequest\n  Authentication method used is \'client_secret_post\'\n3) UserinfoRequest\n  \'bearer_body\' authentication used',
		name: 'Authorization grant flow response_type=\'code token\',\n    UserInfo request using POST and bearer body authentication'
	}, {
		endpoints: ['authorization_endpoint', 'token_endpoint'],
		id: 'mj-26',
		name: 'Request with display=page'
	}, {
		endpoints: ['authorization_endpoint'],
		id: 'mj-32',
		name: 'Request with redirect_uri with query component'
	}, {
		endpoints: ['registration_endpoint'],
		id: 'mj-33',
		name: 'Registration where a redirect_uri has a query component'
	}, {
		endpoints: ['authorization_endpoint', 'token_endpoint'],
		id: 'mj-30',
		name: 'Access token request with client_secret_basic authentication'
	}, {
		endpoints: ['authorization_endpoint'],
		id: 'mj-31',
		name: 'Request with response_type=code and extra query component'
	}, {
		endpoints: ['authorization_endpoint'],
		id: 'mj-36',
		name: 'The sent redirect_uri does not match the registered'
	}, {
		endpoints: ['authorization_endpoint', 'token_endpoint'],
		id: 'mj-37',
		name: 'Access token request with client_secret_jwt authentication'
	}, {
		endpoints: ['registration_endpoint'],
		id: 'mj-34',
		name: 'Registration where a redirect_uri has a fragment'
	}, {
		endpoints: ['authorization_endpoint'],
		id: 'mj-35',
		name: 'Authorization request missing the \'response_type\' parameter'
	}, {
		endpoints: ['authorization_endpoint', 'token_endpoint'],
		id: 'mj-38',
		name: 'Access token request with public_key_jwt authentication'
	}, {
		depends: ['oic-code-token'],
		endpoints: ['authorization_endpoint', 'token_endpoint'],
		id: 'mj-39',
		name: 'Trying to use access code twice should result in an error'
	}, {
		depends: ['oic-code+idtoken+token-token'],
		endpoints: ['authorization_endpoint', 'token_endpoint', 'userinfo_endpoint'],
		id: 'oic-code+idtoken+token-token-userinfo',
		descr: '1) Request with response_type=\'code id_token token\'\n2) AccessTokenRequest\n  Authentication method used is \'client_secret_post\'\n3) UserinfoRequest\n  \'bearer_body\' authentication used',
		name: 'Flow with response_type=\'code idtoken token\'\n    grab a second token using the code and then do a Userinfo\n    request'
	}, {
		depends: ['mj-05'],
		endpoints: ['authorization_endpoint', 'token_endpoint'],
		id: 'oic-code+idtoken-token',
		descr: '1) Request with response_type=\'code id_token\'\n2) AccessTokenRequest\nAuthentication method used is \'client_secret_post\'',
		name: 'Flow with response_type=\'code idtoken\''
	}, {
		depends: ['oic-code+idtoken-token'],
		endpoints: ['authorization_endpoint', 'token_endpoint', 'userinfo_endpoint'],
		id: 'oic-code+idtoken-token-userinfo',
		descr: '1) Request with response_type=\'code id_token\'\n2) UserinfoRequest\n  \'bearer_body\' authentication used',
		name: 'Flow with response_type=\'code idtoken\' and Userinfo request'
	}, {
		endpoints: ['authorization_endpoint', 'token_endpoint', 'check_id_endpoint'],
		id: 'mj-09',
		name: 'Check ID Endpoint Access with POST and bearer_header'
	}, {
		endpoints: ['authorization_endpoint', 'token_endpoint', 'check_id_endpoint'],
		id: 'mj-08',
		name: 'Check ID Endpoint Access with GET and bearer_header'
	}, {
		endpoints: ['authorization_endpoint'],
		id: 'mj-07',
		name: 'Request with response_type=code id_token token'
	}, {
		endpoints: ['authorization_endpoint'],
		id: 'mj-06',
		name: 'Request with response_type=id_token token'
	}, {
		endpoints: ['authorization_endpoint'],
		id: 'mj-05',
		name: 'Request with response_type=code id_token'
	}, {
		endpoints: ['authorization_endpoint'],
		id: 'mj-04',
		name: 'Request with response_type=code token'
	}, {
		endpoints: ['authorization_endpoint'],
		id: 'mj-03',
		name: 'Request with response_type=id_token'
	}, {
		endpoints: ['authorization_endpoint'],
		id: 'mj-02',
		name: 'Request with response_type=token'
	}, {
		endpoints: ['authorization_endpoint'],
		id: 'mj-01',
		name: 'Request with response_type=code'
	}, {
		endpoints: ['registration_endpoint'],
		id: 'mj-00',
		name: 'Client registration Request'
	}, {
		depends: ['mj-39'],
		endpoints: ['authorization_endpoint', 'token_endpoint', 'userinfo_endpoint'],
		id: 'mj-40',
		name: 'Trying to use access code twice should result in revoking previous issued tokens'
	}, {
		endpoints: ['authorization_endpoint', 'token_endpoint', 'userinfo_endpoint'],
		id: 'mj-18',
		name: 'Scope Requesting all Claims'
	}, {
		endpoints: ['authorization_endpoint', 'token_endpoint', 'userinfo_endpoint'],
		id: 'mj-19',
		name: 'OpenID Request Object with Required name Claim'
	}, {
		endpoints: ['authorization_endpoint', 'token_endpoint', 'check_id_endpoint'],
		id: 'mj-10',
		name: 'Check ID Endpoint Access with POST and bearer_body'
	}, {
		endpoints: ['authorization_endpoint', 'token_endpoint', 'userinfo_endpoint'],
		id: 'mj-11',
		name: 'UserInfo Endpoint Access with GET and bearer_header'
	}, {
		endpoints: ['authorization_endpoint', 'token_endpoint', 'userinfo_endpoint'],
		id: 'mj-12',
		name: 'UserInfo Endpoint Access with POST and bearer_header'
	}, {
		endpoints: ['authorization_endpoint', 'token_endpoint', 'userinfo_endpoint'],
		id: 'mj-13',
		name: 'UserInfo Endpoint Access with POST and bearer_body'
	}, {
		endpoints: ['authorization_endpoint', 'token_endpoint', 'userinfo_endpoint'],
		id: 'mj-14',
		name: 'Scope Requesting profile Claims'
	}, {
		endpoints: ['authorization_endpoint', 'token_endpoint', 'userinfo_endpoint'],
		id: 'mj-15',
		name: 'Scope Requesting email Claims'
	}, {
		endpoints: ['authorization_endpoint', 'token_endpoint', 'userinfo_endpoint'],
		id: 'mj-16',
		name: 'Scope Requesting address Claims'
	}, {
		endpoints: ['authorization_endpoint', 'token_endpoint', 'userinfo_endpoint'],
		id: 'mj-17',
		name: 'Scope Requesting phone Claims'
	}, {
		depends: ['mj-01'],
		endpoints: ['authorization_endpoint', 'token_endpoint'],
		id: 'oic-code-token',
		descr: '1) Request with response_type=code\nscope = [\'openid\']\n2) AccessTokenRequest\nAuthentication method used is \'client_secret_post\'',
		name: 'Simple authorization grant flow'
	}, {
		depends: ['mj-06'],
		endpoints: ['authorization_endpoint', 'userinfo_endpoint'],
		id: 'oic-idtoken+token-userinfo',
		descr: '1) Request with response_type=\'id_token token\'\n2) UserinfoRequest\n  \'bearer_body\' authentication used',
		name: 'Flow with response_type=\'token idtoken\' and Userinfo request'
	}, {
		depends: ['mj-04'],
		endpoints: ['authorization_endpoint', 'token_endpoint'],
		id: 'oic-code+token-token',
		descr: '1) Request with response_type=\'code token\'\n2) AccessTokenRequest\nAuthentication method used is \'client_secret_post\'',
		name: 'Flow with response_type=\'code token\''
	}, {
		depends: ['mj-07'],
		endpoints: ['authorization_endpoint', 'userinfo_endpoint'],
		id: 'oic-code+idtoken+token-userinfo',
		descr: '1) Request with response_type=\'code id_token token\'\n2) UserinfoRequest\n  \'bearer_body\' authentication used',
		name: 'Flow with response_type=\'code idtoken token\' and Userinfo\n    request'
	}, {
		depends: ['mj-04'],
		endpoints: ['authorization_endpoint', 'userinfo_endpoint'],
		id: 'oic-code+token-userinfo',
		descr: '1) Request with response_type=\'code token\'\n2) UserinfoRequest\n  \'bearer_body\' authentication used',
		name: 'Flow with response_type=\'code token\' and Userinfo request'
	}, {
		depends: ['mj-02'],
		endpoints: ['authorization_endpoint', 'userinfo_endpoint'],
		id: 'oic-token-userinfo_bb',
		descr: '1) Request with response_type=\'token\'\n2) UserinfoRequest\n  \'bearer_body\' authentication used',
		name: 'Implicit flow, UserInfo request using POST and bearer body\n    authentication'
	}, {
		depends: ['mj-02'],
		endpoints: ['authorization_endpoint', 'userinfo_endpoint'],
		id: 'oic-token-userinfo',
		descr: '1) Request with response_type=\'token\'\n2) UserinfoRequest\n  \'bearer_body\' authentication used',
		name: 'Implicit flow and Userinfo request'
	}, {
		endpoints: ['authorization_endpoint', 'token_endpoint', 'userinfo_endpoint'],
		id: 'mj-21',
		name: 'OpenID Request Object with Required name and Optional email and picture Claim'
	}, {
		endpoints: ['authorization_endpoint', 'token_endpoint', 'userinfo_endpoint'],
		id: 'mj-20',
		name: 'OpenID Request Object with Optional email and picture Claim'
	}, {
		endpoints: ['authorization_endpoint', 'token_endpoint', 'userinfo_endpoint'],
		id: 'mj-23',
		name: 'Requesting ID Token with Required acr Claim'
	}, {
		endpoints: ['authorization_endpoint', 'token_endpoint', 'userinfo_endpoint'],
		id: 'mj-22',
		name: 'Requesting ID Token with auth_time Claim'
	}, {
		endpoints: ['authorization_endpoint', 'token_endpoint', 'userinfo_endpoint'],
		id: 'mj-25a',
		name: 'Requesting ID Token with max_age=1 seconds Restriction'
	}, {
		endpoints: ['authorization_endpoint', 'token_endpoint', 'userinfo_endpoint'],
		id: 'mj-24',
		name: 'Requesting ID Token with Optional acr Claim'
	}, {
		endpoints: ['authorization_endpoint', 'token_endpoint'],
		id: 'mj-27',
		name: 'Request with display=popup'
	}, {
		endpoints: ['authorization_endpoint', 'token_endpoint', 'userinfo_endpoint'],
		id: 'mj-25b',
		name: 'Requesting ID Token with max_age=10 seconds Restriction'
	}, {
		endpoints: ['authorization_endpoint', 'token_endpoint'],
		id: 'mj-29',
		name: 'Request with prompt=login'
	}, {
		endpoints: ['authorization_endpoint'],
		id: 'mj-28',
		name: 'Request with prompt=none'
	}, {
		endpoints: ['authorization_endpoint'],
		id: 'oic-verify',
		descr: 'Request with response_type=code',
		name: 'Special flow used to find necessary user interactions'
	}]


Old version of SAML definitions:

	{
		"sspmod_fedlab_BasicSPTest__BasicTest": {
			"name": "Basic Login test"
		},
		"sspmod_fedlab_AuthnRequestVerify__requestmessage": {
			"name": "Verify various aspects of the generated AuthenRequest message"
		},
		"sspmod_fedlab_ExtendedSPTest__statuscode": {
			"name": "SP should not accept a Response as valid, when the StatusCode is not success"
		},
		"sspmod_fedlab_ExtendedSPTest__nameid_persistent": {
			"name": "SP should accept a NameID with Format: persistent"
		},
		"sspmod_fedlab_ExtendedSPTest__nameid_email": {
			"name": "SP should accept a NameID with Format: e-mail"
		},
		"sspmod_fedlab_ExtendedSPTest__nameid_foo": {
			"name": "Do SP work with unknown NameID Format, such as : foo"
		},
		"sspmod_fedlab_ExtendedSPTest__nosubjectconfirmationdata": {
			"name": "SP should accept a Response without a SubjectConfirmationData element"
		},
		"sspmod_fedlab_ExtendedSPTest__inresponseto_unsolicited": {
			"name": "SP should accept unsolicited response (no inresponseto attribute)"
		},
		"sspmod_fedlab_ExtendedSPTest__inresponseto_invalid": {
			"name": "SP should not accept a InResponseTo which is chosen randomly"
		},
		"sspmod_fedlab_ExtendedSPTest__inresponseto_invalid_assertion": {
			"name": "SP should not accept a InResponseTo which is chosen randomly (in assertion only)"
		},
		"sspmod_fedlab_ExtendedSPTest__inresponseto_invalid_response": {
			"name": "SP should not accept a InResponseTo which is chosen randomly (in response only)"
		},
		"sspmod_fedlab_ExtendedSPTest__inresponseto_missing_response": {
			"name": "Do the SP allow the InResponseTo attribute to be missing from the Response element?"
		},
		"sspmod_fedlab_ExtendedSPTest__inresponseto_missing_assertion": {
			"name": "Do the SP allow the InResponseTo attribute to be missing from the SubjectConfirmationData element?"
		},
		"sspmod_fedlab_ExtendedSPTest__destination": {
			"name": "SP should not accept a broken DestinationURL attribute"
		},
		"sspmod_fedlab_ExtendedSPTest__destination_assertion": {
			"name": "SP should not accept a broken Recipient attribute in assertion SubjectConfirmationData\/@Recipient"
		},
		"sspmod_fedlab_ExtendedSPTest__destination_response": {
			"name": "SP should not accept a broken DestinationURL attribute in response"
		},
		"sspmod_fedlab_ExtendedSPTest__subjectconfirmationdata_multiplerecipient1": {
			"name": "SP should accept a Response with two SubjectConfirmationData elements representing two recipients (test 1 of 2, correct one last)"
		},
		"sspmod_fedlab_ExtendedSPTest__subjectconfirmationdata_multiplerecipient2": {
			"name": "SP should accept a Response with two SubjectConfirmationData elements representing two recipients (test 1 of 2, correct one first)"
		},
		"sspmod_fedlab_ExtendedSPTest__subjectconfirmation_multiplerecipient1": {
			"name": "SP should accept a Response with two SubjectConfirmation elements representing two recipients (test 1 of 2, correct one last)"
		},
		"sspmod_fedlab_ExtendedSPTest__subjectconfirmation_multiplerecipient2": {
			"name": "SP should accept a Response with two SubjectConfirmation elements representing two recipients (test 1 of 2, correct one first)"
		},
		"sspmod_fedlab_ExtendedSPTest__subjectconfirmation_address": {
			"name": "SP should accept a Response with a SubjectConfirmationData elements with a correct @Address attribute"
		},
		"sspmod_fedlab_ExtendedSPTest__subjectconfirmation_address_wrong": {
			"name": "SP should nnot accept a Response with a SubjectConfirmationData elements with a incorrect @Address attribute"
		},
		"sspmod_fedlab_ExtendedSPTest__subjectconfirmation_address_multiple1": {
			"name": "SP should accept a Response with multiple SubjectConfirmation elements with \/SubjectConfirmationData\/@Address-es, where one is correct  (test 1 of 2, correct one last)"
		},
		"sspmod_fedlab_ExtendedSPTest__subjectconfirmation_address_multiple2": {
			"name": "SP should accept a Response with multiple SubjectConfirmation elements with \/SubjectConfirmationData\/@Address-es, where one is correct  (test 1 of 2, correct one first)"
		},
		"sspmod_fedlab_ExtendedSPTest__subjectconfirmationdata_address_multiple1": {
			"name": "SP should accept a Response with multiple SubjectConfirmationData elements with \/SubjectConfirmationData\/@Address-es, where one is correct  (test 1 of 2, correct one last)"
		},
		"sspmod_fedlab_ExtendedSPTest__subjectconfirmationdata_address_multiple2": {
			"name": "SP should accept a Response with multiple SubjectConfirmationData elements with \/SubjectConfirmationData\/@Address-es, where one is correct  (test 1 of 2, correct one first)"
		},
		"sspmod_fedlab_ExtendedSPTest__assertion_condition_unknown": {
			"name": "SP Should not accept an assertion containing an uknown Condition"
		},
		"sspmod_fedlab_ExtendedSPTest__assertion_condition_notbefore": {
			"name": "SP should not accept a Response with a Condition with a NotBefore in the future."
		},
		"sspmod_fedlab_ExtendedSPTest__assertion_condition_expired": {
			"name": "SP should not accept a Response with a Condition with a NotOnOrAfter in the past."
		},
		"sspmod_fedlab_ExtendedSPTest__assertion_subjectconfirmationdata_expired": {
			"name": "SP should not accept a Response with a SubjectConfirmationData@NotOnOrAfter in the past"
		},
		"sspmod_fedlab_ExtendedSPTest__assertion_authnstatement_expired": {
			"name": "SP should not accept a Response with a AuthnStatement where SessionNotOnOrAfter is set in the past"
		},
		"sspmod_fedlab_ExtendedSPTest__assertion_authnstatement_missing": {
			"name": "SP should not accept a Response with a AuthnStatement missing"
		},
		"sspmod_fedlab_ExtendedSPTest__issueinstant_future": {
			"name": "SP should not accept an IssueInstant far (24 hours) into the future"
		},
		"sspmod_fedlab_ExtendedSPTest__issueinstant_past": {
			"name": "SP should not accept an IssueInstant far (24 hours) into the past"
		},
		"sspmod_fedlab_ExtendedSPTest__xsdatetime_milliseconds": {
			"name": "SP should accept xs:datetime with millisecond precision http:\/\/www.w3.org\/TR\/xmlschema-2\/#dateTime"
		},
		"sspmod_fedlab_ExtendedSPTest__xsdatetime_microseconds": {
			"name": "SP should accept xs:datetime with microsecond precision http:\/\/www.w3.org\/TR\/xmlschema-2\/#dateTime"
		},
		"sspmod_fedlab_ExtendedSPTest__assertion_audience_empty": {
			"name": "SP should not accept a Response with a Condition with a empty set of Audience."
		},
		"sspmod_fedlab_ExtendedSPTest__assertion_audience_wrong": {
			"name": "SP should not accept a Response with a Condition with a wrong Audience."
		},
		"sspmod_fedlab_ExtendedSPTest__assertion_audience_prepend": {
			"name": "SP should accept a Response with a Condition with an addition Audience prepended."
		},
		"sspmod_fedlab_ExtendedSPTest__assertion_audience_append": {
			"name": "SP should accept a Response with a Condition with an addition Audience appended."
		},
		"sspmod_fedlab_ExtendedSPTest__assertion_audience_intersect1": {
			"name": "SP should not accept multiple AudienceRestrictions where the intersection is zero. (test 1 of 2)"
		},
		"sspmod_fedlab_ExtendedSPTest__assertion_audience_intersect2": {
			"name": "SP should not accept multiple AudienceRestrictions where the intersection is zero. (test 2 of 2)"
		},
		"sspmod_fedlab_ExtendedSPTest__assertion_audience_intersect3": {
			"name": "SP should accept multiple AudienceRestrictions where the intersection includes the correct audience."
		},
		"sspmod_fedlab_ExtendedSPTest__signedassertion": {
			"name": "SP should accept that only the Assertion is signed instead of the Response."
		},
		"sspmod_fedlab_ExtendedSPTest__signedassertionandresponse": {
			"name": "SP should accept that both the Response and the Assertion is signed."
		},
		"sspmod_fedlab_ExtendedSPTest__relaystate_lost": {
			"name": "Do SP work when RelayState information is lost?"
		},
		"sspmod_fedlab_ExtendedSPTest__samlp_extensions": {
			"name": "Do SP accept an unknown Extensions element in the Response?"
		},
		"sspmod_fedlab_ExtendedSPTest__wrongnamespace": {
			"name": "SP MUST not accept response when the saml-namespace is invalid"
		},
		"sspmod_fedlab_tests_CheckRequestID__requestid": {
			"name": "SP MUST NOT re-use the same ID in subsequent requests."
		},
		"sspmod_fedlab_tests_Metadata__metadata": {
			"name": "Testing metadata content"
		},
		"sspmod_fedlab_tests_Replay__replay": {
			"name": "SP MUST NOT accept a replayed Response. An identical Response\/Assertion used a second time. [Profiles]: 4.1.4.5 POST-Specific Processing Rules (test 1 of 2: same inresponseto)"
		},
		"sspmod_fedlab_tests_Replay__replay_unsolicited": {
			"name": "SP MUST NOT accept a replayed Response. An identical Response\/Assertion used a second time. [Profiles]: 4.1.4.5 POST-Specific Processing Rules (test 2 of 2: unsolicited response)"
		},
		"sspmod_fedlab_tests_MultipleAttr__multipleattr": {
			"name": "SP SHOULD find attributes in a second AttributeStatement, not only in the first."
		},
		"sspmod_fedlab_tests_TrickySignature__trickysignature1": {
			"name": "SP SHOULD NOT accept an signed assertion embedded in an AttributeValue inside an unsigned assertion."
		},
		"sspmod_fedlab_tests_TrickySignature__trickysignature1b": {
			"name": "SP SHOULD NOT accept an signed assertion embedded in an AttributeValue inside an unsigned assertion. (Signature moved out...)"
		},
		"sspmod_fedlab_tests_TrickySignature2__trickysignature2": {
			"name": "SP SHOULD NOT accept an signed assertion, where the signature is referring to another assertion."
		},
		"sspmod_fedlab_tests_MultipleAssertions__multipleassertion1": {
			"name": "SP SHOULD find attributes in a second Assertion\/AttributeStatement, not only in one of them (test 1 of 2 - attributes in first)."
		},
		"sspmod_fedlab_tests_MultipleAssertions__multipleassertion2": {
			"name": "SP SHOULD find attributes in a second Assertion\/AttributeStatement, not only in one of them (test 2 of 2 - attributes in last)."
		},
		"sspmod_fedlab_tests_MultipleAssertions__multipleassertion3": {
			"name": "SP SHOULD NOT accept attributes in unsigned 2nd assertion. (test 1 of 2)"
		},
		"sspmod_fedlab_tests_MultipleAssertions__multipleassertion3b": {
			"name": "SP SHOULD NOT accept attributes in unsigned 2nd assertion. (test 2 of 2)"
		},
		"sspmod_fedlab_tests_MultipleAssertions__multipleassertion4": {
			"name": "SP SHOULD NOT accept authnstatement in unsigned 2nd assertion. (test 1 of 2)"
		},
		"sspmod_fedlab_tests_MultipleAssertions__multipleassertion4b": {
			"name": "SP SHOULD NOT accept authnstatement in unsigned 2nd assertion. (test 2 of 2)"
		},
		"sspmod_fedlab_tests_SLOTest__BasicSLOTest": {
			"name": "Basic SP-initated Logout Test"
		},
		"sspmod_fedlab_tests_IdPInitSLOTest__BasicIdPInitSLOTest": {
			"name": "Basic IdP-initated Logout Test"
		},
		"sspmod_fedlab_tests_IdPInitSLOTest__idpslo_badnameid": {
			"name": "SP MUST NOT accept LogoutRequest when NameID content is wrong"
		},
		"sspmod_fedlab_tests_IdPInitSLOTest__idpslo_badnameidformat": {
			"name": "SP MUST NOT accept LogoutRequest when NameID@Format is wrong"
		},
		"sspmod_fedlab_tests_IdPInitSLOTest__idpslo_badnameidspnamequalifier": {
			"name": "SP MUST NOT accept LogoutRequest when NameID@SPNameQualifier is wrong"
		},
		"sspmod_fedlab_tests_IdPInitSLOTest__idpslo_badsessionindex": {
			"name": "SP MUST NOT logout user when invalid SessionIndex is sent"
		},
		"sspmod_fedlab_tests_IdPInitSLOTest__idpslo_badissuer": {
			"name": "SP MUST NOT accept LogoutRequest when Issuer is wrong"
		},
		"sspmod_fedlab_tests_IdPInitSLOTest__idpslo_baddestination": {
			"name": "SP MUST NOT accept LogoutRequest when Destination is wrong"
		},
		"sspmod_fedlab_tests_IdPInitSLOTest__idpslo_nosignature": {
			"name": "SP MUST NOT accept unsigned LogoutRequest"
		},
		"sspmod_fedlab_tests_IdPInitSLONoCookie__idpslo_nocookie": {
			"name": "SP MUST accept LogoutRequest with sessionindex in a separate session, not relying on the session-cookie."
		},
		"sspmod_fedlab_tests_IdPInitSLONoCookie__idpslo_nosessionindex": {
			"name": "SP MUST accept an LogoutRequest with no sessionindex (sent in separate session, no session-cookies)"
		},
		"sspmod_fedlab_tests_IdPInitSLONoCookie__idpslo_sessionindexTwo1": {
			"name": "SP MUST accept an LogoutRequest with two sesionindexes (first valid) (sent in separate session, no session-cookies)"
		},
		"sspmod_fedlab_tests_IdPInitSLONoCookie__idpslo_sessionindexTwo2": {
			"name": "SP MUST accept an LogoutRequest with two sesionindexes (second valid) (sent in separate session, no session-cookies)"
		},
		"sspmod_fedlab_tests_SessionFixtation__sessionfix": {
			"name": "Session fixtation check"
		},
		"sspmod_fedlab_tests_LogoutBeforeAssertion__LogoutBeforeAssertion": {
			"name": "This test sends IdP initiated LogoutRequest to SP before the authn Response."
		}
	}