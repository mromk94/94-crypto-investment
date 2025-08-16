<?php
// Admin endpoint to adjust user balance (credit or debit)
// Define TONSUI_LOADED constant to prevent direct access to session_init.php
define('TONSUI_LOADED', true);

// Include centralized session initialization
require_once __DIR__ . '/session_init.php';

require_once 'auth.php';
require_once 'db.php';

// Require admin authentication
check_admin_session();

// Get and validate input
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['user_id']) || !isset($data['amount']) || !isset($data['type'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

$user_id = intval($data['user_id']);
$amount = floatval($data['amount']);
$type = $data['type']; // 'credit' or 'debit'
$note = isset($data['note']) ? $data['note'] : '';

// Validate data
if ($user_id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid user ID']);
    exit;
}

if ($amount <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Amount must be greater than zero']);
    exit;
}

if ($type !== 'credit' && $type !== 'debit') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Type must be credit or debit']);
    exit;
}

// Get admin ID for logging
$admin_id = isset($_SESSION['admin_id']) ? $_SESSION['admin_id'] : 1;

// Start transaction for consistency
$db->begin_transaction();

try {
    // Verify user exists
    $stmt = $db->prepare("SELECT balance FROM users WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception("User not found");
    }
    
    $user = $result->fetch_assoc();
    $current_balance = floatval($user['balance']);
    
    // Calculate new balance
    $new_balance = ($type === 'credit') 
        ? $current_balance + $amount 
        : $current_balance - $amount;
    
    // Check for negative balance if debiting
    if ($type === 'debit' && $new_balance < 0) {
        throw new Exception("Insufficient funds for debit operation");
    }
    
    // Update user balance
    $stmt = $db->prepare("UPDATE users SET balance = ? WHERE id = ?");
    $stmt->bind_param("di", $new_balance, $user_id);
    $stmt->execute();
    
    if ($stmt->affected_rows === 0) {
        throw new Exception("Failed to update balance");
    }
    
    // Log transaction
    $action = ($type === 'credit') ? 'credited' : 'debited';
    $transaction_type = ($type === 'credit') ? 'admin_credit' : 'admin_debit';
    
    $stmt = $db->prepare("
        INSERT INTO transactions 
        (user_id, type, amount, status, admin_id, note) 
        VALUES (?, ?, ?, 'completed', ?, ?)
    ");
    $stmt->bind_param("isdis", $user_id, $transaction_type, $amount, $admin_id, $note);
    $stmt->execute();
    
    if ($stmt->affected_rows === 0) {
        throw new Exception("Failed to log transaction");
    }
    
    // Log security event
    $stmt = $db->prepare("
        INSERT INTO security_logs 
        (user_id, admin_id, event_type, ip_address, details) 
        VALUES (?, ?, ?, ?, ?)
    ");
    
    $event_type = "admin_balance_" . $type;
    $ip_address = $_SERVER['REMOTE_ADDR'];
    $details = "Admin $admin_id $action user $user_id balance by $amount. Note: $note";
    
    $stmt->bind_param("iisss", $user_id, $admin_id, $event_type, $ip_address, $details);
    $stmt->execute();
    
    // Commit transaction
    $db->commit();
    
    // Return success response
    http_response_code(200);
    echo json_encode([
        'success' => true, 
        'message' => "User balance $action successfully",
        'new_balance' => $new_balance
    ]);
    
} catch (Exception $e) {
    // Roll back transaction on error
    $db->rollback();
    
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
