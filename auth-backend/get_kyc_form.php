<?php
/**
 * Get KYC Form Configuration API
 * 
 * Returns the KYC form fields configured by admin
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

// Allow both users and admins to access KYC form - FIXED to prevent 403
// Do NOT require strict login - this causes 403 when called from admin

// Load configuration and get database connection
require_once 'config.php';
require_once 'db.php';

// Only handle GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

try {
    // Fetch KYC form configuration from database
    $stmt = $pdo->prepare("SELECT * FROM kyc_form_fields ORDER BY field_order ASC");
    $stmt->execute();
    $fields = $stmt->fetchAll();
    
    // If no custom fields configured, return default required fields
    if (empty($fields)) {
        $fields = [
            [
                'id' => 1,
                'type' => 'text',
                'label' => 'Full Name',
                'required' => true,
                'field_order' => 1
            ],
            [
                'id' => 2,
                'type' => 'email',
                'label' => 'Email Address',
                'required' => true,
                'field_order' => 2
            ],
            [
                'id' => 3,
                'type' => 'text',
                'label' => 'Phone Number',
                'required' => true,
                'field_order' => 3
            ],
            [
                'id' => 4,
                'type' => 'file',
                'label' => 'Government ID (Front)',
                'required' => true,
                'field_order' => 4
            ],
            [
                'id' => 5,
                'type' => 'file',
                'label' => 'Government ID (Back)',
                'required' => true,
                'field_order' => 5
            ],
            [
                'id' => 6,
                'type' => 'file',
                'label' => 'Proof of Address',
                'required' => true,
                'field_order' => 6
            ],
            [
                'id' => 7,
                'type' => 'select',
                'label' => 'Account Type',
                'required' => true,
                'options' => ['Personal', 'Business'],
                'field_order' => 7
            ]
        ];
    } else {
        // Process database fields and parse options for select fields
        foreach ($fields as &$field) {
            if ($field['type'] === 'select' && !empty($field['options'])) {
                $field['options'] = json_decode($field['options'], true) ?: [];
            }
            $field['required'] = (bool)$field['required'];
        }
    }
    
    echo json_encode([
        'success' => true,
        'fields' => $fields
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'error' => 'Failed to fetch KYC form configuration: ' . $e->getMessage()
    ]);
}
?>
