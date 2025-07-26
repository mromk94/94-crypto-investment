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
if (empty($input['id']) || empty($input['name']) || empty($input['type']) || !in_array($input['type'], ['deposit', 'withdrawal'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Invalid input. ID, name and valid type (deposit/withdrawal) are required.'
    ]);
    exit;
}

try {
    // Check if payment method exists
    $stmt = $pdo->prepare("SELECT * FROM payment_methods WHERE id = ?");
    $stmt->execute([$input['id']]);
    $existingMethod = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$existingMethod) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Payment method not found.'
        ]);
        exit;
    }
    
    // Update payment method
    $stmt = $pdo->prepare("
        UPDATE payment_methods 
        SET name = :name, type = :type, details = :details, updated_at = NOW()
        WHERE id = :id
    ");
    
    $stmt->execute([
        ':id' => $input['id'],
        ':name' => trim($input['name']),
        ':type' => $input['type'],
        ':details' => trim($input['details'] ?? '')
    ]);
    
    // Get the updated method
    $stmt = $pdo->prepare("SELECT * FROM payment_methods WHERE id = ?");
    $stmt->execute([$input['id']]);
    $updatedMethod = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Log the action
    $stmt = $pdo->prepare("
        INSERT INTO admin_logs (admin_id, action, details)
        VALUES (:admin_id, :action, :details)
    ");
    $stmt->execute([
        ':admin_id' => $_SESSION['admin_id'],
        ':action' => 'update_payment_method',
        ':details' => json_encode([
            'method_id' => $input['id'],
            'old_name' => $existingMethod['name'],
            'new_name' => $updatedMethod['name']
        ])
    ]);
    
    echo json_encode([
        'success' => true,
        'method' => $updatedMethod
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to update payment method: ' . $e->getMessage()
    ]);
}
