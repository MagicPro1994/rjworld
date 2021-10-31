<?php
/**
 * Enables or disables filtering for cross domain requests.
 * Recommended value: true
 */
define('CSAJAX_FILTERS', true);

/**
 * If set to true, $valid_requests should hold only domains i.e. a.example.com, b.example.com, usethisdomain.com
 * If set to false, $valid_requests should hold the whole URL ( without the parameters ) i.e. http://example.com/this/is/long/url/
 * Recommended value: false (for security reasons - do not forget that anyone can access your proxy)
 */
define('CSAJAX_FILTER_DOMAIN', true);

/**
 * Enables or disables Expect: 100-continue header. Some webservers don't
 * handle this header correctly.
 * Recommended value: false
 */
define('CSAJAX_SUPPRESS_EXPECT', false);

/**
 * Set debugging to true to receive additional messages - really helpful on development
 */
define('CSAJAX_DEBUG', false);

/**
 * A set of valid cross domain requests
 */
$valid_requests = array(
    'hk4e-api-os.mihoyo.com',
    'hk4e-api.mihoyo.com',
    'bbs-api-os.mihoyo.com',
);

/**
 * Set extra multiple options for cURL
 * Could be used to define CURLOPT_SSL_VERIFYPEER & CURLOPT_SSL_VERIFYHOST for HTTPS
 * Also to overwrite any other options without changing the code
 * See http://php.net/manual/en/function.curl-setopt-array.php
 */
$curl_options = array(
    // CURLOPT_SSL_VERIFYPEER => false,
    // CURLOPT_SSL_VERIFYHOST => 2,
);

$ignore_headers = array(
    'Content-Length',
    'Content-Type',
);

/* * * STOP EDITING HERE UNLESS YOU KNOW WHAT YOU ARE DOING * * */

// identify request headers
$request_headers = array();
$bypass_headers = array();
foreach ($_SERVER as $key => $value) {
    if (strpos($key, 'HTTP_') === 0 || strpos($key, 'CONTENT_') === 0) {
        $headername = str_replace('_', ' ', str_replace('HTTP_', '', $key));
        $headername = str_replace(' ', '-', ucwords(strtolower($headername)));
        if (!in_array($headername, array('Host', 'X-Proxy-Url'))) {
            if (!in_array($headername, $ignore_headers)) {
                $request_headers[] = "$headername: $value";
            } else {
                $bypass_headers[$headername] = "$headername: $value";
            }
        }
    }
}

// identify request method, url and params
$request_method = $_SERVER['REQUEST_METHOD'];
if ('GET' == $request_method) {
    $request_params = $_GET;
} elseif ('POST' == $request_method) {
    $request_params = $_POST;
    if (empty($request_params)) {
        $data = file_get_contents('php://input');
        if (!empty($data)) {
            $request_params = $data;
        }
    }
} elseif ('PUT' == $request_method || 'DELETE' == $request_method) {
    $request_params = file_get_contents('php://input');
} else {
    $request_params = null;
}

$cs_url = isset($_REQUEST['cs_url']) ? $_REQUEST['cs_url'] : "";
$cs_decode = isset($_REQUEST['cs_decode']) ? $_REQUEST['cs_decode'] : false;
$cs_cookie = isset($_REQUEST['cs_cookie']) ? $_REQUEST['cs_cookie'] : "";

if (true == CSAJAX_DEBUG) {
    var_dump("REQUEST PARAMS: ", $request_params);
}

// Custom request
if ($request_method !== 'GET' && isJson($request_params) && !empty($request_params)) {
    $cs_params = json_decode($request_params, true);
    if (isset($cs_params['cs_url'])) {
        $cs_url = $cs_params['cs_url'];
        unset($cs_params['cs_url']);
    }
    if (isset($cs_params['cs_decode'])) {
        $cs_decode = $cs_params['cs_decode'];
        unset($cs_params['cs_decode']);
    }
    if (isset($cs_params['cs_cookie'])) {
        $cs_cookie = $cs_params['cs_cookie'];
        unset($cs_params['cs_cookie']);
    }
    if (isset($cs_params['cs_data'])) {
        $cs_data = $cs_params['cs_data'];
        unset($cs_params['cs_data']);
    }
}

if (!isset($cs_data)) {
    // Add back ignore headers when not custom request
    foreach ($bypass_headers as $key => $value) {
        $request_headers[] = $value;
    }
}

// Get URL from `cs_url` in GET or POST data, before falling back to X-Proxy-URL header.
if ($cs_url !== "") {
    $request_url = $cs_decode ? urldecode($cs_url) : $cs_url;
} elseif (isset($_SERVER['HTTP_X_PROXY_URL'])) {
    $request_url = $cs_decode ? urldecode($_SERVER['HTTP_X_PROXY_URL']) : $_SERVER['HTTP_X_PROXY_URL'];
} else {
    header($_SERVER['SERVER_PROTOCOL'] . ' 404 Not Found');
    header('Status: 404 Not Found');
    $_SERVER['REDIRECT_STATUS'] = 404;
    exit;
}

$p_request_url = parse_url($request_url);
parse_str($p_request_url['query'], $p_query_url);

// Rebase url
$base_url = isset($p_request_url['scheme']) ? $p_request_url['scheme'] . '://' : '';
$base_url .= isset($p_request_url['user']) ? $p_request_url['user'] . ($p_request_url['pass'] ? ':' . $p_request_url['pass'] : '') . '@' : '';
$base_url .= isset($p_request_url['host']) ? $p_request_url['host'] : '';
$base_url .= isset($p_request_url['port']) ? ':' . $p_request_url['port'] : '';
$base_url .= isset($p_request_url['path']) ? $p_request_url['path'] : '';

// Rebase params
foreach ($p_query_url as $q_key => $q_value) {
    $request_params[$q_key] = $q_value;
}

if (is_array($request_params)) {
    // cs_url may exist in GET request methods
    if (array_key_exists('cs_url', $request_params)) {
        unset($request_params['cs_url']);
    }
    // cs_encode may exist in GET request methods
    if (array_key_exists('cs_decode', $request_params)) {
        unset($request_params['cs_decode']);
    }
    // cs_cookie may exist in GET request methods
    if (array_key_exists('cs_cookie', $request_params)) {
        unset($request_params['cs_cookie']);
    }
}

// ignore requests for proxy :)
if (preg_match('!' . $_SERVER['SCRIPT_NAME'] . '!', $request_url) || empty($request_url) || count($p_request_url) == 1) {
    csajax_debug_message('Invalid request - make sure that cs_url variable is not empty');
    exit;
}

// check against valid requests
if (CSAJAX_FILTERS) {
    $parsed = $p_request_url;
    if (CSAJAX_FILTER_DOMAIN) {
        if (!in_array($parsed['host'], $valid_requests)) {
            csajax_debug_message('Invalid domain - ' . $parsed['host'] . ' does not included in valid requests');
            exit;
        }
    } else {
        if (!in_array($base_url, $valid_requests)) {
            csajax_debug_message('Invalid domain - ' . $request_url . ' does not included in valid requests');
            exit;
        }
    }
}

csajax_debug_message("BEFORE APPEND QUERY REQUEST URL: " . $request_url . PHP_EOL);
if (true == CSAJAX_DEBUG) {
    var_dump("REQUEST PARAMS: ", $request_params);
}
// append query string for GET requests
if ($request_method == 'GET' && count($request_params) > 0) {
    $request_url = $base_url . '?' . http_build_query($request_params);
}

csajax_debug_message("FINAL REQUEST URL: " . $request_url . PHP_EOL);

// let the request begin
$ch = curl_init($request_url);

if ($cookie !== "") {
    array_push($request_headers, 'Cookie: ' . $cs_cookie);
}

// Suppress Expect header
if (CSAJAX_SUPPRESS_EXPECT) {
    array_push($request_headers, 'Expect:');
}

curl_setopt($ch, CURLOPT_HTTPHEADER, $request_headers); // (re-)send headers
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // return response
curl_setopt($ch, CURLOPT_HEADER, true); // enabled response headers
// add data for POST, PUT or DELETE requests
if ('POST' == $request_method) {
    if (isset($cs_data)) {
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($cs_data));
    } else {
        $post_data = is_array($request_params) ? http_build_query($request_params) : $request_params;
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
    }
    if (true == CSAJAX_DEBUG) {
        print "isset " . isset($cs_data) . PHP_EOL;
        var_dump("POST DATA: ", $post_data);
        var_dump("CS DATA: ", $cs_data);
        var_dump("HEADERS: ", $request_headers);
    }
} elseif ('PUT' == $request_method || 'DELETE' == $request_method) {
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $request_method);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $request_params);
}

// Set multiple options for curl according to configuration
if (is_array($curl_options) && 0 <= count($curl_options)) {
    curl_setopt_array($ch, $curl_options);
}

// retrieve response (headers and content)
$response = curl_exec($ch);
if ($response === false) {
    csajax_debug_message('Curl error: ' . curl_error($ch));
}
curl_close($ch);

// split response to header and content
list($response_headers, $response_content) = preg_split('/(\r\n){2}/', $response, 2);

// (re-)send the headers
$response_headers = preg_split('/(\r\n){1}/', $response_headers);
foreach ($response_headers as $key => $response_header) {
    // Rewrite the `Location` header, so clients will also use the proxy for redirects.
    if (preg_match('/^Location:/', $response_header)) {
        list($header, $value) = preg_split('/: /', $response_header, 2);
        $response_header = 'Location: ' . $_SERVER['REQUEST_URI'] . '?cs_url=' . $value;
    }
    if (!preg_match('/^(Transfer-Encoding):/', $response_header)) {
        header($response_header, false);
    }
}

// finally, output the content
if (true == CSAJAX_DEBUG) {
    print "RESPONSE CONTENT: " . PHP_EOL . $response_content;
} else {
    print($response_content);
}

function csajax_debug_message($message)
{
    if (true == CSAJAX_DEBUG) {
        print $message . PHP_EOL;
    }
}

function isJson($string)
{
    json_decode($string);
    return json_last_error() === JSON_ERROR_NONE;
}
