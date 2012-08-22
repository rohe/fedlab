<?php

class sspmod_fedlab_TestProgramme {

	protected $config;
	protected $testers;
	protected $results;
	
	protected $idpmetadata; 
	protected $metadata;
	protected $metadataXML;
	protected $initurl;
	protected $initslo;
	protected $attributeurl;
	
	function __construct($config, $idpmetadata, $metadata, $metadataXML, $initurl, $initslo, $attributeurl) {
		$this->config = $config;
		
		if (
			empty($idpmetadata) ||
			empty($metadata) ||
			empty($metadataXML) ||
			empty($initurl) ||
			empty($attributeurl)
			) {
				throw new Exception('Invalid input for sspmod_fedlab_TestProgramme');
		}
		
		$this->idpmetadata = $idpmetadata;
		$this->metadata = $metadata;
		$this->metadataXML = $metadataXML;
		$this->initurl = $initurl;
		$this->initslo = $initslo;
		$this->attributeurl = $attributeurl;
		
		$this->prepare();
	}
	
	protected function prepare() {
		foreach($this->config AS $ct) {
			$this->testers[] = new $ct($this->idpmetadata, $this->metadata, $this->metadataXML, $this->initurl, $this->initslo, $this->attributeurl);
		}
	}

	public function stat() {
		$total = 0; $remaining = 0;
		foreach($this->testers AS $tester) {
			$total += $tester->countTotal();
			$remaining += $tester->countRemaining();
		}
		return array(
			'type' => 'stat',
			'total' => $total,
			'remaining' => $remaining,
			'percentage' => 100 - floor($remaining*100/$total),
		);
	}
	
	public function runNext() {

		
		foreach($this->testers AS $tester) {
			$result = $tester->runNext();
			if (!empty($result)) {
				$this->results[] = $result;
				return $result;
			}
		}
		return NULL;
	}
	
	protected function getResults() {
		return $this->results;
	}
	
}
