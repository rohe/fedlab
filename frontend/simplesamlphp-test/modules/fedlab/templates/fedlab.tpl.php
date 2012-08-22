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
		
		@media print {
			div#configure, div#register, div#prepare, ul.ui-tabs-nav {
				display: none;
			}
			#wrap {
				margin: 0px;
				padding: 2px;
			}

			div.testresult {
				page-break-after:always;
			}
		}
		
	</style>
EOF;


$this->includeAtTemplateBase('includes/header.php');

echo('<form style="display: none">');
echo('<input type="hidden" id="entityid" name="entityid" value="' . htmlspecialchars($this->data['entityid']) . '" />');
echo('</form>');


echo('<div id="tabs">');
echo('<ul>');
echo(' <li><a href="#configure">Configure your Service Provider</a></li>');
echo(' <li><a href="#prepare">Connectivity Tests</a></li>');
echo(' <li><a href="#tests">Running tests</a></li>');
echo('</ul>');

echo('<div id="configure">

	<h1>Prepare for Automated Service Provider Testing</h1>

	<p>You have selected to do automated testing of this entity:</p>
	<pre><code>' . htmlspecialchars($this->data['entityid']) . '</code></pre>
	
	<p>[ <a href="https://www.fed-lab.org/service-provider-tools/service-provider-testing/">select another service provider to test</a> ]</p>

	<p>It is important that you have configured this entity to trust the Federation Lab Identity Provider metadata feed.</p>
	
	<p>The automated testing tool extracts the following parameters from the metadata:</p>
	
	<p><button id="toConnect">Start the connectivity test »</button></p>
	
	<div id="error-message" style="display: none" title="Verification error">
		<p>
			<span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 50px 0;"></span>
			An error occured when trying to perform a basic test of Single Sign-On to your Service Provider.
		</p>
		<p id="error-message-content">
		</p>
	</div><!-- #error-message -->
	
	<h2>Instructions on specific parameters required in metadata</h2>
	
	<p>The <i>initialise single sign-on URL</i> should without user interaction send the user to the testing tool with an HTTP-REDIRECT Authentication Request.</p>

	<p>The <i>attribute viewer URL</i> should if the user is already authenticated .</p>

	<p>The <i>initialise single logout URL</i> should without user interaction initiate Single Logout form the service provider without user interaction. Sending a HTTP-REDIRECT LogoutRequest.</p>
	

</div><!-- #configure -->
');


echo('<div id="prepare">
<!--	<div id="testSelection">
		<input type="checkbox" id="check1" /><label for="check1">SAML 2.0 Core: Verifying input metadata</label>
		<input type="checkbox" id="check2" /><label for="check2">SAML 2.0 Core: Verifying the Authentication Request</label>
		<input type="checkbox" id="check3" /><label for="check3">SAML 2.0 Core: Basic testing Response and Assertion</label>
		<input type="checkbox" id="check4" /><label for="check4">SAML 2.0 Core: Extended testing Response and Assertion</label>
		<input type="checkbox" id="check5" /><label for="check5">saml2int Compliance</label>


	</div> --><!-- #testselection -->
	<p>Great! We just successfully ran through a very basic Single Sign-On test that verified that your Service Provider is correcly configured to run through the rest of the test cases.</p>
	
	<p><button id="startBtn">Start tests</button></p>

</div><!-- #prepare -->');

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
	</div> <!-- #teststatus -->');
echo('<div id="testresult"></div>');
echo('</div><!-- #tests -->');




echo('</div><!-- #Tabs -->');


$this->includeAtTemplateBase('includes/footer.php');

