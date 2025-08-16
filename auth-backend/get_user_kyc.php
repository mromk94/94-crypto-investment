<?php
/**
 * Get User KYC API
 * 
 * Retrieves the current user's KYC submission status
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

// Require user authentication
requireLogin(true);

// Load configuration and database connection
require_once 'config.php';
require_once 'db.php';

// Only handle GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 0;

try {
    // First check if kyc_requests table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'kyc_requests'");
    if ($stmt->rowCount() === 0) {
        // Table doesn't exist, return empty result
        echo json_encode([
            "success" => true, 
            "kyc" => null,
            "message" => "KYC system not yet initialized"
        ]);
        exit;
    }
    
    // Table exists, fetch user's KYC submission if it exists
    $stmt = $pdo->prepare("
        SELECT id, user_id, document_type, document_number, document_front, document_back, 
               status, submitted_at, updated_at 
        FROM kyc_requests 
        WHERE user_id = ?
    ");
    $stmt->execute([$user_id]);
    $kyc = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($kyc) {
        // Mask sensitive document number (show only last 4 chars)
        if (!empty($kyc['document_number'])) {
            $len = strlen($kyc['document_number']);
            if ($len > 4) {
                $kyc['document_number'] = str_repeat('*', $len - 4) . substr($kyc['document_number'], -4);
            }
        }
        
        echo json_encode([
            "success" => true, 
            "kyc" => $kyc,
            "has_submission" => true
        ]);
    } else {
        echo json_encode([
            "success" => true, 
            "kyc" => null,
            "has_submission" => false,
            "message" => "No KYC submission found for this user"
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "error" => "Failed to retrieve KYC status: " . $e->getMessage()
    ]);
}
?>
