#!/usr/bin/env php
<?php

/* This is the base directory of the simpleSAMLphp installation. */
$baseDir = dirname(dirname(dirname(dirname(dirname(__FILE__)))));

echo 'base: ' . $baseDir . "\n"; exit;

/* Add library autoloader. */
require_once($baseDir . '/lib/_autoload.php');

if (count($argv) < 1) {
	echo "Wrong number of parameters. Run:   " . $argv[0] . " [install,show] url [branch]\n"; exit;
}

// Needed in order to make session_start to be called before output is printed.
$session = SimpleSAML_Session::getInstance();
$config = SimpleSAML_Configuration::getConfig('config.php');


$action = $argv[1];
