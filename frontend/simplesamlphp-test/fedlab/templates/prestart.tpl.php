<?php


$this->includeAtTemplateBase('includes/header.php');


echo('<h1>Federation Lab: Service Provider Compliance Testing</h1>');

echo('<p>We successfully managed to login to your Service Provider, and we are ready to start extensive testing.</p>');


echo('<h2>Choose test programme</h2>');

echo('<ul>');
echo(' <li><a href="test.php?p=all">Test SAML SP compliance</a></li>');
echo('</ul>');


echo('<p style="float: right"><a href="index.php">Test another Service Provider (re-enter metadata)</a></p>');

$this->includeAtTemplateBase('includes/footer.php');

