<?php
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
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'db.php';

try {
    $analytics = [
        'total_users' => $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn() ?: 0,
        'total_investments' => $pdo->query("SELECT COUNT(*) FROM investments")->fetchColumn() ?: 0,
        'total_deposits' => $pdo->query("SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'deposit' AND status = 'completed'")->fetchColumn() ?: 0,
        'total_withdrawals' => $pdo->query("SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'withdrawal' AND status = 'completed'")->fetchColumn() ?: 0,
        'pending_transactions' => $pdo->query("SELECT COUNT(*) FROM transactions WHERE status = 'pending'")->fetchColumn() ?: 0
    ];
    echo json_encode(['success' => true, 'analytics' => $analytics]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>
