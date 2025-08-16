<?php
/**
 * get_deposit_address.php
 * 
 * Endpoint to retrieve or generate a deposit address for a specific payment method
 * This endpoint handles cryptocurrency deposit addresses for users
 */

header('Content-Type: application/json');
// Critical: Add cache control headers
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
// CRITICAL: Allow origin with credentials
$allowed_origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $allowed_origin");
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
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

// Require user authentication
requireLogin(true);

require_once 'config.php';
require_once 'db.php';

// Get the payment method ID from the request
$payment_method_id = isset($_GET['payment_method_id']) ? (int)$_GET['payment_method_id'] : 0;

if ($payment_method_id <= 0) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid payment method ID'
    ]);
    exit;
}

try {
    // First check if the payment method exists and is crypto
    $stmt = $pdo->prepare("SELECT * FROM payment_methods WHERE id = ? AND type = 'crypto' AND status = 'active'");
    $stmt->execute([$payment_method_id]);
    $payment_method = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$payment_method) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Payment method not found or not a cryptocurrency'
        ]);
        exit;
    }
    
    // Check if user already has an address for this payment method
    $stmt = $pdo->prepare("
        SELECT * FROM user_deposit_addresses 
        WHERE user_id = ? AND payment_method_id = ?
    ");
    $stmt->execute([isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 0, $payment_method_id]);
    $existing_address = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($existing_address) {
        // Return existing address
        echo json_encode([
            'success' => true,
            'address' => $existing_address['address'],
            'qr_code' => generateQRCode($existing_address['address']),
            'payment_method' => $payment_method['name'],
            'created_at' => $existing_address['created_at']
        ]);
        exit;
    }
    
    // No existing address, generate a new one
    // For a real implementation, this would call an external wallet API or crypto node
    // For demonstration, we'll generate a mock address with proper format for the currency
    $address = generateMockAddress($payment_method['name']);
    
    // Store the address in the database
    $stmt = $pdo->prepare("
        INSERT INTO user_deposit_addresses 
        (user_id, payment_method_id, address, created_at) 
        VALUES (?, ?, ?, NOW())
    ");
    $stmt->execute([isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 0, $payment_method_id, $address]);
    
    // Log the address generation
    $logStmt = $pdo->prepare("
        INSERT INTO security_logs 
        (event_type, user_id, ip_address, user_agent, details, created_at) 
        VALUES (?, ?, ?, ?, ?, NOW())
    ");
    
    $logStmt->execute([
        'deposit_address_generated',
        isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 0,
        $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
        json_encode([
            'payment_method_id' => $payment_method_id,
            'payment_method_name' => $payment_method['name'],
            'address' => $address
        ])
    ]);
    
    // Return the new address with QR code
    echo json_encode([
        'success' => true,
        'address' => $address,
        'qr_code' => generateQRCode($address),
        'payment_method' => $payment_method['name'],
        'is_new' => true
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    error_log('Error generating deposit address: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while generating deposit address'
    ]);
}

/**
 * Generate a QR code for the address
 * Returns a data URI for the QR code image
 * 
 * @param string $address The cryptocurrency address
 * @return string Data URI for the QR code
 */
function generateQRCode($address) {
    // In a real implementation, this would use a QR code generation library
    // For now, we'll return a placeholder URL that would be replaced with actual QR code in production
    $baseUrl = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=";
    return $baseUrl . urlencode($address);
}

/**
 * Generate a mock cryptocurrency address for demonstration
 * 
 * @param string $currency The name of the cryptocurrency
 * @return string A formatted mock address
 */
function generateMockAddress($currency) {
    $currency = strtolower($currency);
    
    switch ($currency) {
        case 'bitcoin':
        case 'btc':
            return 'bc1' . bin2hex(random_bytes(20));
            
        case 'ethereum':
        case 'eth':
            return '0x' . bin2hex(random_bytes(20));
            
        case 'ton':
            return 'EQ' . bin2hex(random_bytes(16)) . '1hs8s4';
            
        case 'sui':
            return '0x' . bin2hex(random_bytes(15));
            
        default:
            // Generic format for other cryptos
            return 'CR' . bin2hex(random_bytes(20));
    }
}
