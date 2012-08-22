<?php

$this->data['header'] = 'Federation Lab';
$this->data['hideLanguageBar'] = TRUE;
$this->data['jquery'] = array('version' => '1.8', 'core' => TRUE, 'ui' => TRUE, 'css' => TRUE);
$this->data['head']  = '<link rel="stylesheet" type="text/css" href="/' . $this->data['baseurlpath'] . 'module.php/fedlab/style.css" />' . "\n";
$this->data['head']  .= '<script type="text/javascript" src="/' . $this->data['baseurlpath'] . 'module.php/fedlab/res/fedlab.js" ></script>' . "\n";

$this->data['head'] .= <<<EOF
	<style type="text/css">
		#testSelection label { text-align: left; width: 100%; margin: 2px}	
		#testSelection label div.testheader { font-size: 110%; margin: 0px; font-weight: bold}
		#testSelection label div.testdescription { font-size: 85%; color: #333; margin: 0px; }
	</style>
EOF;


$this->includeAtTemplateBase('includes/header.php');

echo('<div id="tabs">');
echo('<ul>');
echo(' <li><a href="#configure">Configure your SP</a></li>');
echo(' <li><a href="#register">Register your SP</a></li>');
echo(' <li><a href="#prepare">Prepare for testing</a></li>');
echo(' <li><a href="#tests">Running tests</a></li>');
echo('</ul>');

echo('<div id="configure">');
echo('<h1>Register Federation Lab Metadata at your Service Provider</h1>');

echo('<p>Configure your Service Provider to trust the IdP metadata below: ');
echo('<pre>' . htmlspecialchars($this->data['metadata']) . '</pre>');

echo('<p style="margin: 10px 2px 0px 2px">If your service provider prefers to load the metadata from an URL instead, use this url: <ul><li><code>' . htmlspecialchars($this->data['metaurl']) . '</code></li></ul></p>');

echo('<p><button id="toRegisterBtn">I\'m done. Let me register my SP »</button></p>');

echo('</div>');



echo('<div id="register">');
echo('<h1>Post metadata for your Service Provider</h1>');

echo('<form method="post" action="prestart.php">');
echo('<p>Paste in SAML 2.0 XML Metadata for the entity that you would like to add.</p>');
echo('<textarea id="xmlmetadata" style="height: 200px; width: 90%; border: 1px solid #aaa;" cols="50" rows="5" name="xmlmetadata">' . htmlspecialchars($this->data['xmldata']) . '</textarea>');
echo('<p>Enter an URL on the Service Provider that will initiate authentication with this IdP (without interaction):</p>');
echo('<input id="initurl" type="name" style="display: block; width: 90%; margin-top: .5em; border: 1px solid #aaa" name="initurl" value="' . htmlspecialchars($this->data['initurl']). '" />');

echo('<p>Enter an URL on the Service Provider that will initiate single logout (SP-initiated SAML 2.0 logout):</p>');
echo('<input id="initslo" type="name" style="display: block; width: 90%; margin-top: .5em; border: 1px solid #aaa" name="initslo" value="' . htmlspecialchars($this->data['initslo']). '" />');

echo('</form>');

echo('<p><button id="verifyBtn">Verify SP conncetivity »</button></p>');

echo('<div id="error-message" style="display: none" title="Verification error">
	<p>
		<span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 50px 0;"></span>
		An error occured when trying to perform a basic test of Single Sign-On to your Service Provider.
	</p>
	<p id="error-message-content">
	</p>
</div>');

echo('</div>');


echo('<div id="prepare">
	<div id="testSelection">
		<input type="checkbox" id="check1" /><label for="check1">SAML 2.0 Core: Verifying input metadata</label>
		<input type="checkbox" id="check2" /><label for="check2">SAML 2.0 Core: Verifying the Authentication Request</label>
		<input type="checkbox" id="check3" /><label for="check3">SAML 2.0 Core: Basic testing Response and Assertion</label>
		<input type="checkbox" id="check4" /><label for="check4">SAML 2.0 Core: Extended testing Response and Assertion</label>
		<input type="checkbox" id="check5" /><label for="check5">saml2int Compliance</label>


	</div>
	<p>Note: The selection above is not yet enabled. Currently (this is a developer version) all tests will be executed.</p>
	
	<p><button id="startBtn">Start tests</button></p>

</div>');

echo('<div id="tests">');

echo('<div id="teststatus">
		<div id="outerprogressbar" class="animated">
			<div id="progressbar"></div>
		</div>
		
		<div class="resultSelection">
			<button type="checkbox" id="collapsedebug">Collapse debug</button>
			<button type="checkbox" id="expanddebug">Expand debug</button>
			
			<div id="restypes" style="margin:0; padding0; display: inline">
				<input type="checkbox" id="success" /><label for="success">Success (<span id="countSuccess">0</span>)</label>
				<input type="checkbox" checked="checked" id="errors" /><label for="errors">Errors (<span id="countErrors">0</span>)</label>
				<input type="checkbox" checked="checked" id="warnings" /><label for="warnings">Warnings (<span id="countWarnings">0</span>)</label>
				<input type="checkbox" id="notices" /><label for="notices">Notices (<span id="countNotices">0</span>)</label>
			</div>
		</div>
		
		<!-- 
		 <div id="inprogress"><img style="display: inline" src="/' . $this->data['baseurlpath'] . 'resources/progress.gif"> Running tests, stay tuned!</div>
		 <div id="completed">Tests completed.</div> 
		-->
	</div>');
echo('<div id="testresult"></div>');
echo('</div>');




echo('</div>');


$this->includeAtTemplateBase('includes/footer.php');

