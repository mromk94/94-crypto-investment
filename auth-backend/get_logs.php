<?php
require_once 'config.php';
require_once 'db.php';

header('Content-Type: application/json');

// Simple admin session check (replace with your real session/auth logic)
session_start();
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id, time, user, action, detail FROM logs ORDER BY time DESC");
    $stmt->execute();
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(["success" => true, "logs" => $logs]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
