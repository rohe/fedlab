<?php

class sspmod_fedlab_tests_SessionFixtation extends sspmod_fedlab_BasicSPTest {


	
	protected function register() {
		$this->testruns = array('sessionfix' => 'Session fixtation check');
	}
	
	public function run($testrun) {


		/*
		 * First do a request just to get the cookie session name
		 */
		$this->crawler->reset();
		$result = $this->crawler->getURLraw($this->initurl);
		
		if (isset($result['setCookies'])) {
			foreach($result['setCookies'] AS $c) {
				$this->log($testrun, 'Got this cookies: '. $c);				
			}
		}
		
		$sessionCookie = $result['setCookies'][0];
		if (preg_match('/(.*?)=(.*)/', $sessionCookie, $matches)) {
			$this->log($testrun, 'SessionCookie before: ' . $sessionCookie);
			$str = str_split($matches[2]);
			shuffle($str);
			$nstr = join('', $str);
			$sessionCookie = $matches[1] . '=' . $nstr;
			$this->log($testrun, 'SessionCookie after : ' . $sessionCookie);
		}
		

		
		
		
		/*
		 * Do a new login using a new session cookie (injection)
		 */
		$this->crawler->reset();
		$result = $this->crawler->getURLraw($this->initurl, array(), 'get', 10, array($sessionCookie));

		// Fail if no authentication request was made
		$this->expectAuthenticationRequest($result);

		$request = $result['Request'];
		$requestRaw = $result['RequestRaw'];
		$relaystate = $result['RelayState'];
		
		// Create Response
		$samlResponse = $this->createResponse($testrun, $request, $relaystate);
		$this->responsePrepared($samlResponse);

		// Sent response and get web page as result
		$result = $this->crawler->sendResponse($samlResponse['url'], $samlResponse['Response'], $samlResponse['RelayState'], array($sessionCookie));
		
		
		
		/*
		 * Check if valid session... when injecting cookie.
		 */
		$this->crawler->reset();
		$result2 = $this->crawler->getURLraw($this->attributeurl, array(), 'get', 10, array($sessionCookie));
		
		$this->setResult(sspmod_fedlab_Tester::STATUS_INFO, null, 'sessioncookie', 
			'Injecting cached session cookie to check for vulnerability', array($sessionCookie));

		// Check output
		$debugoutput = $this->getDebugOutput($testrun, $result2['body'], $requestRaw, $samlResponse['RelayState'], $samlResponse['Response']);

		
		$this->expectedResult($testrun, $result2['body'], $debugoutput);		
		
		return $this->flushResults();
	}
	
 	protected function expectedResult($testrun, $body, $debugoutput) {

		if (strstr($body, 'andreas@uninett.no')) {
			$this->setResult(sspmod_fedlab_Tester::STATUS_FATAL, $testrun, $testrun, $this->testruns[$testrun], $debugoutput);			
		} else {
			$this->setResult(sspmod_fedlab_Tester::STATUS_OK, $testrun, $testrun, $this->testruns[$testrun], $debugoutput);
		}

	}

	
	
}


