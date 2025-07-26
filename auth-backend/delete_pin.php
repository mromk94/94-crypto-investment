<?php
require_once 'config.php';
require_once 'db.php';

header('Content-Type: application/json');
session_start();
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['id'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing pin id"]);
    exit;
}

try {
    $stmt = $pdo->prepare("DELETE FROM withdrawal_pins WHERE id=?");
    $stmt->execute([$data['id']]);
    echo json_encode(["success" => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
