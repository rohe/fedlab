<?php

$config = SimpleSAML_Configuration::getInstance();
$metadata = SimpleSAML_Metadata_MetaDataStorageHandler::getMetadataHandler();


$idpm = new sspmod_fedlab_IdPMetadata($config);

header('Content-type: text/plain; charset=utf-8');
echo($idpm->getMetadata());


// $t->data['metaurl'] = SimpleSAML_Utilities::selfURLNoQuery() . '?output=xml';
// Metadata for Identiyt PRovider
// $t->data['metadata'] = $metaxml;
// Metadata for Service Provider
// $t->data['spmetadata'] = $metadataraw;