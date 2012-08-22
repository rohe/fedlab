
stat = {
	'success': 0,
	'errors': 0,
	'notices': 0,
	'warnings': 0,
};

function getData() {
	var metadata = {
		'xmlmetadata': $("textarea#xmlmetadata").val(),
		'initurl': $("input#initurl").val(),
		'initslo': $("input#initslo").val(),
	};
	return metadata;
}

function initiateVerify() {
	$.ajax({
		url: "ajax-verify.php",
		dataType: 'json',
		type: 'POST',
		data: getData(),
		success: receiveVerify
	});
	return false;
}

function receiveVerify(data) {
	if (data.status == 'success') {
		$("#tabs").tabs({
			'disabled': [3],
			'selected': 2
		});
	}
	if(data.status == 'error') {
		$("#error-message-content").html(data.message);
		$("#error-message").dialog({
			modal: true,
			buttons: {
				Ok: function() {
					$(this).dialog('close');
				}
			}
		});
	}
}

function initiateTests() {
	
	// Switch to the tabs presenting test results
	$("#tabs" ).tabs({
		'disabled': undefined,
		'selected': 3
	});
	
	// Run the first test.
	runTest();

	return false;
}

function setTestResult(res) {
	var text = "<div class=\"testresult status" + res['status']  + "\">" + 
	// "<div class=\"id\">"  + res['id'] + "</div>" + 
	"<div class=\"descr\">"  + res['descr'] + "</div>";
	if (res['result'] != '') {
		text += "<div class=\"result\">" + res['result'] + "</div>";
	}
	text += "</div>";
	$("#testresult").prepend(text);
	$("#testresult div:first-child div.result").hide();
	$("#testresult div:first-child").click(shdebug);

	switch(res['status']) {
		case 0: stat.errors++; break;
		case 1: stat.warnings++; break;
		case 2: stat.success++; break;
		case 3: stat.notices++; break;	
	}
	updateResultTypeSelection();
	updateStats();
}

function updateResultTypeSelection() {
	
	$("input:checkbox#errors").is(':checked') ? $("div.testresult.status0").show() : $("div.testresult.status0").hide();
	$("input:checkbox#warnings").is(':checked') ? $("div.testresult.status1").show() : $("div.testresult.status1").hide();
	$("input:checkbox#notices").is(':checked') ? $("div.testresult.status3").show() : $("div.testresult.status3").hide();
	$("input:checkbox#success").is(':checked') ? $("div.testresult.status2").show() : $("div.testresult.status2").hide();

}

function updateStats() {
	$("span#countErrors").html(stat.errors);
	$("span#countWarnings").html(stat.warnings);
	$("span#countNotices").html(stat.notices);
	$("span#countSuccess").html(stat.success);
}


function receiveTestResult(data) {
	for (i in data) {
		switch(data[i].type) {
			case 'testresult':
				setTestResult(data[i]);
				runTest(); 
				break;
			
			case 'stat':
				$("#progressbar").progressbar("value", data[i].percentage);
				break;
			
			case 'completed' :
				$("#inprogress").hide();
				$("#completed").show();
				// $("#outerprogressbar").removeClass("animated");
				$("#outerprogressbar").hide();
				break;
		}
	}
}

function shdebug(event) {
	$(this).children("div.result").show();
}

function runTest() {
	$.ajax({
		url: "ajax-testrun.php",
		dataType: 'json',
		type: 'POST',
		data: getData(),
		success: receiveTestResult
	});
}




$(document).ready(function() {

	var tabs = $("#tabs" ).tabs({
		'disabled': [2,3],
		'selected': 0
	});

	$("#toRegisterBtn").button({
			icons: {primary:'ui-icon-circle-check'}
		}).click(function() {
			tabs.tabs('select', 1);
		});

	$("#verifyBtn").button(	{
			icons: {primary:'ui-icon-transferthick-e-w'}
		}).click(initiateVerify);

	$("#startBtn").button(	{
			icons: {primary:'ui-icon-circle-triangle-e'}
		}).click(initiateTests);

	
	$("#testSelection input").button();


	$("#restypes").buttonset();
	$("#collapsedebug").button();
	$("#expanddebug").button();
	
	$("#restypes #success").click(updateResultTypeSelection);
	$("#restypes #errors").click(updateResultTypeSelection);
	$("#restypes #warnings").click(updateResultTypeSelection);
	$("#restypes #notices").click(updateResultTypeSelection);
	
	$("#collapsedebug").click(function() { $("div.testresult div.result").hide(); });
	$("#expanddebug").click(function() { $("div.testresult div.result").show(); });


		
	$("#progressbar").progressbar({value: 0});


});
