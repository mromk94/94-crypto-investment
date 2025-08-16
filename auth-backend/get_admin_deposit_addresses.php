<?php
/**
 * get_admin_deposit_addresses.php
 * 
 * Admin endpoint to retrieve all deposit addresses configured for payment methods
 * Used in the admin dashboard to manage deposit addresses for all payment methods
 */

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
requireAdmin();

require_once 'config.php';
require_once 'db.php';

// Validate request method
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    // Query to get all payment methods with their deposit addresses (if set)
    $query = "
        SELECT 
            pm.id as payment_method_id,
            pm.name as payment_method_name,
            pm.symbol as payment_method_symbol,
            pm.type as payment_method_type,
            pm.status as payment_method_status,
            pm.icon as payment_method_icon,
            pm.created_at as payment_method_created_at,
            ada.id as address_id,
            ada.address,
            ada.qr_code,
            ada.created_at as address_created_at,
            ada.updated_at as address_updated_at,
            (
                SELECT COUNT(*) 
                FROM user_address_requests uar 
                WHERE uar.payment_method_id = pm.id
            ) as request_count,
            (
                SELECT COUNT(*) 
                FROM transactions t 
                WHERE t.payment_method_id = pm.id AND t.type = 'deposit'
            ) as deposit_count,
            (
                SELECT SUM(amount) 
                FROM transactions t 
                WHERE t.payment_method_id = pm.id AND t.type = 'deposit'
            ) as deposit_total
        FROM 
            payment_methods pm
        LEFT JOIN 
            admin_deposit_addresses ada ON pm.id = ada.payment_method_id
        ORDER BY 
            pm.name ASC
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $payment_methods = [];
    
    // Format the results
    foreach ($results as $row) {
        $payment_method = [
            'id' => $row['payment_method_id'],
            'name' => $row['payment_method_name'],
            'symbol' => $row['payment_method_symbol'],
            'type' => $row['payment_method_type'],
            'status' => $row['payment_method_status'],
            'icon' => $row['payment_method_icon'],
            'created_at' => $row['payment_method_created_at'],
            'deposit_address' => null,
            'stats' => [
                'request_count' => (int)$row['request_count'],
                'deposit_count' => (int)$row['deposit_count'],
                'deposit_total' => $row['deposit_total'] ? floatval($row['deposit_total']) : 0
            ]
        ];
        
        // Add deposit address if it exists
        if ($row['address_id']) {
            $payment_method['deposit_address'] = [
                'id' => $row['address_id'],
                'address' => $row['address'],
                'qr_code' => $row['qr_code'],
                'created_at' => $row['address_created_at'],
                'updated_at' => $row['address_updated_at']
            ];
        }
        
        $payment_methods[] = $payment_method;
    }
    
    // Return success response with payment methods and their addresses
    echo json_encode([
        'success' => true,
        'payment_methods' => $payment_methods,
        'count' => count($payment_methods)
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Failed to retrieve deposit addresses: ' . $e->getMessage()
    ]);
}
