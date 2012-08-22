<?php

class sspmod_fedlab_tests_Replay extends sspmod_fedlab_BasicSPTest {


	
	protected function register() {
		$this->testruns = array(
			'replay' => 'SP MUST NOT accept a replayed Response. An identical Response/Assertion used a second time. [Profiles]: 4.1.4.5 POST-Specific Processing Rules (test 1 of 2: same inresponseto)',
			'replay_unsolicited' => 'SP MUST NOT accept a replayed Response. An identical Response/Assertion used a second time. [Profiles]: 4.1.4.5 POST-Specific Processing Rules (test 2 of 2: unsolicited response)',

		);
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
		
		$this->crawler->reset();

		// Sent response again... and get web page as result
		$result = $this->crawler->sendResponse($samlResponse['url'], $samlResponse['Response'], $samlResponse['RelayState']);
		
		// Check output
		$debugoutput = $this->getDebugOutput($testrun, $result['body'], $requestRaw, $samlResponse['RelayState'], $samlResponse['Response']);
		$this->expectedResult($testrun, $result['body'], $debugoutput);

		return $this->flushResults();
	}

	protected function getInResponseToAssertion($testrun, $default) {
		if ($testrun === 'replay_unsolicited') return NULL;
		return $default;
	}
	protected function getInResponseToResponse($testrun, $default) {
		if ($testrun === 'replay_unsolicited') return NULL;
		return $default;
	}

	
	protected function expectedResult($testrun, $body, $debugoutput) {
		
		switch($testrun) {

			case 'replay_unsolicited': 
			case 'replay': 
					
				if ($this->containsName($body)) {
					$this->setResult(sspmod_fedlab_Tester::STATUS_FATAL, $testrun, $testrun, $this->testruns[$testrun], 'Test succeeded' . $debugoutput);
				} else {
					$this->setResult(sspmod_fedlab_Tester::STATUS_OK, $testrun, $testrun, $this->testruns[$testrun], 'Test did not succeed' . $debugoutput);
				}
				break;
		
		}
	}

}


