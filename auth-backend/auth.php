<?php
/**
 * Authentication and authorization functions
 */

// Start session with secure settings if not already started
if (session_status() === PHP_SESSION_NONE) {
    // Set secure session parameters
    ini_set('session.cookie_httponly', 1);
    ini_set('session.cookie_secure', isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on');
    ini_set('session.use_only_cookies', 1);
    ini_set('session.cookie_samesite', 'Strict');
    
    // Set session name to something custom
    session_name('TONSUI_SESSION');
    
    // Start the session
    session_start();
    
    // Regenerate session ID to prevent session fixation
    if (empty($_SESSION['last_activity'])) {
        session_regenerate_id(true);
        $_SESSION['last_activity'] = time();
    }
    
    // Set session timeout (30 minutes)
    $timeout = 1800; // 30 minutes in seconds
    if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > $timeout)) {
        // Last request was more than 30 minutes ago
        session_unset();
        session_destroy();
        session_start();
    }
    $_SESSION['last_activity'] = time(); // Update last activity time
}

// Global database connection
$pdo = null;

/**
 * Check if a user is logged in
 * 
 * @return bool True if user is logged in, false otherwise
 */
function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

/**
 * Check if the current user is an admin
 * 
 * @param int $userId The user ID to check
 * @return bool True if user is an admin, false otherwise
 */
function isAdmin($userId) {
    global $pdo;
    
    // If no database connection, return false
    if (!$pdo) {
        return false;
    }
    
    try {
        $stmt = $pdo->prepare('SELECT is_admin FROM users WHERE id = ?');
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $user && $user['is_admin'] == 1;
    } catch (PDOException $e) {
        error_log('Database error in isAdmin: ' . $e->getMessage());
        return false;
    }
}

/**
 * Get the current user's ID
 * 
 * @return int|null The user ID if logged in, null otherwise
 */
function getCurrentUserId() {
    return $_SESSION['user_id'] ?? null;
}

/**
 * Require admin access
 * 
 * If the current user is not an admin, this function will send a 403 Forbidden
 * response and terminate execution.
 */
function requireAdmin() {
    if (!isLoggedIn() || !isAdmin(getCurrentUserId())) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Forbidden']);
        exit;
    }
}

// Initialize database connection
function initAuth() {
    global $pdo, $config;
    
    // Load config if not already loaded
    if (!isset($config)) {
        $config = require __DIR__ . '/config.php';
    }
    
    if ($pdo === null) {
        try {
            $dsn = "mysql:host={$config['db_host']}";
            if (isset($config['db_port'])) {
                $dsn .= ";port={$config['db_port']}";
            }
            $dsn .= ";dbname={$config['db_name']};charset=utf8mb4";
            
            $pdo = new PDO(
                $dsn,
                $config['db_user'],
                $config['db_pass'],
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );
        } catch (PDOException $e) {
            error_log('Database connection error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Database connection failed']);
            exit;
        }
    }
    
    return $pdo;
}

// Initialize the database connection when this file is included
initAuth();
