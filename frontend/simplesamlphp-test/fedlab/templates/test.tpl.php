<?php

$this->data['jquery'] = array('version' => '1.8', 'core' => TRUE, 'ui' => TRUE, 'css' => TRUE);
$this->data['head']  = '<link rel="stylesheet" type="text/css" href="/' . $this->data['baseurlpath'] . 'module.php/fedlab/style.css" />' . "\n";
$this->data['head'] .= <<<EOF
<script type="text/javascript" language="JavaScript">

function shdebug(event) {
	$(this).children("div.result").show();
}

function runTest() {
	$.getJSON("testrun.php", function(json){
		for (i in json) {
			var res = json[i];
			if (res['status'] != 10) { 
				var text = "<div class=\"testresult status" + res['status']  + "\">" + 
				"<div class=\"id\">"  + res['id'] + "</div>" + 
				"<div class=\"descr\">"  + res['descr'] + "</div>";
				if (res['result'] != '') {
					text += "<div class=\"result\">" + res['result'] + "</div>";
				}
				text += "</div>";
				$("#testresult").prepend(text);
				$("#testresult div:first-child div.result").hide();
				$("#testresult div:first-child").click(shdebug);
				runTest(); 
			} else {
				$("#inprogress").hide();
				$("#completed").show();
				
			}

		}
	});

}
$(document).ready(function() {
	$("#inprogress").show();
	$("#completed").hide();
	runTest();
});
$(document).ready(runTest);

</script>
EOF;


$this->includeAtTemplateBase('includes/header.php');


echo('<h1>Testing SAML SP Behaviour</h1>');

echo('<div id="teststatus">
		<div id="inprogress"><img style="display: inline" src="/' . $this->data['baseurlpath'] . 'resources/progress.gif"> Running tests, stay tuned!</div>
		<div id="completed">Tests completed.</div>
	</div>');
echo('<div id="testresult"></div>');


echo('<p style="float: right"><a href="index.php">Test another Service Provider (re-enter metadata)</a></p>');

$this->includeAtTemplateBase('includes/footer.php');

