<?php

class sspmod_fedlab_SAMLCrawler {

	private $curl;

	function __construct() {
		$this->reset();
	}

	public function reset() {
		$this->curl = curl_init();
		curl_setopt($this->curl, CURLOPT_RETURNTRANSFER, TRUE);
		curl_setopt($this->curl, CURLOPT_FOLLOWLOCATION, FALSE);
#		curl_setopt($this->curl, CURLOPT_COOKIEFILE, '');

		// curl_setopt($this->curl, CURLOPT_COOKIEJAR, '/tmp/simplesamlphp-fedlab-test-cookies.tmp');
		// curl_setopt($this->curl, CURLOPT_COOKIEFILE, '/tmp/simplesamlphp-fedlab-test-cookies.tmp');
		
		curl_setopt($this->curl, CURLOPT_COOKIEFILE, '');
		
		curl_setopt($this->curl, CURLINFO_HEADER_OUT, TRUE);
		
		
		curl_setopt($this->curl, CURLOPT_COOKIESESSION, TRUE); 

		curl_setopt($this->curl, CURLOPT_SSL_VERIFYPEER, FALSE);
		curl_setopt($this->curl, CURLOPT_SSL_VERIFYHOST, FALSE);
		curl_setopt($this->curl, CURLOPT_HEADER, 1);
	
	}
	
	private function log($log) {
		error_log('    CRAWLER:: ' . $log);
	}


	/*
	 * Return information object
	 *
	 * array('page', 'searchForContent')
	 * array('request', )
	 */
	
	public function sendResponse($url, $response, $relayState) {
		$params = array(
			'SAMLResponse' => base64_encode($response),
			'RelayState' => $relayState,
		);
		
		$page = $this->getURLraw($url, $params, 'post');
		return $page;
	}

	/**
	 * This function requests a url with a GET request.
	 *
	 * @param $curl        The curl handle which should be used.
	 * @param $url         The url which should be requested.
	 * @param $parameters  Associative array with parameters which should be appended to the url.
	 * @return The content of the returned page.
	 */
	function getURLraw($url, $parameters = array(), $type = 'get', $maxredirs = 10) {

		if (empty($url)) throw new Exception('Trying to crawl an empty URL');
		if ($maxredirs < 0) throw new Exception('Max redirection reached...');




		$p = '';
		foreach($parameters as $k => $v) {
			if($p != '')  $p .= '&';
			$p .= urlencode($k) . '=' . urlencode($v);
		}

		switch($type) {
			case 'post':
				curl_setopt($this->curl, CURLOPT_POSTFIELDS, $p);
				curl_setopt($this->curl, CURLOPT_POST, TRUE);
				break;
				
			
			case 'get':
			default :
				if (!empty($parameters)) {
					if(strpos($url, '?') === FALSE) {
						$url .= '?' . $p;
					} else {
						$url .= '&' . $p;
					}					
				}
				curl_setopt($this->curl, CURLOPT_HTTPGET, TRUE);
		}
		
		curl_setopt($this->curl, CURLOPT_URL, $url);
		
		$this->log('Contacting URL [' . $url . ']');
		
		$response = curl_exec($this->curl);
		if($response === FALSE) {
			#echo('Failed to get url: ' . $url . "\n");
			#echo('Curl error: ' . curl_error($curl) . "\n");
			return FALSE;
		}
		
        $header_size = curl_getinfo($this->curl, CURLINFO_HEADER_SIZE);

        $result['header'] = substr( $response, 0, $header_size);
        $result['body'] = substr( $response, $header_size );
        $result['http_code'] = curl_getinfo($this->curl,CURLINFO_HTTP_CODE);
        $result['last_url'] = curl_getinfo($this->curl,CURLINFO_EFFECTIVE_URL);
		$result['headerout'] = curl_getinfo($this->curl, CURLINFO_HEADER_OUT);


		// $this->log('header out :' . $result['headerout']);

		$info = curl_getinfo($this->curl);
		$headers = self::parseHeaders($result['header']);
		
		// error_log('headers: ' . var_export($headers, TRUE));
		// error_log('headers raw: ' . var_export($result['header'], TRUE));
		// error_log('info: ' . var_export($info, TRUE));
		
		
		if (isset($headers['location'])) { 
			$nexturl = $headers['location'];
			$this->log('Location header found [' . $nexturl. ']');
			
			if (substr($nexturl, 0, 1) == '/')  {
				if (preg_match('|(http(s)?://.*?)/|', $info['url'], $matches)) {
					$nexturl = 	$matches[1] . $nexturl;
					$this->log('Constructed new URL [' . $nexturl . ']');
				}

			}


			
	#		$url = $info['url'];
			$urlp = parse_url($nexturl);

		#	echo '<p>Next url [' . $nexturl . ']';



			// If next step is server; then look for AuthnRequest...
			#error_log('Location header query part: ' . $urlp['query']);
			$this->log('Next URL host is [' . (string)$urlp['host'] . '] comparing with my host [' . (string)SimpleSAML_Utilities::getSelfHost() . ']');
			if (strcmp((string)$urlp['host'], (string)SimpleSAML_Utilities::getSelfHost()) == 0) {
				#echo "FOUND REQUEST";
				#print_r($urlp['query']); 
				$_SERVER['QUERY_STRING'] = $urlp['query'];
				$samlredir = new SAML2_HTTPRedirect();

				if (
						strstr($urlp['query'], 'SAMLRequest=') ||
						strstr($urlp['query'], 'SAMLResponse=') ) {
							
					$result['RequestRaw'] = self::getHTTPRedirectMessage();
					$result['Request'] = $samlredir->receive();

	#				$params = parse_str($urlp['query']);
					$result['RelayState'] = $result['Request']->getRelayState();
	#				$this->log('Parameters: ' . var_export($params, TRUE));
	#				if (isset($params['RelayState'])) $result['RelayState'] = $params['RelayState'];
				}
				return $result;
			}
			
			// Follow redirects
			return $this->getURLraw($nexturl, $parameters, $type, $maxredirs-1);
		}
		

		return $result;
	}
	
	
	public static function getHTTPRedirectMessage() {
		
		$data = array();
		$relayState = '';
		$sigAlg = '';
		foreach (explode('&', $_SERVER['QUERY_STRING']) as $e) {
			list($name, $value) = explode('=', $e, 2);
			$name = urldecode($name);
			$data[$name] = urldecode($value);

			switch ($name) {
			case 'SAMLRequest':
			case 'SAMLResponse':
				$sigQuery = $name . '=' . $value;
				break;
			case 'RelayState':
				$relayState = '&RelayState=' . $value;
				break;
			case 'SigAlg':
				$sigAlg = '&SigAlg=' . $value;
				break;
			}
		}

		$data['SignedQuery'] = $sigQuery . $relayState . $sigAlg;
		
		
#		echo '<pre>'; print_r($data); exit;

		if (array_key_exists('SAMLRequest', $data)) {
			$msg = $data['SAMLRequest'];
		} elseif (array_key_exists('SAMLResponse', $data)) {
			$msg = $data['SAMLResponse'];
		} else {
			throw new Exception('Missing SAMLRequest or SAMLResponse parameter.');
		}

		if (array_key_exists('SAMLEncoding', $data)) {
			$encoding = $data['SAMLEncoding'];
		} else {
			$encoding = SAML2_HTTPRedirect::DEFLATE;
		}

		$msg = base64_decode($msg);
		switch ($encoding) {
		case SAML2_HTTPRedirect::DEFLATE:
			$msg = gzinflate($msg);
			break;
		default:
			throw new Exception('Unknown SAMLEncoding: ' . var_export($encoding, TRUE));
		}
		return $msg;

	}
	
	
	public static function parseHeaders($h) {
		$headers = array();
		$hl = explode("\n", $h);
		foreach($hl AS $hline) {
			if (preg_match('/^(.+?):\s(.+)$/', $hline, $matches)) {
				$headers[strtolower($matches[1])] = trim($matches[2]);
			}
		}
		return $headers;
	}
	
	
}









?>