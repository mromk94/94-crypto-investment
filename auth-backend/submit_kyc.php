<?php
/**
 * Submit KYC API
 * 
 * Handles real KYC document submissions from users
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

// Require user authentication
requireLogin(true);

// Load configuration and database connection
require_once 'config.php';
require_once 'db.php';

$user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 0;

// Only handle POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// Validate required fields
$required_fields = ['document_type', 'document_number'];
foreach ($required_fields as $field) {
    if (empty($_POST[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => "Missing required field: $field"]);
        exit;
    }
}

$document_type = $_POST['document_type'];
$document_number = $_POST['document_number'];

// Handle file uploads with security checks
$upload_dir = __DIR__ . '/../uploads/kyc/';
if (!file_exists($upload_dir)) {
    mkdir($upload_dir, 0755, true);
}

// Define allowed file types and max size
$allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
$max_file_size = 5 * 1024 * 1024; // 5MB

$document_front = null;
$document_back = null;

// Process front document upload with validation
if (isset($_FILES['document_front']) && $_FILES['document_front']['error'] === UPLOAD_ERR_OK) {
    // Validate file size
    if ($_FILES['document_front']['size'] > $max_file_size) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Front document file size exceeds the maximum allowed (5MB)']);
        exit;
    }
    
    // Validate file type
    $file_info = finfo_open(FILEINFO_MIME_TYPE);
    $mime_type = finfo_file($file_info, $_FILES['document_front']['tmp_name']);
    finfo_close($file_info);
    
    if (!in_array($mime_type, $allowed_types)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Front document file type not allowed. Please upload a JPG, PNG or PDF file.']);
        exit;
    }
    
    // Generate a secure filename using user_id and timestamp to avoid collisions
    $front_filename = $user_id . '_' . time() . '_front_' . bin2hex(random_bytes(8)) . '.' . pathinfo($_FILES['document_front']['name'], PATHINFO_EXTENSION);
    $front_path = $upload_dir . $front_filename;
    
    if (move_uploaded_file($_FILES['document_front']['tmp_name'], $front_path)) {
        $document_front = 'uploads/kyc/' . $front_filename;
        // Set secure permissions on uploaded file
        chmod($front_path, 0644);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to upload front document']);
        exit;
    }
}

// Process back document upload with validation
if (isset($_FILES['document_back']) && $_FILES['document_back']['error'] === UPLOAD_ERR_OK) {
    // Validate file size
    if ($_FILES['document_back']['size'] > $max_file_size) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Back document file size exceeds the maximum allowed (5MB)']);
        exit;
    }
    
    // Validate file type
    $file_info = finfo_open(FILEINFO_MIME_TYPE);
    $mime_type = finfo_file($file_info, $_FILES['document_back']['tmp_name']);
    finfo_close($file_info);
    
    if (!in_array($mime_type, $allowed_types)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Back document file type not allowed. Please upload a JPG, PNG or PDF file.']);
        exit;
    }
    
    // Generate a secure filename using user_id and timestamp to avoid collisions
    $back_filename = $user_id . '_' . time() . '_back_' . bin2hex(random_bytes(8)) . '.' . pathinfo($_FILES['document_back']['name'], PATHINFO_EXTENSION);
    $back_path = $upload_dir . $back_filename;
    
    if (move_uploaded_file($_FILES['document_back']['tmp_name'], $back_path)) {
        $document_back = 'uploads/kyc/' . $back_filename;
        // Set secure permissions on uploaded file
        chmod($back_path, 0644);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to upload back document']);
        exit;
    }
}

try {
    // Check if user already has a KYC submission
    $stmt = $pdo->prepare("SELECT id FROM kyc_requests WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $existing = $stmt->fetch();
    
    if ($existing) {
        // Update existing submission
        $stmt = $pdo->prepare("
            UPDATE kyc_requests 
            SET document_type = ?, document_number = ?, document_front = ?, document_back = ?, 
                status = 'pending', submitted_at = NOW() 
            WHERE user_id = ?
        ");
        $stmt->execute([$document_type, $document_number, $document_front, $document_back, $user_id]);
        
        echo json_encode([
            'success' => true, 
            'message' => 'KYC documents updated successfully. Your submission is under review.'
        ]);
    } else {
        // Create new submission
        $stmt = $pdo->prepare("
            INSERT INTO kyc_requests (user_id, document_type, document_number, document_front, document_back, status, submitted_at) 
            VALUES (?, ?, ?, ?, ?, 'pending', NOW())
        ");
        $stmt->execute([$user_id, $document_type, $document_number, $document_front, $document_back]);
        
        echo json_encode([
            'success' => true, 
            'message' => 'KYC documents submitted successfully. Your submission is under review.'
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to submit KYC: ' . $e->getMessage()]);
}
?>
