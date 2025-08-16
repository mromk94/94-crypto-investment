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

try {
    // Return mock system rates for now
    $rates = [
        'btc_usd' => 45000.00,
        'eth_usd' => 3000.00,
        'usdt_usd' => 1.00,
        'mining_rate' => 0.05,
        'withdrawal_fee' => 1.00,
        'min_deposit' => 10.00,
        'min_withdrawal' => 5.00
    ];
    
    echo json_encode([
        'success' => true,
        'rates' => $rates
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch system rates: ' . $e->getMessage()
    ]);
}
?>
