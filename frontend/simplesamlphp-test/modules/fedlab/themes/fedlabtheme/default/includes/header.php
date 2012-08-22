<!DOCTYPE HTML>
<?php



/**
 * Support the htmlinject hook, which allows modules to change header, pre and post body on all pages.
 */
$this->data['htmlinject'] = array(
	'htmlContentPre' => array(),
	'htmlContentPost' => array(),
	'htmlContentHead' => array(),
);


$jquery = array();
if (array_key_exists('jquery', $this->data)) $jquery = $this->data['jquery'];

if (array_key_exists('pageid', $this->data)) {
	$hookinfo = array(
		'pre' => &$this->data['htmlinject']['htmlContentPre'], 
		'post' => &$this->data['htmlinject']['htmlContentPost'], 
		'head' => &$this->data['htmlinject']['htmlContentHead'], 
		'jquery' => &$jquery, 
		'page' => $this->data['pageid']
	);
		
	SimpleSAML_Module::callHooks('htmlinject', $hookinfo);	
}
// - o - o - o - o - o - o - o - o - o - o - o - o -




?>




<html xmlns="http://www.w3.org/1999/xhtml" dir="ltr" lang="en-US">
<head profile="http://gmpg.org/xfn/11">
	<meta http-equiv="content-type" content="text/html; charset=UTF-8" />

	<title><?php
	if(array_key_exists('header', $this->data)) {
		echo $this->data['header'];
	} else {
		echo 'simpleSAMLphp';
	}
	?></title>
	
	<link rel="stylesheet" type="text/css" media="screen" href="https://www.fed-lab.org/wp-content/themes/carrington-blog/css/css.php" />

	<!--[if lte IE 7]>
		<link rel="stylesheet" href="https://www.fed-lab.org/wp-content/themes/carrington-blog/css/ie.css" type="text/css" media="screen" />
	<![endif]-->
	
	<!--[if lte IE 6]>
		<link rel="stylesheet" href="https://www.fed-lab.org/wp-content/themes/carrington-blog/css/ie6.css" type="text/css" media="screen" />

		<script type="text/javascript" src="https://www.fed-lab.org/wp-content/themes/carrington-blog/js/DD_belatedPNG.js"></script>
		<script type="text/javascript">
			DD_belatedPNG.fix('img, #header, #footer, #header .wrapper, #footer .wrapper, #TB_title, #developer-link a');
		</script>
	<![endif]-->
	
	
<script type="text/javascript" src="/<?php echo $this->data['baseurlpath']; ?>resources/script.js"></script>

<link rel="icon" type="image/icon" href="/<?php echo $this->data['baseurlpath']; ?>resources/icons/favicon.ico" />
	
<?php

if(!empty($jquery)) {
	$version = '1.5';
	if (array_key_exists('version', $jquery))
		$version = $jquery['version'];
		
	if ($version == '1.5') {
		if (isset($jquery['core']) && $jquery['core'])
			echo('<script type="text/javascript" src="/' . $this->data['baseurlpath'] . 'resources/jquery.js"></script>' . "\n");
	
		if (isset($jquery['ui']) && $jquery['ui'])
			echo('<script type="text/javascript" src="/' . $this->data['baseurlpath'] . 'resources/jquery-ui.js"></script>' . "\n");
	
		if (isset($jquery['css']) && $jquery['css'])
			echo('<link rel="stylesheet" media="screen" type="text/css" href="/' . $this->data['baseurlpath'] . 
				'resources/uitheme/jquery-ui-themeroller.css" />' . "\n");	
			
	} else if ($version == '1.6') {
		if (isset($jquery['core']) && $jquery['core'])
			echo('<script type="text/javascript" src="/' . $this->data['baseurlpath'] . 'resources/jquery-16.js"></script>' . "\n");
	
		if (isset($jquery['ui']) && $jquery['ui'])
			echo('<script type="text/javascript" src="/' . $this->data['baseurlpath'] . 'resources/jquery-ui-16.js"></script>' . "\n");
	
		if (isset($jquery['css']) && $jquery['css'])
			echo('<link rel="stylesheet" media="screen" type="text/css" href="/' . $this->data['baseurlpath'] . 
				'resources/uitheme16/ui.all.css" />' . "\n");	
	} else if ($version == '1.8') {
		if (isset($jquery['core']) && $jquery['core'])
			echo('<script type="text/javascript" src="/' . $this->data['baseurlpath'] . 'resources/jquery-1.4.2.js"></script>' . "\n");
	
		if (isset($jquery['ui']) && $jquery['ui'])
			echo('<script type="text/javascript" src="/' . $this->data['baseurlpath'] . 'resources/jquery-ui-1.8.2.js"></script>' . "\n");
	
		if (isset($jquery['css']) && $jquery['css'])
			echo('<link rel="stylesheet" media="screen" type="text/css" href="/' . $this->data['baseurlpath'] . 
				'resources/uitheme18/jquery-ui-1.8.2.custom.css" />' . "\n");
	}
}

if(!empty($this->data['htmlinject']['htmlContentHead'])) {
	foreach($this->data['htmlinject']['htmlContentHead'] AS $c) {
		echo $c;
	}
}




?>

<?php	
if(array_key_exists('head', $this->data)) {
	echo '<!-- head -->' . $this->data['head'] . '<!-- /head -->';
}
?>
	

<!-- <script type='text/javascript' src='https://www.fed-lab.org/wp-content/themes/carrington-blog/js/carrington.js?ver=1.0'></script>
<script type='text/javascript' src='https://www.fed-lab.org/wp-content/themes/carrington-blog/carrington-core/lightbox/thickbox.js?ver=1.0'></script> -->


<link rel="stylesheet" type="text/css" media="screen" href="https://www.fed-lab.org/wp-content/themes/carrington-blog/carrington-core/lightbox/css/thickbox.css" />

</head>

<?php
$onLoad = '';
if(array_key_exists('autofocus', $this->data)) {
	$onLoad .= 'SimpleSAML_focus(\'' . $this->data['autofocus'] . '\');';
}
if (isset($this->data['onLoad'])) {
	$onLoad .= $this->data['onLoad']; 
}

if($onLoad !== '') {
	$onLoad = ' onload="' . $onLoad . '"';
}
?>
<body<?php echo $onLoad; ?>>
		
	<div id="page">
		<div id="top">
			<a class="accessibility" href="#content">Skip to content</a>
		</div>
		<hr class="lofi">
		<div id="header" class="section">
			<div class="wrapper">
				<img src="https://www.fed-lab.org/wp-content/themes/carrington-blog/img/geant2.png" style="float: right"> <strong id="blog-title"><a href="https://www.fed-lab.org/" rel="home">Federation Lab</a></strong>
				<p id="blog-description">
					Techincal resources and tools for exploration of Identity Federation
				</p>

			</div><!-- .wrapper -->
		</div><!-- #header -->
		<div id="sub-header" class="section">
			<div class="wrapper">
				<div id="all-categories">
					<!-- Provided to you by GÉANT3 Identity Federations — <a href="/guides/about-geant/">read more</a> -->
					
					<a href="/">Federation Lab</a> › <?php
					if(array_key_exists('header', $this->data)) {
						echo $this->data['header'];
					} else {
						echo 'simpleSAMLphp';
					}
					?>					
			
					
					
					
				</div><!-- #list-categories -->
			</div><!-- .wrapper -->
		</div><!--#sub-header-->
		<hr class="lofi">

	
	
		<div id="main" class="section">
			<div class="wrapper">



<?php

if(!empty($this->data['htmlinject']['htmlContentPre'])) {
	foreach($this->data['htmlinject']['htmlContentPre'] AS $c) {
		echo $c;
	}
}

?>

