<?php
/**
 * KYC Form Management API
 * 
 * Allows admins to configure KYC form fields
 */

header('Content-Type: application/json');

// CRITICAL FIX: Allow specific origin instead of wildcard for credential support
$allowed_origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $allowed_origin");
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Add cache control headers to prevent stale data
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

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

// CRITICAL FIX: Allow both users and admins to access this endpoint
// Instead of strict requireAdmin(), check for either admin or user
if (!isUserLoggedIn() && !isUserAdmin()) {
    http_response_code(401);
    echo json_encode([
        'success' => false, 
        'error' => 'Authentication required',
        'session_status' => session_status(),
        'session_id' => session_id()
    ]);
    exit;
}

// Debug session information
if (isset($_GET['debug']) && $_GET['debug'] == 1) {
    echo json_encode([
        'success' => true,
        'debug' => true,
        'session' => [
            'id' => session_id(),
            'admin' => isset($_SESSION['admin_logged_in']) ? $_SESSION['admin_logged_in'] : false,
            'user' => isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null
        ]
    ]);
    exit;
}

// Load configuration and database connection
require_once 'config.php';
require_once 'db.php';

// Read request data if any
$data = json_decode(file_get_contents('php://input'), true);

// Get KYC form structure
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // First check if kyc_form_fields table exists
        $stmt = $pdo->query("SHOW TABLES LIKE 'kyc_form_fields'");
        if ($stmt->rowCount() === 0) {
            // Table doesn't exist, create it
            $pdo->exec("CREATE TABLE IF NOT EXISTS kyc_form_fields (
                id INT AUTO_INCREMENT PRIMARY KEY,
                type VARCHAR(50) NOT NULL,
                label VARCHAR(255) NOT NULL,
                required BOOLEAN DEFAULT TRUE,
                options TEXT NULL,
                field_order INT NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )");
            
            // Insert default fields
            $defaultFields = [
                ['text', 'Full Name', true, null, 1],
                ['email', 'Email Address', true, null, 2],
                ['text', 'Phone Number', true, null, 3],
                ['file', 'Government ID (Front)', true, null, 4],
                ['file', 'Government ID (Back)', true, null, 5],
                ['file', 'Proof of Address', true, null, 6],
                ['select', 'Account Type', true, json_encode(['Personal', 'Business']), 7]
            ];
            
            $stmt = $pdo->prepare("INSERT INTO kyc_form_fields 
                (type, label, required, options, field_order) VALUES (?, ?, ?, ?, ?)");
                
            foreach ($defaultFields as $field) {
                $stmt->execute($field);
            }
        }
        
        // Get all fields from the database
        $stmt = $pdo->query("SELECT * FROM kyc_form_fields ORDER BY field_order ASC");
        $fields = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Process fields for select options
        foreach ($fields as &$field) {
            if ($field['type'] === 'select' && !empty($field['options'])) {
                $field['options'] = json_decode($field['options'], true) ?: [];
            }
            $field['required'] = (bool)$field['required'];
        }
        
        echo json_encode(['success' => true, 'fields' => $fields]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to fetch KYC form fields: ' . $e->getMessage()]);
    }
    exit;
}

// Update KYC form fields
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (empty($data) || !is_array($data)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid request data']);
        exit;
    }
    
    try {
        // Begin transaction
        $pdo->beginTransaction();
        
        // Clear existing fields
        $pdo->exec("TRUNCATE TABLE kyc_form_fields");
        
        // Insert new fields
        $stmt = $pdo->prepare("INSERT INTO kyc_form_fields 
            (type, label, required, options, field_order) 
            VALUES (?, ?, ?, ?, ?)");
            
        $order = 1;
        foreach ($data as $field) {
            if (!isset($field['type']) || !isset($field['label'])) {
                throw new Exception('Each field must have a type and label');
            }
            
            $options = null;
            if (isset($field['options']) && is_array($field['options'])) {
                $options = json_encode($field['options']);
            }
            
            $required = isset($field['required']) ? (bool)$field['required'] : true;
            
            $stmt->execute([
                $field['type'],
                $field['label'],
                $required,
                $options,
                $order++
            ]);
        }
        
        // Commit transaction
        $pdo->commit();
        
        // Log admin action
        $logStmt = $pdo->prepare("
            INSERT INTO admin_logs (admin_id, action, details)
            VALUES (:admin_id, :action, :details)
        ");
        
        $logStmt->execute([
            ':admin_id' => isset($_SESSION['admin_id']) ? $_SESSION['admin_id'] : 1,
            ':action' => 'update_kyc_form',
            ':details' => json_encode(['field_count' => count($data)])
        ]);
        
        echo json_encode(['success' => true, 'message' => 'KYC form fields updated successfully']);
    } catch (Exception $e) {
        // Rollback transaction on error
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to update KYC form fields: ' . $e->getMessage()]);
    }
    exit;
}

// Reset KYC form fields to default
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    try {
        // Begin transaction
        $pdo->beginTransaction();
        
        // Clear existing fields
        $pdo->exec("TRUNCATE TABLE kyc_form_fields");
        
        // Insert default fields
        $defaultFields = [
            ['text', 'Full Name', true, null, 1],
            ['email', 'Email Address', true, null, 2],
            ['text', 'Phone Number', true, null, 3],
            ['file', 'Government ID (Front)', true, null, 4],
            ['file', 'Government ID (Back)', true, null, 5],
            ['file', 'Proof of Address', true, null, 6],
            ['select', 'Account Type', true, json_encode(['Personal', 'Business']), 7]
        ];
        
        $stmt = $pdo->prepare("INSERT INTO kyc_form_fields 
            (type, label, required, options, field_order) 
            VALUES (?, ?, ?, ?, ?)");
            
        foreach ($defaultFields as $field) {
            $stmt->execute($field);
        }
        
        // Commit transaction
        $pdo->commit();
        
        // Log admin action
        $logStmt = $pdo->prepare("
            INSERT INTO admin_logs (admin_id, action, details)
            VALUES (:admin_id, :action, :details)
        ");
        
        $logStmt->execute([
            ':admin_id' => isset($_SESSION['admin_id']) ? $_SESSION['admin_id'] : 1,
            ':action' => 'reset_kyc_form',
            ':details' => json_encode(['reset_to' => 'default'])
        ]);
        
        echo json_encode(['success' => true, 'message' => 'KYC form fields reset to default']);
    } catch (Exception $e) {
        // Rollback transaction on error
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to reset KYC form fields: ' . $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);
