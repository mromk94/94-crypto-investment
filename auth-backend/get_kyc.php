<?php
/**
 * KYC Submissions API
 * 
 * Retrieves KYC submissions for admin review
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
requireAdmin(true);

// Load configuration and database connection
require_once 'config.php';
require_once 'db.php';

try {
    // First check if kyc_requests table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'kyc_requests'");
    if ($stmt->rowCount() === 0) {
        // Table doesn't exist, return empty result
        echo json_encode(["success" => true, "kyc" => [], "message" => "KYC table not found - run installer to create database schema"]);
        exit;
    }
    
    // Table exists, fetch KYC submissions
    $stmt = $pdo->prepare("
        SELECT k.id, k.user_id, u.username, u.email, k.status, k.submitted_at as submitted, k.document_type, k.document_number, k.document_front, k.document_back 
        FROM kyc_requests k 
        LEFT JOIN users u ON k.user_id = u.id 
        ORDER BY k.submitted_at DESC
    ");
    $stmt->execute();
    $kyc = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(["success" => true, "kyc" => $kyc]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
