<?php
// login.php: Handles user login for Ton Sui Mining
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: same-origin');
header('Content-Security-Policy: default-src \'self\'');

// Start or resume session with secure settings
require_once 'auth.php';
require_once 'db.php';

// Function to log security events
function logSecurityEvent($event, $userId = null, $ip = null, $userAgent = null) {
    global $pdo;
    
    $ip = $ip ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $userAgent = $userAgent ?? $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
    
    try {
        $stmt = $pdo->prepare('INSERT INTO security_logs (event_type, user_id, ip_address, user_agent, created_at) VALUES (?, ?, ?, ?, NOW())');
        $stmt->execute([$event, $userId, $ip, $userAgent]);
    } catch (Exception $e) {
        error_log('Failed to log security event: ' . $e->getMessage());
    }
}

function respond($success, $message, $user = null) {
    $resp = ['success' => $success, 'message' => $message];
    if ($user) $resp['user'] = $user;
    echo json_encode($resp);
    exit;
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);
$identity = trim($data['identity'] ?? ''); // username or email
$password = $data['password'] ?? '';

if (!$identity || !$password) {
    respond(false, 'Username/email and password are required.');
}

// Find user by username or email
$stmt = $pdo->prepare('SELECT * FROM users WHERE username = ? OR email = ?');
$stmt->execute([$identity, $identity]);
$user = $stmt->fetch();
if (!$user) {
    respond(false, 'Invalid username/email or password.');
}

// Verify password
if (!password_verify($password, $user['password'])) {
    respond(false, 'Invalid username/email or password.');
}

// Check if user is an admin
$isAdmin = false;
$adminStmt = $pdo->prepare('SELECT * FROM admins WHERE user_id = ?');
$adminStmt->execute([$user['id']]);
$adminData = $adminStmt->fetch();

if ($adminData) {
    // Set admin session variables
    $_SESSION['admin_logged_in'] = true;
    $_SESSION['admin_id'] = $adminData['id'];
    $_SESSION['admin_username'] = $adminData['username'];
    $_SESSION['admin_email'] = $adminData['email'];
    $_SESSION['last_activity'] = time();
    $isAdmin = true;
    
    // Log admin login
    logSecurityEvent('admin_login', $user['id']);
} else {
    // Log regular user login
    logSecurityEvent('user_login', $user['id']);
}

// Set user session variables
$_SESSION['user_id'] = $user['id'];
$_SESSION['username'] = $user['username'];
$_SESSION['email'] = $user['email'];
$_SESSION['login_time'] = time();
$_SESSION['user_agent'] = $_SERVER['HTTP_USER_AGENT'] ?? '';
$_SESSION['ip_address'] = $_SERVER['REMOTE_ADDR'] ?? '';

// Update last login timestamp in database
try {
    $updateStmt = $pdo->prepare('UPDATE users SET last_login = NOW() WHERE id = ?');
    $updateStmt->execute([$user['id']]);
} catch (Exception $e) {
    error_log('Failed to update last login timestamp: ' . $e->getMessage());
}

// Return success response with minimal user info
respond(true, 'Login successful', [
    'id' => $user['id'],
    'username' => $user['username'],
    'email' => $user['email'],
    'is_admin' => $isAdmin,
    'session_timeout' => 1800 // 30 minutes in seconds
]);
