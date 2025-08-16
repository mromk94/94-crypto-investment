<?php
/**
 * admin_delete_pin.php
 * 
 * Admin endpoint to delete or cancel a user's withdrawal PIN
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

if (!$data || !isset($data['pin_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

$pin_id = intval($data['pin_id']);
$action = isset($data['action']) ? trim($data['action']) : 'cancel';
$notes = isset($data['notes']) ? trim($data['notes']) : null;

// Validate action
if ($action !== 'cancel' && $action !== 'delete') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid action. Must be "cancel" or "delete"']);
    exit;
}

try {
    // Begin transaction
    $pdo->beginTransaction();
    
    // Fetch the PIN to ensure it exists and get associated user info
    $pinStmt = $pdo->prepare("
        SELECT wp.*, u.username, u.email 
        FROM withdrawal_pins wp
        LEFT JOIN users u ON wp.user_id = u.id
        WHERE wp.id = ?
    ");
    
    $pinStmt->execute([$pin_id]);
    $pin = $pinStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$pin) {
        throw new Exception('Withdrawal PIN not found');
    }
    
    // Check if PIN is already used or cancelled
    if ($pin['status'] === 'used') {
        throw new Exception('Cannot modify a used withdrawal PIN');
    }
    
    if ($pin['status'] === 'cancelled' && $action === 'cancel') {
        throw new Exception('PIN is already cancelled');
    }
    
    if ($action === 'cancel') {
        // Update PIN status to cancelled
        $updateStmt = $pdo->prepare("
            UPDATE withdrawal_pins 
            SET 
                status = 'cancelled',
                notes = CONCAT(IFNULL(notes, ''), ' | ', ?),
                updated_at = NOW() 
            WHERE id = ?
        ");
        
        $update_note = "Cancelled by admin: " . $_SESSION['admin_username'] . 
                      ($notes ? " - " . $notes : "");
                      
        $updateStmt->execute([$update_note, $pin_id]);
        $message = 'Withdrawal PIN successfully cancelled';
    } else { // delete action
        // Delete the PIN completely
        $deleteStmt = $pdo->prepare("DELETE FROM withdrawal_pins WHERE id = ?");
        $deleteStmt->execute([$pin_id]);
        $message = 'Withdrawal PIN successfully deleted';
    }
    
    // Log admin action
    $logStmt = $pdo->prepare("
        INSERT INTO admin_logs 
        (admin_id, action, target_type, target_id, details, created_at) 
        VALUES (?, ?, 'withdrawal_pin', ?, ?, NOW())
    ");
    
    $log_details = json_encode([
        'pin_id' => $pin_id,
        'user_id' => $pin['user_id'],
        'username' => $pin['username'],
        'email' => $pin['email'],
        'action' => $action,
        'notes' => $notes
    ]);
    
    $logStmt->execute([
        isset($_SESSION['admin_id']) ? $_SESSION['admin_id'] : 1, 
        $action === 'cancel' ? 'cancel_pin' : 'delete_pin', 
        $pin_id, 
        $log_details
    ]);
    
    // Commit transaction
    $pdo->commit();
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => $message,
        'pin_id' => $pin_id,
        'action' => $action,
        'user' => [
            'id' => $pin['user_id'],
            'username' => $pin['username'],
            'email' => $pin['email']
        ]
    ]);
    
} catch (PDOException $e) {
    // Rollback transaction if in progress
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    error_log('Database error deleting withdrawal PIN: ' . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Database error deleting withdrawal PIN'
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
