<?php
// register.php: Handles user registration for Ton Sui Mining
// Enable detailed error logging for production debugging
ini_set('display_errors', 0); // Don't output errors to browser in production
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/register_error.log');

try {
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
    
    // Log request details
    $request_time = date('Y-m-d H:i:s');
    $request_ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $request_method = $_SERVER['REQUEST_METHOD'] ?? 'unknown';
    $request_body = file_get_contents('php://input');
    error_log("[$request_time] [$request_ip] [$request_method] Registration request received: $request_body");
    
    // Handle preflight OPTIONS request
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
    
    // Ensure auth.php is included for session handling
    error_log("[$request_time] Loading required files");
    require_once 'auth.php';
    require_once 'db.php';
    require_once 'csrf.php';
    error_log("[$request_time] Required files loaded successfully");
} catch (Exception $e) {
    error_log('Registration fatal error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Internal server error']);
    exit;
}

function respond($success, $message, $code = 200) {
    http_response_code($code);
    echo json_encode(['success' => $success, 'message' => $message]);
    exit;
}

try {
    // Get POST data - handle both standard form POST and JSON input
    $data = [];
    $raw_input = file_get_contents('php://input');
    error_log("Raw input: $raw_input");
    
    // First try to parse as JSON
    $json_data = json_decode($raw_input, true);
    if (json_last_error() === JSON_ERROR_NONE) {
        $data = $json_data;
        error_log("Successfully parsed JSON data");
    }
    // If not JSON or empty, check if standard form POST data exists
    else if (!empty($_POST)) {
        $data = $_POST;
        error_log("Using standard form POST data");
    }
    // If still no data, log the error but continue (will fail validation)
    else {
        error_log("Could not parse input data as JSON and no POST data found: " . json_last_error_msg());
    }
    
    // Validate and sanitize input
    $name = trim($data['name'] ?? '');
    $username = trim($data['username'] ?? '');
    $email = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';
    $confirm = $data['confirmPassword'] ?? $data['confirm_password'] ?? '';
    $referrer = trim($data['referrer'] ?? ''); // Get referrer username if provided
    
    error_log("Processing registration for: $username / $email");

    // Validation with detailed logging
    if (!$name || !$username || !$email || !$password || !$confirm) {
        error_log("Missing required fields: name=$name, username=$username, email=$email, password=" . ($password ? 'provided' : 'missing'));
        respond(false, 'All fields are required.', 400);
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        error_log("Invalid email format: $email");
        respond(false, 'Invalid email format.', 400);
    }
    if ($password !== $confirm) {
        error_log("Passwords do not match for user: $username");
        respond(false, 'Passwords do not match.', 400);
    }
    if (strlen($password) < 6) {
        error_log("Password too short for user: $username");
        respond(false, 'Password must be at least 6 characters.', 400);
    }

    error_log("Validation passed, checking for existing user: $username / $email");
    
    try {
        // Check for duplicate username/email
        $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ? OR email = ?');
        $stmt->execute([$username, $email]);
        if ($stmt->fetch()) {
            error_log("User already exists: $username / $email");
            respond(false, 'Username or email already exists.', 409); // 409 Conflict
        }
        
        error_log("User doesn't exist, proceeding with creation: $username");
        
        // Hash password
        $hash = password_hash($password, PASSWORD_DEFAULT);
        if ($hash === false) {
            error_log("Password hashing failed for user: $username");
            respond(false, 'Registration failed due to internal error.', 500);
        }
        
        error_log("Attempting to insert new user: $username");
        
        // Get referrer ID if referrer was provided
        $referrer_id = null;
        if (!empty($referrer)) {
            try {
                $refStmt = $pdo->prepare('SELECT id FROM users WHERE username = ? LIMIT 1');
                $refStmt->execute([$referrer]);
                $refRow = $refStmt->fetch(PDO::FETCH_ASSOC);
                if ($refRow) {
                    $referrer_id = $refRow['id'];
                    error_log("Found referrer ID: $referrer_id for username: $referrer");
                } else {
                    error_log("Referrer not found: $referrer");
                }
            } catch (Exception $e) {
                error_log("Error looking up referrer: " . $e->getMessage());
            }
        }
        
        // Insert new user with created_at timestamp and referrer_id
        $stmt = $pdo->prepare('INSERT INTO users (name, username, email, password, status, created_at, referrer_id) VALUES (?, ?, ?, ?, ?, NOW(), ?)');
        
        if ($stmt->execute([$name, $username, $email, $hash, 'active', $referrer_id])) {
            // Log registration success
            $userId = $pdo->lastInsertId();
            error_log("User created successfully: $username (ID: $userId)");
            
            try {
                $logStmt = $pdo->prepare('INSERT INTO security_logs (event_type, user_id, ip_address, user_agent, created_at) VALUES (?, ?, ?, ?, NOW())');
                $logStmt->execute(['user_register', $userId, $_SERVER['REMOTE_ADDR'] ?? 'unknown', $_SERVER['HTTP_USER_AGENT'] ?? 'unknown']);
                error_log("Security log created for registration: $username");
            } catch (Exception $e) {
                // Log but continue if security logging fails
                error_log("Failed to log registration event: " . $e->getMessage());
            }
            respond(true, 'Registration successful. You can now log in.', 201); // 201 Created
        } else {
            error_log('Registration SQL error: ' . print_r($stmt->errorInfo(), true));
            respond(false, 'Registration failed. Please try again.', 500);
        }
    } catch (PDOException $e) {
        error_log('Registration PDO exception: ' . $e->getMessage());
        respond(false, 'Registration failed: Database error', 500);
    } catch (Exception $e) {
        error_log('Registration general exception: ' . $e->getMessage());
        respond(false, 'Registration failed: Internal error', 500);
    }
} catch (Exception $e) {
    error_log('Fatal registration error: ' . $e->getMessage());
    respond(false, 'Registration failed due to server error', 500);
}
