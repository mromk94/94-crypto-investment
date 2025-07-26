<?php
// logout.php: Handles user logout for Ton Sui Mining with secure session cleanup
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

// Start or resume session with secure settings
require_once 'auth.php';
require_once 'db.php';

// Log the logout event if user was logged in
$userId = $_SESSION['user_id'] ?? null;
$username = $_SESSION['username'] ?? 'unknown';
$isAdmin = isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'];

// Log the logout event
if ($userId) {
    try {
        // Log the logout event in security logs
        $stmt = $pdo->prepare('INSERT INTO security_logs (event_type, user_id, ip_address, user_agent, created_at) 
                              VALUES (?, ?, ?, ?, NOW())');
        $eventType = $isAdmin ? 'admin_logout' : 'user_logout';
        $stmt->execute([
            $eventType,
            $userId,
            $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
        ]);
    } catch (Exception $e) {
        error_log('Failed to log logout event: ' . $e->getMessage());
    }
}

// Clear all session variables
$_SESSION = [];

// Delete the session cookie
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        [
            'expires' => time() - 42000,
            'path' => $params['path'],
            'domain' => $params['domain'],
            'secure' => $params['secure'],
            'httponly' => true,
            'samesite' => 'Strict'
        ]
    );
}

// Destroy the session
if (session_status() === PHP_SESSION_ACTIVE) {
    session_destroy();
}

// Clear any existing output buffers
while (ob_get_level()) {
    ob_end_clean();
}

// Set no-cache headers to prevent caching of the logout response
header_remove('Pragma');
header_remove('Expires');
header_remove('Last-Modified');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0, post-check=0, pre-check=0');
header('Pragma: no-cache');

// Return success response
echo json_encode([
    'success' => true, 
    'message' => 'Logout successful.',
    'redirect' => '/login'  // Client-side should handle the redirect
]);

exit;
