<?php

$config = SimpleSAML_Configuration::getInstance();
$metadata = SimpleSAML_Metadata_MetaDataStorageHandler::getMetadataHandler();

if (!isset($_REQUEST['entityid'])) {
	SimpleSAML_Utilities::redirect('https://www.fed-lab.org/service-provider-tools/service-provider-testing/');
}
$entityid = $_REQUEST['entityid'];

$idpm = new sspmod_fedlab_IdPMetadata($config);
$spm = new sspmod_fedlab_SPMetadata($entityid, TRUE);

$t = new SimpleSAML_XHTML_Template($config, 'fedlab:fedlab.tpl.php');
// Entity ID for Service Provider
$t->data['entityid'] = $entityid;
$t->show();


// $t->data['metaurl'] = SimpleSAML_Utilities::selfURLNoQuery() . '?output=xml';
// Metadata for Identiyt PRovider
// $t->data['metadata'] = $metaxml;
// Metadata for Service Provider
// $t->data['spmetadata'] = $metadataraw;