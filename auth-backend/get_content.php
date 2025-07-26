<?php
require_once 'config.php';
require_once 'db.php';

header('Content-Type: application/json');

// Admin session check
session_start();
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

try {
    // Get all content sections
    $stmt = $pdo->query("SELECT * FROM content_sections");
    $sections = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format the response
    $content = [];
    foreach ($sections as $section) {
        $content[$section['section_key']] = $section['content'];
    }
    
    echo json_encode([
        'success' => true,
        'content' => $content
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch content: ' . $e->getMessage()
    ]);
}
