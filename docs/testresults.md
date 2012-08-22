# Test results
# Format for result output from test CLI scripts




## Result codes


Test flow:

  * (1) Succeeded
  * (2) Warning (less significant errors)
  * (3) Error
  * (4) Critical
  * (5) User interaction needed
  	* With html body + url



Test item:

  * (0) Informational
  * (1) Succeed
  * (2) Warning (less significant errors)
  * (3) Error
  * (4) Critical


## Result of verify.

	{ status: 1,
	  tests: 
	   [ { status: 0,
	       message: [Object],
	       id: 'check',
	       name: 'Provider Configuration Response' },
	     { status: 1,
	       url: 'https://www.kodtest.se:8088/registration',
	       id: 'check-http-response',
	       name: 'Checks that the HTTP response status is within the 200 or 300 range' },
	     { status: 0,
	       message: '{"client_secret": "d2fec0d8f3095424d7f3299ad73c02276085253ba64c16371c248f2c", "expires_at": 1339676301, "client_id": "qFl2EzXzaAyx"}',
	       id: 'check',
	       name: 'Registration Response' },
	     { status: 1,
	       id: 'check_content_type_header',
	       name: 'Verify that the content-type header is what it should be.' },
	     { status: 1,
	       url: 'https://www.kodtest.se:8088/registration',
	       response_type: 'RegistrationResponse',
	       id: 'response-parse',
	       name: 'Parsing the response' },
	     { status: 1,
	       id: 'check-response-type',
	       name: 'Checks that the asked for response type are among the supported' },
	     { status: 1,
	       url: 'https://www.kodtest.se:8088/authorization?nonce=dummy_nonce&state=STATE0&redirect_uri=https%3A%2F%2Fbridge.uninett.no%2Fauthz_cb&response_type=code&client_id=qFl2EzXzaAyx&scope=openid',
	       id: 'check-http-response',
	       name: 'Checks that the HTTP response status is within the 200 or 300 range' },
	     { status: 1,
	       url: 'https://www.kodtest.se:8088/authenticated',
	       id: 'check-http-response',
	       name: 'Checks that the HTTP response status is within the 200 or 300 range' },
	     { status: 1,
	       url: 'https://www.kodtest.se:8088/authenticated',
	       response_type: 'AuthorizationResponse',
	       id: 'response-parse',
	       name: 'Parsing the response' },
	     { status: 1,
	       id: 'check-authorization-response',
	       name: 'Verifies an Authorization response. This is additional constrains besides what is optional or required.' } ],
	  id: 'oic-verify' }


In addition `debug` property can be used for error log.

	{
		"status": 4,
		"tests": [{
			"status": 4,
			"message": ["Traceback (most recent call last):\n", "  File \"/usr/local/lib/python2.6/dist-packages/oictest-0.1.1-py2.6.egg/oictest/base.py\", line 172, in run_sequence\n    part = req(environ, trace, url, response, content, features)\n", "  File \"/usr/local/lib/python2.6/dist-packages/oictest-0.1.1-py2.6.egg/oictest/opfunc.py\", line 364, in __call__\n    result = self.function(environ[\"client\"], response, content, **_args)\n", "  File \"/usr/local/lib/python2.6/dist-packages/oictest-0.1.1-py2.6.egg/oictest/oic_operations.py\", line 599, in discover\n    pcr = client.provider_config(issuer)\n", "  File \"/usr/local/lib/python2.6/dist-packages/oic-0.3.0-py2.6.egg/oic/oic/__init__.py\", line 708, in provider_config\n    r = self.http_request(url)\n", "  File \"/usr/local/lib/python2.6/dist-packages/oic-0.3.0-py2.6.egg/oic/oauth2/__init__.py\", line 693, in http_request\n    r = requests.request(method, url, **_kwargs)\n", "  File \"build/bdist.linux-i686/egg/requests/api.py\", line 39, in request\n    return s.request(method=method, url=url, **kwargs)\n", "  File \"build/bdist.linux-i686/egg/requests/sessions.py\", line 203, in request\n    r.send(prefetch=prefetch)\n", "  File \"build/bdist.linux-i686/egg/requests/models.py\", line 480, in send\n    conn = self._poolmanager.connection_from_url(url)\n", "  File \"build/bdist.linux-i686/egg/requests/packages/urllib3/poolmanager.py\", line 89, in connection_from_url\n    scheme, host, port = get_host(url)\n", "  File \"build/bdist.linux-i686/egg/requests/packages/urllib3/connectionpool.py\", line 579, in get_host\n    raise LocationParseError(\"Failed to parse: %s\")\n", "LocationParseError: (LocationParseError(...), 'Failed to parse: Failed to parse: %s')\n"],
			"id": "exception",
			"name": "A runtime exception"
		}],
		"id": "oic-verify",
		"debug": "0.003502 ======================================================================\n0.003636 <-- FUNCTION: discover\n0.003665 <-- ARGS: {'features': {u'key_export': True, u'use_nonce': True, u'registration': True, u'sessionmanagement': True, u'discovery': True}, 'location': '', '_trace_': <oictest.base.Trace object at 0x8b367cc>, 'issuer': u'https://www.kodtest.se:2222sdfsdf'}\n"
	}

