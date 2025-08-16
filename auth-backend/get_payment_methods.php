<?php
header("Content-Type: application/json");
// Critical: Add cache control headers
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

// Define TONSUI_LOADED constant to prevent direct access to session_init.php
define('TONSUI_LOADED', true);

// Include centralized session initialization
require_once __DIR__ . '/session_init.php';

// Require user authentication
requireLogin(true);

require_once "db.php";

try {
    $stmt = $pdo->query("SELECT * FROM payment_methods WHERE status = 'active' ORDER BY name");
    $methods = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(["success" => true, "payment_methods" => $methods]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>