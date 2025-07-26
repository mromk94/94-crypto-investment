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
    // Get total invested and active plans
    $stmt = $pdo->query("
        SELECT 
            COALESCE(SUM(CAST(amount_invested AS DECIMAL(18,8))), 0) as total_invested,
            COALESCE(SUM(CAST(profit_earned AS DECIMAL(18,8))), 0) as total_roi_paid,
            COUNT(CASE WHEN status = 'active' THEN 1 ELSE NULL END) as active_plans
        FROM investments
    ");
    
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Ensure we have proper types (float for amounts, int for counts)
    $response = [
        'success' => true,
        'totalInvested' => (float)$result['total_invested'],
        'totalRoiPaid' => (float)$result['total_roi_paid'],
        'activePlans' => (int)$result['active_plans']
    ];
    
    // Set JSON headers and output
    header('Content-Type: application/json');
    echo json_encode($response, JSON_PRESERVE_ZERO_FRACTION);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch analytics: ' . $e->getMessage()
    ]);
}
