<?php




$config = SimpleSAML_Configuration::getInstance();
$session = SimpleSAML_Session::getInstance();




$metainput = file_get_contents("php://stdin", "r");




SimpleSAML_Logger::debug('ajax-testrun.php called');

$testprogramme = $session->getData('fedlab', 'testprogramme');


$result = $testprogramme->runNext();
if (is_null($result)) {
	$result = array(
		array('type' => 'completed')
	);
}
$session->setData('fedlab', 'testprogramme', $testprogramme);

$result[] = $testprogramme->stat();

echo json_encode($result);

#error_log('testrun : ' . var_export($result, TRUE));





$idpm = new sspmod_fedlab_IdPMetadata($config);
$spm = new sspmod_fedlab_SPMetadata($_REQUEST['entityid']);

$spm->debug();