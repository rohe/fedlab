<?php

class sspmod_fedlab_Tester {

	const STATUS_OK = 1;
	const STATUS_ERROR = 2;
	const STATUS_FATAL = 3;
	const STATUS_INFO = 0;

	protected $unique = array();

	protected $idpmetadata;
	protected $metadata;
	protected $metadataXML;
	protected $initurl;
	protected $initslo;
	protected $attributeurl;

	protected $testruns;
	protected $testrunsRemaining;
	protected $results = array();
	
	function __construct($idpmetadata, $metadata, $metadataXML, $initurl, $initslo, $attributeurl) {
		$this->idpmetadata = $idpmetadata;
		$this->metadata = $metadata;
		$this->metadataXML = $metadataXML;
		$this->initurl = $initurl;
		$this->initslo = $initslo;
		$this->attributeurl = $attributeurl;

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

	public function getFlows() {
		return $this->testruns;
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

		if (!isset($this->unique[$id])) {
			$this->unique[$id] = 0;
		} else {
			++$this->unique[$id];
			$id = $id . '-' . $this->unique[$id];
		}

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

