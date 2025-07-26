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
if (empty($input['name']) || empty($input['type']) || !in_array($input['type'], ['deposit', 'withdrawal'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Invalid input. Name and type (deposit/withdrawal) are required.'
    ]);
    exit;
}

try {
    // Insert new payment method
    $stmt = $pdo->prepare("
        INSERT INTO payment_methods (name, type, details)
        VALUES (:name, :type, :details)
    ");
    
    $stmt->execute([
        ':name' => trim($input['name']),
        ':type' => $input['type'],
        ':details' => trim($input['details'] ?? '')
    ]);
    
    // Get the newly created method
    $methodId = $pdo->lastInsertId();
    $stmt = $pdo->prepare("SELECT * FROM payment_methods WHERE id = ?");
    $stmt->execute([$methodId]);
    $method = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Log the action
    $stmt = $pdo->prepare("
        INSERT INTO admin_logs (admin_id, action, details)
        VALUES (:admin_id, :action, :details)
    ");
    $stmt->execute([
        ':admin_id' => $_SESSION['admin_id'],
        ':action' => 'add_payment_method',
        ':details' => json_encode(['method_id' => $methodId, 'name' => $method['name']])
    ]);
    
    echo json_encode([
        'success' => true,
        'method' => $method
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to add payment method: ' . $e->getMessage()
    ]);
}
