<?php

class sspmod_fedlab_Tester {

	const STATUS_OK = 2;
	const STATUS_ERROR = 1;
	const STATUS_FATAL = 0;
	const STATUS_INFO = 3;

	protected $idpmetadata;
	protected $metadata;
	protected $metadataXML;
	protected $initurl;
	protected $initslo;

	protected $testruns;
	protected $testrunsRemaining;
	protected $results = array();
	
	function __construct($idpmetadata, $metadata, $metadataXML, $initurl, $initslo) {
		$this->idpmetadata = $idpmetadata;
		$this->metadata = $metadata;
		$this->metadataXML = $metadataXML;
		$this->initurl = $initurl;
		$this->initslo = $initslo;

		$this->register();
		foreach($this->testruns AS $testrun => $descr) $this->testrunsRemaining[] = $testrun;
	}

	protected function log($testrun, $log) {
		error_log('   ' . get_class($this) . ' > ' . $testrun . ' |      '  . $log );
	}

	protected function register() {
		$this->testruns = array();
	}

	public function countTotal() {
		return count($this->testruns);
	}
	public function countRemaining() {
		return count($this->testrunsRemaining);
	}


	public function runNext() {
		if(empty($this->testrunsRemaining)) return NULL;
		$next = array_pop($this->testrunsRemaining);
#		try {
			$result = $this->run($next);
			return $result;			
#		} catch(Exception $e ) {
#			$this->setResult(0, get_class($this) . ':error', 'Error running test: ' . $e->getMessage());
#		}
#		return $this->flushResults();
	}
	
	protected function run($testrun) {
		return NULL;
	}
	
	protected function setResult($status, $testrun, $id, $descr = '', $result = '') {
		$this->results[$id] = array(
			'id' => $id,
			'type' => 'testresult',
			'testrun' => $testrun,
			'status' => $status,
			'descr' => $descr,
			'result' => $result, 
		);
	}
	
	protected function flushResults() {
		$results = $this->results;
		$this->results = array();
		return $results;
	}
}

