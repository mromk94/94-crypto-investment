<?php
/**
 * Admin Login Endpoint
 * 
 * Handles authentication for admin users with robust error handling
 */

// This must execute before any possible error occurs
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        // Define TONSUI_LOADED constant to prevent direct access to session_init.php
define('TONSUI_LOADED', true);

// Include centralized session initialization
require_once __DIR__ . '/session_init.php';

header('Content-Type: application/json');
// Critical: Add cache control headers
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Fatal error: ' . $error['message'] . ' in ' . $error['file'] . ' on line ' . $error['line']
        ]);
    }
});

// Standard error handling
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/admin_error.log');

// Set headers first to ensure they're sent even if there's an error
header('Content-Type: application/json');
// Critical: Add cache control headers
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
// CRITICAL: Allow origin with credentials
$allowed_origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $allowed_origin");
header('Access-Control-Allow-Methods: POST, GET, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Function to safely return JSON response
function returnJson($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

// Error handler to ensure we always return JSON
function jsonErrorHandler($errno, $errstr, $errfile, $errline) {
    error_log("PHP Error: [$errno] $errstr in $errfile on line $errline");
    returnJson(['success' => false, 'error' => 'Server error: ' . $errstr], 500);
    return true; // Don't execute PHP's internal error handler
}

// Set custom error handler
set_error_handler('jsonErrorHandler');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    returnJson(['success' => true]);
}

// Start a session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Function to get database connection
function getDbConnection() {
    try {
        $configPath = __DIR__ . '/config.php';
        if (!file_exists($configPath)) {
            throw new Exception("Config file not found at {$configPath}");
        }
        
        $config = require_once $configPath;
        if (!is_array($config)) {
            throw new Exception("Config file does not return an array");
        }
        
        $dsn = "mysql:host={$config['db_host']};dbname={$config['db_name']};charset=utf8mb4";
        if (isset($config['db_port'])) {
            $dsn .= ";port={$config['db_port']}";
        }
        
        return new PDO(
            $dsn,
            $config['db_user'],
            $config['db_pass'],
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]
        );
    } catch (Exception $e) {
        error_log("DB Connection Error: " . $e->getMessage());
        throw $e; // Rethrow to be caught by the main try/catch
    }
}

// Main processing logic - always wrapped in try/catch to ensure JSON output
try {
    // Login request (POST)
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Get the JSON data from the request body
        $jsonInput = file_get_contents('php://input');
        if ($jsonInput === false) {
            throw new Exception('Failed to read request body');
        }
        
        error_log('Raw request body: ' . $jsonInput);
        $data = json_decode($jsonInput, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON input: ' . json_last_error_msg());
        }
        
        error_log('Processing admin login POST request for username: ' . ($data['username'] ?? 'not provided'));
        
        // Validate required fields
        if (empty($data['username']) || empty($data['password'])) {
            returnJson(['success' => false, 'error' => 'Username and password are required'], 400);
        }
    
        $username = $data['username'];
        $password = $data['password'];
        
        // Get database connection
        $pdo = getDbConnection();
        
        // Query admin from database
        $stmt = $pdo->prepare("SELECT * FROM admins WHERE username = ?");
        $stmt->execute([$username]);
        $admin = $stmt->fetch(PDO::FETCH_ASSOC);
        
        error_log('Admin query executed for username: ' . $username . ', found: ' . ($admin ? 'yes' : 'no'));
        
        if (!$admin) {
            // Admin not found
            error_log('Admin not found: ' . $username);
            returnJson(['success' => false, 'error' => 'Invalid username or password'], 401);
        }
        
        // Debug the password hash
        error_log('Stored password hash: ' . ($admin['password'] ?? 'not found'));
        
        // Check if password is correct
        if (password_verify($password, $admin['password'])) {
            // Set session variables
            isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 0 = $admin['id'];
            $_SESSION['admin_logged_in'] = true;
            $_SESSION['admin_username'] = $admin['username'];
    
            // Return success with admin data (excluding password)
            unset($admin['password']);
            
            $response = [
                'success' => true,
                'message' => 'Login successful',
                'admin' => $admin
            ];
            
            error_log('Admin login successful for: ' . $username);
            returnJson($response);
        } else {
            // Invalid credentials
            error_log('Password verification failed for admin: ' . $username);
            returnJson(['success' => false, 'error' => 'Invalid username or password'], 401);
        }
    }
    
    // Check admin session status (GET)
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
            try {
                // Get database connection
                $pdo = getDbConnection();
                
                // Get admin info from database
                $stmt = $pdo->prepare("SELECT id, username, name, email FROM admins WHERE id = ?");
                $stmt->execute([isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 0]);
                $admin = $stmt->fetch(PDO::FETCH_ASSOC);
    
                if ($admin) {
                    returnJson([
                        'success' => true,
                        'loggedIn' => true,
                        'admin' => $admin
                    ]);
                } else {
                    // Admin not found in database but session exists
                    returnJson([
                        'success' => true,
                        'loggedIn' => true,
                        'admin' => [
                            'id' => isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 0,
                            'username' => $_SESSION['admin_username']
                        ]
                    ]);
                }
            } catch (Exception $e) {
                returnJson([
                    'success' => false,
                    'loggedIn' => false,
                    'error' => 'Server error: ' . $e->getMessage()
                ], 500);
            }
        } else {
            returnJson([
                'success' => false,
                'loggedIn' => false,
                'error' => 'Not authenticated'
            ], 401);
        }
    }
    
    // Logout admin (DELETE)
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        // Destroy session
        session_unset();
        session_destroy();
    
        returnJson([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }
    
    // If we get here, method not allowed
    returnJson([
        'success' => false,
        'error' => 'Method not allowed'
    ], 405);
    
} catch (PDOException $e) {
    // Database error
    error_log('Database error in admin login: ' . $e->getMessage());
    returnJson(['success' => false, 'error' => 'Database error: ' . $e->getMessage()], 500);
} catch (Exception $e) {
    // Other errors
    error_log('Unexpected error in admin login: ' . $e->getMessage());
    returnJson(['success' => false, 'error' => 'Server error: ' . $e->getMessage()], 500);
}
