<?php

$config = SimpleSAML_Configuration::getInstance();
#$statconfig = SimpleSAML_Configuration::getConfig('module_statistics.php');
$session = SimpleSAML_Session::getInstance();
$metadata = SimpleSAML_Metadata_MetaDataStorageHandler::getMetadataHandler();


$session = SimpleSAML_Session::getInstance();
SimpleSAML_Logger::debug('test.php called');


$entityid = $_REQUEST['entityid'];

$idpm = new sspmod_fedlab_IdPMetadata($config);
$spm = new sspmod_fedlab_SPMetadata($entityid, TRUE);

header('Content-type: text/plain; char-set: utf-8');
echo('Metadata for entity [' . $entityid . ']' . "\n --------  \n");
echo($spm->xmlmetadata);

echo "\n --------  \n";

$a = $spm->parsed;
unset($a['entityDescriptor']);

print_r($a);

