<?php
/**
 * Authentication and authorization functions
 */

// Add CORS // Define TONSUI_LOADED constant to prevent direct access to session_init.php
define('TONSUI_LOADED', true);

// Include centralized session initialization
require_once __DIR__ . '/session_init.php';

// CRITICAL: Set // Headers for CORS
// CRITICAL: Allow origin with credentials
$allowed_origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $allowed_origin");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Global variables
$config = null;
$pdo = null;

// Load configuration if not already loaded
if ($config === null) {
    $config = require __DIR__ . '/config.php';
}

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

/**
 * Check if a user is logged in
 * 
 * @return bool True if user is logged in, false otherwise
 */
function isLoggedIn() {
    return isset($_SESSION['user_id']) ? true : false;
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
        // Check if the user is in the admins table with is_admin=1
        $stmt = $pdo->prepare('SELECT is_admin FROM admins WHERE id = ? AND is_admin = 1');
        $stmt->execute([$userId]);
        $admin = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Return true if found in admins table with is_admin=1
        return ($admin !== false);
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
    return isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
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
    if ($config === null) {
        $configPath = __DIR__ . '/config.php';
        if (!file_exists($configPath)) {
            error_log('Config file not found at: ' . $configPath);
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Configuration file not found']);
            exit;
        }
        
        $config = require $configPath;
        
        if (!is_array($config)) {
            error_log('Config file does not return an array');
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Invalid configuration format']);
            exit;
        }
        
        // Check for required database config parameters
        $requiredParams = ['db_host', 'db_name', 'db_user'];
        foreach ($requiredParams as $param) {
            if (!isset($config[$param])) {
                error_log('Missing required config parameter: ' . $param);
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Missing required configuration: ' . $param]);
                exit;
            }
        }
        
        // Default db_pass to empty string if not provided
        if (!isset($config['db_pass'])) {
            $config['db_pass'] = '';
        }
    }
    
    if ($pdo === null) {
        try {
            // Log connection attempt
            error_log("Attempting to connect to database: host={$config['db_host']}, name={$config['db_name']}, user={$config['db_user']}");
            
            // First test connection without database name
            $testDsn = "mysql:host={$config['db_host']}";
            if (isset($config['db_port'])) {
                $testDsn .= ";port={$config['db_port']}";
            }
            
            try {
                $testPdo = new PDO(
                    $testDsn,
                    $config['db_user'],
                    $config['db_pass'],
                    [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_TIMEOUT => 5, // 5 second timeout
                    ]
                );
                
                error_log("Basic database connection successful, testing database existence");
                
                // Check if database exists
                $stmt = $testPdo->query("SHOW DATABASES LIKE '{$config['db_name']}'");
                if ($stmt->rowCount() === 0) {
                    error_log("Database {$config['db_name']} does not exist");
                    http_response_code(500);
                    echo json_encode(['success' => false, 'error' => "Database {$config['db_name']} does not exist. Please complete installation."]);
                    exit;
                }
            } catch (PDOException $e) {
                // Error connecting to server, might be invalid credentials
                error_log("Database server connection error: " . $e->getMessage());
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Database server connection error: ' . $e->getMessage()]);
                exit;
            }
            
            // Now connect with the database name included
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
            
            // Check if admins table exists
            try {
                $stmt = $pdo->query("SELECT 1 FROM admins LIMIT 1");
                error_log("Admins table exists and is accessible");
            } catch (PDOException $e) {
                error_log("Admins table check failed: " . $e->getMessage());
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Database schema incomplete. Please complete installation.']);
                exit;
            }
            
            return $pdo;
        } catch (PDOException $e) {
            error_log('Database connection error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Database connection failed: ' . $e->getMessage()]);
            exit;
        }
    }
    
    return $pdo;
}

// Initialize the database connection when this file is included
initAuth();
