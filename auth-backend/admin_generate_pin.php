<?php
/**
 * admin_generate_pin.php
 * 
 * Admin endpoint to generate withdrawal PINs for users
 * Only admins can generate PINs, users cannot generate their own PINs
 */

header('Content-Type: application/json');
// Critical: Add cache control headers
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
// CRITICAL: Allow origin with credentials
$allowed_origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $allowed_origin");
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Define TONSUI_LOADED constant to prevent direct access to session_init.php
define('TONSUI_LOADED', true);

// Include centralized session initialization
require_once __DIR__ . '/session_init.php';

// Require admin authentication
requireAdmin(true);

require_once 'config.php';
require_once 'db.php';

// Validate request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get and validate POST data
$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

if (!$data || !isset($data['user_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

$user_id = intval($data['user_id']);
$pin_length = isset($data['pin_length']) ? intval($data['pin_length']) : 6;
$expiry_days = isset($data['expiry_days']) ? intval($data['expiry_days']) : 30;
$notes = isset($data['notes']) ? trim($data['notes']) : null;
$pin_count = isset($data['pin_count']) ? intval($data['pin_count']) : 1;

// Validate pin length (between 4 and 10 digits)
if ($pin_length < 4 || $pin_length > 10) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'PIN length must be between 4 and 10 digits']);
    exit;
}

// Validate pin count (between 1 and 10)
if ($pin_count < 1 || $pin_count > 10) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'PIN count must be between 1 and 10']);
    exit;
}

// Validate expiry days (between 1 and 365)
if ($expiry_days < 1 || $expiry_days > 365) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Expiry days must be between 1 and 365']);
    exit;
}

try {
    // Begin transaction
    $pdo->beginTransaction();
    
    // Check if user exists
    $userStmt = $pdo->prepare("SELECT id, username, email, withdrawal_pin_required FROM users WHERE id = ?");
    $userStmt->execute([$user_id]);
    $user = $userStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        throw new Exception('User not found');
    }
    
    // Get user's pin settings
    $settingsStmt = $pdo->prepare("
        SELECT * FROM user_pin_settings 
        WHERE user_id = ? 
        LIMIT 1
    ");
    
    $settingsStmt->execute([$user_id]);
    $pin_settings = $settingsStmt->fetch(PDO::FETCH_ASSOC);
    
    // Check if withdrawal PIN is enabled for this user
    $pin_enabled = true;
    $max_pins = 5;
    
    if ($pin_settings) {
        $pin_enabled = (bool)$pin_settings['pin_enabled'];
        $max_pins = (int)$pin_settings['max_pins'];
        $default_expiry_days = (int)$pin_settings['pin_expiry_days'];
        
        // Use default expiry from settings if not specified
        if (!isset($data['expiry_days'])) {
            $expiry_days = $default_expiry_days;
        }
    } else {
        // Use setting from user table as fallback
        $pin_enabled = (bool)($user['withdrawal_pin_required'] ?? 1);
    }
    
    // If withdrawal PIN is not enabled for this user, enable it
    if (!$pin_enabled) {
        // Update or create pin settings
        if ($pin_settings) {
            $updateSettingsStmt = $pdo->prepare("
                UPDATE user_pin_settings 
                SET pin_enabled = 1, updated_at = NOW() 
                WHERE user_id = ?
            ");
            
            $updateSettingsStmt->execute([$user_id]);
        } else {
            $insertSettingsStmt = $pdo->prepare("
                INSERT INTO user_pin_settings 
                (user_id, pin_enabled, max_pins, pin_expiry_days, created_at) 
                VALUES (?, 1, ?, ?, NOW())
            ");
            
            $insertSettingsStmt->execute([$user_id, $max_pins, $expiry_days]);
        }
        
        // Update user table for backward compatibility
        $updateUserStmt = $pdo->prepare("
            UPDATE users 
            SET withdrawal_pin_required = 1, updated_at = NOW() 
            WHERE id = ?
        ");
        
        $updateUserStmt->execute([$user_id]);
    }
    
    // Count active PINs for this user
    $countStmt = $pdo->prepare("
        SELECT COUNT(*) 
        FROM withdrawal_pins 
        WHERE user_id = ? AND status = 'active'
    ");
    
    $countStmt->execute([$user_id]);
    $active_pin_count = $countStmt->fetchColumn();
    
    // Check if user already has maximum allowed PINs
    if (($active_pin_count + $pin_count) > $max_pins) {
        throw new Exception("User already has {$active_pin_count} active PINs. Maximum allowed is {$max_pins}.");
    }
    
    // Generate and store new PINs
    $generated_pins = [];
    
    for ($i = 0; $i < $pin_count; $i++) {
        // Generate a random PIN of specified length
        $min = pow(10, ($pin_length - 1));
        $max = pow(10, $pin_length) - 1;
        $pin = strval(mt_rand($min, $max));
        
        // Calculate expiry date
        $expiry_date = date('Y-m-d H:i:s', strtotime("+{$expiry_days} days"));
        
        // Store the PIN
        $pinStmt = $pdo->prepare("
            INSERT INTO withdrawal_pins 
            (user_id, pin, status, expiry_date, notes, created_at) 
            VALUES (?, ?, 'active', ?, ?, NOW())
        ");
        
        $pinStmt->execute([$user_id, $pin, $expiry_date, $notes]);
        $pin_id = $pdo->lastInsertId();
        
        // Add to generated PINs array
        $generated_pins[] = [
            'id' => $pin_id,
            'pin' => $pin,
            'expiry_date' => $expiry_date
        ];
    }
    
    // Log admin action
    $logStmt = $pdo->prepare("
        INSERT INTO admin_logs 
        (admin_id, action, target_type, target_id, details, created_at) 
        VALUES (?, 'generate_pins', 'user', ?, ?, NOW())
    ");
    
    $log_details = json_encode([
        'user_id' => $user_id,
        'pin_count' => $pin_count,
        'pin_length' => $pin_length,
        'expiry_days' => $expiry_days,
        'notes' => $notes
    ]);
    
    $logStmt->execute([isset($_SESSION['admin_id']) ? $_SESSION['admin_id'] : 1, $user_id, $log_details]);
    
    // Commit transaction
    $pdo->commit();
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => "Successfully generated {$pin_count} withdrawal " . ($pin_count > 1 ? 'PINs' : 'PIN') . " for user",
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email']
        ],
        'pins' => $generated_pins,
        'expiry_days' => $expiry_days,
        'expiry_date' => date('Y-m-d H:i:s', strtotime("+{$expiry_days} days"))
    ]);
    
} catch (PDOException $e) {
    // Rollback transaction if in progress
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    error_log('Database error generating withdrawal PINs: ' . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Database error generating withdrawal PINs'
    ]);
    
} catch (Exception $e) {
    // Rollback transaction if in progress
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'message' => $e->getMessage()
    ]);
}
