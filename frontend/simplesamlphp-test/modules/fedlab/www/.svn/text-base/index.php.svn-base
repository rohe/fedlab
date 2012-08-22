<?php

$config = SimpleSAML_Configuration::getInstance();
#$statconfig = SimpleSAML_Configuration::getConfig('module_statistics.php');
$session = SimpleSAML_Session::getInstance();
$metadata = SimpleSAML_Metadata_MetaDataStorageHandler::getMetadataHandler();



$idpentityid = SimpleSAML_Utilities::getBaseURL() . 'module.php/fedlab';
$metaArray = array(
	'metadata-set' => 'saml20-idp-remote',
	'entityid' => $idpentityid,
	'SingleSignOnService' => SimpleSAML_Utilities::getBaseURL() . 'module.php/fedlab/SingleSignOnService.php',
	'SingleLogoutService' => SimpleSAML_Utilities::getBaseURL() . 'module.php/fedlab/SingleLogoutService.php',
#	'certFingerprint' => $certFingerprint,
	'certificate' => 'server.crt',
);
$metaArrayConfig = SimpleSAML_Configuration::loadFromArray($metaArray);
$certInfo = SimpleSAML_Utilities::loadPublicKey($metaArrayConfig, TRUE);


$metaBuilder = new SimpleSAML_Metadata_SAMLBuilder($idpentityid);
$metaBuilder->addMetadataIdP20($metaArray);
$metaBuilder->addOrganizationInfo($metaArray);
$metaBuilder->addContact('technical', array(
	'emailAddress' => $config->getString('technicalcontact_email', NULL),
	'name' => $config->getString('technicalcontact_name', NULL),
));
$metaxml = $metaBuilder->getEntityDescriptorText();

if (isset($_REQUEST['xmlmetadata'])) 
	$session->setData('fedlab', 'xmlmetadata', $_REQUEST['xmlmetadata']);
if (isset($_REQUEST['initurl'])) 
	$session->setData('fedlab', 'initurl', $_REQUEST['initurl']);
if (isset($_REQUEST['initslo'])) 
	$session->setData('fedlab', 'initslo', $_REQUEST['initslo']);



$xmldata = $session->getData('fedlab', 'xmlmetadata');
$initurl = $session->getData('fedlab', 'initurl');
$initslo = $session->getData('fedlab', 'initslo');

if (isset($_REQUEST['output']) && $_REQUEST['output'] == 'xml') {
	header('Content-type: text/xml');
	echo $metaxml;
	exit;
}


$t = new SimpleSAML_XHTML_Template($config, 'fedlab:fedlab.tpl.php');
$t->data['xmldata'] = $xmldata;
$t->data['initurl'] = $initurl;
$t->data['initslo'] = $initslo;
$t->data['metadata'] = $metaxml;
$t->data['metaurl'] = SimpleSAML_Utilities::selfURLNoQuery() . '?output=xml';
$t->show();



