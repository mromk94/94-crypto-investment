<?php
require_once 'config.php';
require_once 'db.php';

header('Content-Type: application/json');

// Admin session check
session_start();
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate input
if (empty($input['id'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Payment method ID is required.'
    ]);
    exit;
}

try {
    // Start transaction
    $pdo->beginTransaction();
    
    // Get the method before deleting for logging
    $stmt = $pdo->prepare("SELECT * FROM payment_methods WHERE id = ?");
    $stmt->execute([$input['id']]);
    $method = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$method) {
        throw new Exception('Payment method not found.');
    }
    
    // Check if the method is in use
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as count FROM transactions 
        WHERE payment_method_id = ? AND status IN ('pending', 'processing')
    ");
    $stmt->execute([$input['id']]);
    $inUse = $stmt->fetch(PDO::FETCH_ASSOC)['count'] > 0;
    
    if ($inUse) {
        throw new Exception('Cannot delete payment method that is in use by pending or processing transactions.');
    }
    
    // Delete the payment method
    $stmt = $pdo->prepare("DELETE FROM payment_methods WHERE id = ?");
    $stmt->execute([$input['id']]);
    
    if ($stmt->rowCount() === 0) {
        throw new Exception('No payment method found with the specified ID.');
    }
    
    // Log the action
    $stmt = $pdo->prepare("
        INSERT INTO admin_logs (admin_id, action, details)
        VALUES (:admin_id, :action, :details)
    ");
    $stmt->execute([
        ':admin_id' => $_SESSION['admin_id'],
        ':action' => 'delete_payment_method',
        ':details' => json_encode([
            'method_id' => $input['id'],
            'name' => $method['name']
        ])
    ]);
    
    // Commit transaction
    $pdo->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Payment method deleted successfully.'
    ]);
    
} catch (Exception $e) {
    // Rollback transaction on error
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to delete payment method: ' . $e->getMessage()
    ]);
}
