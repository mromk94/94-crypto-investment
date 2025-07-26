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

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate input
if (empty($input['section_key']) || !isset($input['content'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Section key and content are required.'
    ]);
    exit;
}

// Define valid sections to prevent SQL injection
$validSections = ['landing', 'faq', 'testimonials', 'banner'];
if (!in_array($input['section_key'], $validSections)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Invalid section key.'
    ]);
    exit;
}

try {
    // Start transaction
    $pdo->beginTransaction();
    
    // Check if section exists
    $stmt = $pdo->prepare("SELECT * FROM content_sections WHERE section_key = ?");
    $stmt->execute([$input['section_key']]);
    $section = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($section) {
        // Update existing section
        $stmt = $pdo->prepare("
            UPDATE content_sections 
            SET content = :content, updated_at = NOW()
            WHERE section_key = :section_key
        ");
    } else {
        // Insert new section
        $stmt = $pdo->prepare("
            INSERT INTO content_sections (section_key, content, created_at, updated_at)
            VALUES (:section_key, :content, NOW(), NOW())
        ");
    }
    
    $stmt->execute([
        ':section_key' => $input['section_key'],
        ':content' => $input['content']
    ]);
    
    // Log the action
    $stmt = $pdo->prepare("
        INSERT INTO admin_logs (admin_id, action, details)
        VALUES (:admin_id, :action, :details)
    ");
    $stmt->execute([
        ':admin_id' => $_SESSION['admin_id'],
        ':action' => 'update_content',
        ':details' => json_encode([
            'section' => $input['section_key'],
            'content_length' => strlen($input['content'])
        ])
    ]);
    
    // Commit transaction
    $pdo->commit();
    
    // Get the updated section
    $stmt = $pdo->prepare("SELECT * FROM content_sections WHERE section_key = ?");
    $stmt->execute([$input['section_key']]);
    $updatedSection = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'section' => $updatedSection
    ]);
    
} catch (Exception $e) {
    // Rollback transaction on error
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to update content: ' . $e->getMessage()
    ]);
}
