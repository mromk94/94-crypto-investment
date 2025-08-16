<?php
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
header('Access-Control-Allow-Credentials: true');

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

require_once 'db.php';

try {
    $stmt = $pdo->query("SELECT t.*, u.username, u.email FROM transactions t LEFT JOIN users u ON t.user_id = u.id WHERE t.status = 'pending' ORDER BY t.created_at DESC");
    $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'transactions' => $transactions
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch pending transactions: ' . $e->getMessage()
    ]);
}
?>
