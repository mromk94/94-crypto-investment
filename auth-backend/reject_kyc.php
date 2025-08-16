<?php
/**
 * reject_kyc.php: Handles admin rejection of KYC submissions
 * Part of Ton Sui Mining KYC workflow
 */

header('Content-Type: application/json');
// Critical: Add cache control headers
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
// CRITICAL: Allow origin with credentials
$allowed_origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $allowed_origin");
header('Access-Control-Allow-Methods: POST, OPTIONS');
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
requireAdmin(true);

require_once 'config.php';
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['id'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing KYC id"]);
    exit;
}

try {
    // Get the KYC request to log details
    $getStmt = $pdo->prepare("SELECT user_id, document_type FROM kyc_requests WHERE id=?");
    $getStmt->execute([$data['id']]);
    $kyc = $getStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$kyc) {
        http_response_code(404);
        echo json_encode(["success" => false, "error" => "KYC submission not found"]);
        exit;
    }
    
    // Update the KYC status
    $stmt = $pdo->prepare("UPDATE kyc_requests SET status='rejected', updated_at=NOW() WHERE id=?");
    $stmt->execute([$data['id']]);
    
    // Log the action
    $logStmt = $pdo->prepare("
        INSERT INTO admin_logs (admin_id, action, details)
        VALUES (:admin_id, :action, :details)
    ");
    
    $logStmt->execute([
        ':admin_id' => isset($_SESSION['admin_id']) ? $_SESSION['admin_id'] : 1,
        ':action' => 'reject_kyc',
        ':details' => json_encode([
            'kyc_id' => $data['id'],
            'user_id' => $kyc['user_id'],
            'document_type' => $kyc['document_type']
        ])
    ]);
    
    echo json_encode(["success" => true, "message" => "KYC submission rejected successfully"]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
