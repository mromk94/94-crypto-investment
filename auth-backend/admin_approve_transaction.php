<?php
/**
 * admin_approve_transaction.php: Handles admin approval/rejection of deposits and withdrawals
 * Part of Ton Sui Mining investment workflow
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
header('Access-Control-Allow-Headers: Content-Type');
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
require_once 'csrf.php';

function respond($success, $message, $data = null) {
    $response = ['success' => $success, 'message' => $message];
    if ($data !== null) {
        $response['data'] = $data;
    }
    echo json_encode($response);
    exit;
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);
$transaction_id = isset($data['transaction_id']) ? intval($data['transaction_id']) : 0;
$action = $data['action'] ?? ''; // approve or reject
$admin_note = $data['admin_note'] ?? '';

// Validate input
if ($transaction_id <= 0) {
    respond(false, 'Invalid transaction ID.');
}

if (!in_array($action, ['approve', 'reject'])) {
    respond(false, 'Invalid action. Must be either "approve" or "reject".');
}

try {
    // Get the transaction details first
    $stmt = $pdo->prepare('SELECT * FROM transactions WHERE id = ?');
    $stmt->execute([$transaction_id]);
    $transaction = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$transaction) {
        respond(false, 'Transaction not found.');
    }
    
    // Check if transaction is already processed
    if ($transaction['status'] !== 'pending') {
        respond(false, 'This transaction has already been processed.');
    }
    
    // Start a transaction
    $pdo->beginTransaction();
    
    // Update transaction status based on action
    $new_status = ($action === 'approve') ? 'completed' : 'rejected';
    
    $updateStmt = $pdo->prepare('
        UPDATE transactions 
        SET 
            status = ?,
            admin_note = ?,
            updated_at = NOW() 
        WHERE id = ?
    ');
    
    $updateStmt->execute([$new_status, $admin_note, $transaction_id]);
    
    // If it's a deposit and we're approving it, add the amount to the user's balance
    if ($transaction['type'] === 'deposit' && $action === 'approve') {
        $amount = floatval($transaction['amount']);
        $user_id = $transaction['user_id'];
        
        $updateBalanceStmt = $pdo->prepare('UPDATE users SET balance = balance + ? WHERE id = ?');
        $updateBalanceStmt->execute([$amount, $user_id]);
    }
    
    // If it's a withdrawal and we're approving it, subtract the amount from the user's balance
    if ($transaction['type'] === 'withdrawal' && $action === 'approve') {
        $amount = floatval($transaction['amount']);
        $user_id = $transaction['user_id'];
        
        // Check if user has sufficient balance
        $userStmt = $pdo->prepare('SELECT balance FROM users WHERE id = ?');
        $userStmt->execute([$user_id]);
        $user = $userStmt->fetch();
        
        if (!$user || floatval($user['balance']) < $amount) {
            $pdo->rollBack();
            respond(false, 'User has insufficient balance for this withdrawal.');
        }
        
        $updateBalanceStmt = $pdo->prepare('UPDATE users SET balance = balance - ? WHERE id = ?');
        $updateBalanceStmt->execute([$amount, $user_id]);
    }
    
    // Log the admin action
    $logStmt = $pdo->prepare('
        INSERT INTO security_logs 
        (event_type, user_id, ip_address, user_agent, details, created_at) 
        VALUES (?, ?, ?, ?, ?, NOW())
    ');
    
    $event_type = ($action === 'approve') ? 'transaction_approved' : 'transaction_rejected';
    $admin_id = isset($_SESSION['admin_id']) ? $_SESSION['admin_id'] : 1;
    
    $logStmt->execute([
        $event_type,
        $admin_id,
        $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
        json_encode([
            'transaction_id' => $transaction_id,
            'transaction_type' => $transaction['type'],
            'user_id' => $transaction['user_id'],
            'amount' => $transaction['amount'],
            'admin_note' => $admin_note
        ])
    ]);
    
    // Commit the transaction
    $pdo->commit();
    
    respond(true, 'Transaction has been ' . ($action === 'approve' ? 'approved' : 'rejected') . ' successfully.', [
        'transaction_id' => $transaction_id,
        'new_status' => $new_status
    ]);
    
} catch (Exception $e) {
    // Something went wrong, rollback
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('Admin transaction approval error: ' . $e->getMessage());
    respond(false, 'An error occurred while processing the transaction. Please try again or contact support.');
}
