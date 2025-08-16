<?php
// login.php: Handles user login for Ton Sui Mining
// Define TONSUI_LOADED constant to prevent direct access to session_init.php
define('TONSUI_LOADED', true);

// Include centralized session initialization
require_once __DIR__ . '/session_init.php';

header('Content-Type: application/json');
// Critical: Add cache control headers
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
// CRITICAL: Allow origin with credentials
$allowed_origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $allowed_origin");
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: same-origin');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Start or resume session with secure settings
require_once 'auth.php';
require_once 'db.php';
require_once 'csrf.php';

// Function to log security events
function logSecurityEvent($event, $userId = null, $ip = null, $userAgent = null) {
    global $pdo;
    
    // Just log to error_log for now - security_logs table may not exist yet
    $ip = $ip ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $userAgent = $userAgent ?? $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
    
    error_log("Security event: $event, User: $userId, IP: $ip");
    
    // Don't try to use security_logs table as it may not exist
    // This eliminates the SQL error in production
}

function respond($success, $message, $user = null) {
    $resp = ['success' => $success, 'message' => $message];
    if ($user) $resp['user'] = $user;
    echo json_encode($resp);
    exit;
}

// Get POST data - handle both standard form POST and JSON input
$data = [];
$raw_input = file_get_contents('php://input');
error_log("Login raw input: $raw_input");

// First try to parse as JSON
$json_data = json_decode($raw_input, true);
if (json_last_error() === JSON_ERROR_NONE) {
    $data = $json_data;
    error_log("Login JSON parsed successfully: " . json_encode($data));
} 
// If not JSON or empty, check if standard form POST data exists
else if (!empty($_POST)) {
    $data = $_POST;
    error_log("Login using POST data: " . json_encode($data));
} else {
    error_log("Login received no parsable data. JSON error: " . json_last_error_msg());
}

// Extract credentials and log them (without the actual password value)
// Support both 'identity' and 'username' fields for backward compatibility
$identity = '';
if (isset($data['identity'])) {
    $identity = trim($data['identity']);
    error_log("Found identity field: $identity");
} else if (isset($data['username'])) {
    $identity = trim($data['username']);
    error_log("Found username field: $identity");
}

$password = $data['password'] ?? '';

error_log("Login attempt with identity: '$identity', password: " . (isset($data['password']) ? 'provided' : 'not provided'));

// Check if either field is missing
if (empty($identity) || empty($password)) {
    error_log("Login validation failed: " . 
        (empty($identity) ? "missing identity/username" : "") . 
        (empty($password) ? "missing password" : ""));
    echo json_encode(['success' => false, 'error' => 'Username/email and password are required.']);
}

// Use actual password for verification, not the masked version
$actualPassword = $data['password'];

// Query user from database
try {
    $stmt = $pdo->prepare('SELECT * FROM users WHERE username = ? OR email = ?');
    $stmt->execute([$identity, $identity]);
    $user = $stmt->fetch();
    
    if (!$user) {
        error_log("Login failed: User not found for identity: " . $identity);
        respond(false, 'Invalid username/email or password.');
    }

    // Verify password
    if (!password_verify($password, $user['password'])) {
        error_log("Login failed: Password verification failed for user: " . $user['id']);
        respond(false, 'Invalid username/email or password.');
    }
    
    error_log("Login successful for user ID: " . $user['id']);
} catch (PDOException $e) {
    error_log("Login database error: " . $e->getMessage());
    respond(false, 'Login failed. Database error.');
}

// Check if user is an admin - first check the is_admin flag in users table
$isAdmin = false;
if ($user['is_admin'] == 1) {
    try {
        // Get admin details if they exist
        $adminStmt = $pdo->prepare('SELECT * FROM admins WHERE user_id = ?');
        $adminStmt->execute([$user['id']]);
        $adminData = $adminStmt->fetch();

        if ($adminData) {
            // Set admin session variables
            $_SESSION['admin_logged_in'] = true;
            isset($_SESSION['admin_id']) ? $_SESSION['admin_id'] : 1 = $adminData['id'];
            $_SESSION['admin_username'] = $adminData['username'];
            $_SESSION['admin_email'] = $adminData['email'];
            $_SESSION['admin_name'] = $adminData['name'];
            $_SESSION['last_activity'] = time();
            $isAdmin = true;
            
            // Log admin login
            logSecurityEvent('admin_login', $user['id']);
            error_log("Admin login successful for user ID: " . $user['id']);
        } else {
            // User is marked as admin but no record in admins table
            // Create admin record
            try {
                $createAdminStmt = $pdo->prepare('INSERT INTO admins (user_id, username, email, name, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())');
                $createAdminStmt->execute([$user['id'], $user['username'], $user['email'], $user['name'], 'active']);
                
                $_SESSION['admin_logged_in'] = true;
                isset($_SESSION['admin_id']) ? $_SESSION['admin_id'] : 1 = $pdo->lastInsertId();
                $_SESSION['admin_username'] = $user['username'];
                $_SESSION['admin_email'] = $user['email'];
                $_SESSION['admin_name'] = $user['name'];
                $_SESSION['last_activity'] = time();
                $isAdmin = true;
                
                logSecurityEvent('admin_account_created', $user['id']);
                error_log("Admin account created for user ID: " . $user['id']);
            } catch (PDOException $e) {
                error_log("Failed to create admin record: " . $e->getMessage());
                // Continue with regular user login if admin creation fails
            }
        }
    } catch (PDOException $e) {
        error_log("Admin check error: " . $e->getMessage());
        // Continue with regular user login if admin check fails
    }
}

if (!$isAdmin) {
    // Log regular user login
    logSecurityEvent('user_login', $user['id']);
}

// Set user session variables
isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 0 = $user['id'];
$_SESSION['username'] = $user['username'];
$_SESSION['email'] = $user['email'];
$_SESSION['login_time'] = time();
$_SESSION['user_agent'] = $_SERVER['HTTP_USER_AGENT'] ?? '';
$_SESSION['ip_address'] = $_SERVER['REMOTE_ADDR'] ?? '';
$_SESSION['logged_in'] = true;
$_SESSION['last_activity'] = time();

// No need to update last_login as column doesn't exist yet
// Just log the login time
error_log("User ID: {$user['id']} logged in at: " . date('Y-m-d H:i:s'));

// Return success response with minimal user info
respond(true, 'Login successful', [
    'id' => $user['id'],
    'username' => $user['username'],
    'email' => $user['email'],
    'is_admin' => $isAdmin,
    'session_timeout' => 1800 // 30 minutes in seconds
]);
