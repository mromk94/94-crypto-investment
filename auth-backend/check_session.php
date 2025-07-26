<?php
// check_session.php: Verifies if the current session is valid and has admin privileges
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Set custom session name before starting the session
session_name('TONSUI_SESSION');

// Configure session parameters
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on');
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_samesite', 'Lax');

// Start or resume the session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Include the database configuration
require_once 'db.php';

// Ensure database connection is established
if (!isset($pdo)) {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
    } catch (PDOException $e) {
        // Log the error
        error_log('Database connection failed: ' . $e->getMessage());
        
        // Return a proper error response
        header('Content-Type: application/json');
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Database connection failed',
            'error' => $e->getMessage()
        ], JSON_PRETTY_PRINT);
        exit;
    }
}

// Debug function to log session and request data
function logDebugInfo($data) {
    $logFile = __DIR__ . '/../logs/session_debug.log';
    $logDir = dirname($logFile);
    
    // Ensure logs directory exists
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $logMessage = '[' . date('Y-m-d H:i:s') . '] ';
    if (is_string($data)) {
        $logMessage .= $data;
    } else {
        // Use available JSON constants based on PHP version
        $options = defined('JSON_PRETTY_PRINT') ? JSON_PRETTY_PRINT : 0;
        $options |= defined('JSON_UNESCAPED_SLASHES') ? JSON_UNESCAPED_SLASHES : 0;
        $logMessage .= json_encode($data, $options);
    }
    $logMessage .= "\n\n";
    
    file_put_contents($logFile, $logMessage, FILE_APPEND);
}

// Log request details for debugging
logDebugInfo([
    'timestamp' => date('c'),
    'request_method' => $_SERVER['REQUEST_METHOD'],
    'request_uri' => $_SERVER['REQUEST_URI'] ?? '',
    'headers' => getallheaders(),
    'cookies' => $_COOKIE,
    'session' => $_SESSION,
    'session_id' => session_id(),
    'session_name' => session_name(),
    'session_status' => session_status(),
    'session_cookie_params' => session_get_cookie_params()
]);

function respond($success, $message = '', $data = []) {
    $response = [
        'success' => $success,
        'message' => $message,
        'timestamp' => date('c'),
        'session' => [
            'id' => session_id(),
            'name' => session_name(),
            'status' => session_status(),
            'is_active' => session_status() === PHP_SESSION_ACTIVE,
            'user_id' => $_SESSION['user_id'] ?? null,
            'is_admin' => $_SESSION['admin_logged_in'] ?? false,
            'last_activity' => $_SESSION['last_activity'] ?? null
        ]
    ];
    
    if ($data) {
        $response['data'] = $data;
    }
    
    // Log the response for debugging
    logDebugInfo([
        'response' => $response,
        'session_data' => $_SESSION
    ]);
    
    // Set JSON response headers
    header('Content-Type: application/json');
    
    // Use available JSON encoding options based on PHP version
    $options = 0;
    if (defined('JSON_PRETTY_PRINT')) {
        $options |= JSON_PRETTY_PRINT;
    }
    if (defined('JSON_UNESCAPED_SLASHES')) {
        $options |= JSON_UNESCAPED_SLASHES;
    }
    
    echo json_encode($response, $options);
    exit;
}

// Check if user is logged in
if (!isset($_SESSION['user_id']) || !isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    respond(false, 'Not logged in', [
        'session_status' => session_status(),
        'session_id' => session_id(),
        'session_name' => session_name(),
        'session_data' => $_SESSION,
        'cookies' => $_COOKIE,
        'request_headers' => getallheaders()
    ]);
}

// Check if user is an admin
$isAdmin = isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;

// Get user data from database
$stmt = $pdo->prepare('SELECT id, username, email, created_at FROM users WHERE id = ?');
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    // User not found in database, invalidate session
    session_destroy();
    respond(false, 'User not found');
}

// If user is an admin, get admin data
$adminData = null;
if ($isAdmin) {
    $stmt = $pdo->prepare('SELECT * FROM admins WHERE id = ?');
    $stmt->execute([$_SESSION['admin_id']]);
    $adminData = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$adminData) {
        // Admin data not found, remove admin privileges
        unset($_SESSION['admin_logged_in'], $_SESSION['admin_id'], $_SESSION['admin_username'], $_SESSION['admin_email']);
        $isAdmin = false;
    }
}

// Return session data
respond(true, 'Session is valid', [
    'user' => $user,
    'is_admin' => $isAdmin,
    'admin' => $isAdmin ? $adminData : null,
    'session' => [
        'session_id' => session_id(),
        'session_data' => [
            'user_id' => $_SESSION['user_id'],
            'username' => $_SESSION['username'] ?? null,
            'email' => $_SESSION['email'] ?? null,
            'is_admin' => $isAdmin,
            'admin_id' => $_SESSION['admin_id'] ?? null,
            'admin_username' => $_SESSION['admin_username'] ?? null,
            'admin_email' => $_SESSION['admin_email'] ?? null
        ]
    ]
]);
