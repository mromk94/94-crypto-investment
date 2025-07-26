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

try {
    // Get all investments with user and plan details
    $stmt = $pdo->query("
        SELECT 
            i.*,
            u.username,
            p.name as plan_name,
            p.roi_percent
        FROM investments i
        JOIN users u ON i.user_id = u.id
        LEFT JOIN plans p ON i.plan_id = p.id
        ORDER BY i.created_at DESC
    ");
    
    $investments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format the response
    $formattedInvestments = array_map(function($inv) {
        return [
            'id' => $inv['id'],
            'user_id' => $inv['user_id'],
            'username' => $inv['username'],
            'plan_id' => $inv['plan_id'],
            'plan_name' => $inv['plan_name'],
            'amount_invested' => (float)$inv['amount_invested'],
            'roi_percent' => (float)$inv['roi_percent'],
            'total_roi_earned' => (float)$inv['total_roi_earned'],
            'status' => $inv['status'],
            'created_at' => $inv['created_at'],
            'updated_at' => $inv['updated_at']
        ];
    }, $investments);
    
    echo json_encode([
        'success' => true,
        'investments' => $formattedInvestments
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch investments: ' . $e->getMessage()
    ]);
}
