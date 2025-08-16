<?php
/**
 * Unified Session Initialization
 * 
 * Provides consistent session setup for all endpoints
 */

// Prevent direct access
if (!defined('TONSUI_LOADED')) {
    header('HTTP/1.0 403 Forbidden');
    echo 'Forbidden';
    exit;
}

// Set consistent session parameters
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', true);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_samesite', 'None'); // For cross-domain support

// Set consistent session name
session_name('TONSUI_SESSION');

// Start or resume session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
    
    // Regenerate session ID periodically to prevent fixation
    if (empty($_SESSION['created_at'])) {
        session_regenerate_id(true);
        $_SESSION['created_at'] = time();
        $_SESSION['last_activity'] = time();
    }
    
    // Set session timeout (30 minutes)
    $timeout = 1800; // 30 minutes in seconds
    if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > $timeout)) {
        // Session expired, destroy it
        session_unset();
        session_destroy();
        session_start();
        $_SESSION['created_at'] = time();
    }
    
    // Update last activity time
    $_SESSION['last_activity'] = time();
}

/**
 * Check if a user is logged in
 * 
 * @return bool True if user is logged in, false otherwise
 */
function isUserLoggedIn() {
    return isset($_SESSION['user_id']) && isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;
}

/**
 * Check if current user is an admin
 * 
 * @return bool True if user is an admin, false otherwise
 */
function isUserAdmin() {
    return isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;
}

/**
 * Require user to be logged in
 * 
 * @param bool $returnJson Whether to return JSON response (true) or redirect (false)
 * @return void
 */
function requireLogin($returnJson = true) {
    if (!isUserLoggedIn()) {
        if ($returnJson) {
            header('Content-Type: application/json');
            http_response_code(401);
            echo json_encode([
                'success' => false, 
                'error' => 'Authentication required'
            ]);
        } else {
            // Redirect to login page
            header('Location: /login');
        }
        exit;
    }
}

/**
 * Require user to be an admin
 * 
 * @param bool $returnJson Whether to return JSON response (true) or redirect (false)
 * @return void
 */
function requireAdmin($returnJson = true) {
    requireLogin($returnJson);
    
    if (!isUserAdmin()) {
        if ($returnJson) {
            header('Content-Type: application/json');
            http_response_code(403);
            echo json_encode([
                'success' => false, 
                'error' => 'Admin privileges required'
            ]);
        } else {
            // Redirect to admin login
            header('Location: /admin/login');
        }
        exit;
    }
}
