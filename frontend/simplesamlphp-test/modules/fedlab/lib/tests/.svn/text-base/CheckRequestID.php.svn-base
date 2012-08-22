<?php

class sspmod_fedlab_tests_CheckRequestID extends sspmod_fedlab_BasicSPTest {


	
	protected function register() {
		$this->testruns = array(
			'requestid' => 'SP MUST NOT re-use the same ID in subsequent requests.',
		);
	}
	
	public function run($testrun) {

		$this->crawler->reset();
		
		// Get authentication request
		$result = $this->crawler->getURLraw($this->initurl);
		if (!isset($result['Request'])) throw new Exception('Initiation URL did not return a authentication request');		
		$firstID = $result['Request']->getId();

		$this->crawler->reset();

		$result2 = $this->crawler->getURLraw($this->initurl);
		if (!isset($result2['Request'])) throw new Exception('Initiation URL did not return a authentication request');		
		$secondID = $result2['Request']->getId();

		if ($firstID == $secondID) {
			$this->setResult(sspmod_fedlab_Tester::STATUS_FATAL, $testrun, $testrun, $this->testruns[$testrun], 'Test failed. Same ID used again [' . $firstID . ']');
		} else {
			$this->setResult(sspmod_fedlab_Tester::STATUS_OK, $testrun, $testrun, $this->testruns[$testrun], 'Test succeeded [' . $firstID . '] does not match [' . $secondID . ']');
		}

		return $this->flushResults();
	}


}


