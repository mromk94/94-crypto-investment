<?php
// Use __DIR__ to get the absolute path to this directory
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth.php';

header('Content-Type: application/json');

// Check if user is admin
if (!isset($_SESSION['user_id']) || !isAdmin($_SESSION['user_id'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

// Get settings
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->query('SELECT * FROM settings');
        $settings = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }
        
        // Ensure all required settings exist with default values
        $defaultSettings = [
            'site_title' => 'Ton Sui Mining',
            'contact_email' => 'admin@tonsuimining.com',
            'theme_color' => '#0ea5e9',
            'logo_url' => '/logo.png',
            'maintenance_mode' => '0',
            'registration_enabled' => '1',
            'withdrawal_min_amount' => '10',
            'withdrawal_fee' => '0.01',
            'referral_bonus' => '5',
            'referral_percentage' => '5',
            'smtp_enabled' => '0',
            'smtp_host' => '',
            'smtp_port' => '587',
            'smtp_username' => '',
            'smtp_password' => '',
            'smtp_encryption' => 'tls',
            'smtp_from_email' => 'noreply@tonsuimining.com',
            'smtp_from_name' => 'Ton Sui Mining',
        ];
        
        // Merge with existing settings
        $settings = array_merge($defaultSettings, $settings);
        
        echo json_encode(['success' => true, 'settings' => $settings]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to fetch settings: ' . $e->getMessage()]);
    }
    exit;
}

// Update settings
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (empty($data) || !is_array($data)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid request data']);
        exit;
    }
    
    try {
        $pdo->beginTransaction();
        
        // Prepare the insert/update statement
        $stmt = $pdo->prepare('INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) 
                              ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)');
        
        // Update each setting
        foreach ($data as $key => $value) {
            // Sanitize the value
            $value = is_array($value) ? json_encode($value) : (string)$value;
            $stmt->execute([$key, $value]);
        }
        
        $pdo->commit();
        
        // Clear any cached settings
        if (function_exists('apcu_clear_cache')) {
            apcu_clear_cache();
        }
        
        echo json_encode(['success' => true, 'message' => 'Settings updated successfully']);
    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to update settings: ' . $e->getMessage()]);
    }
    exit;
}

// Reset settings to defaults
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    try {
        $pdo->beginTransaction();
        
        // Clear all settings
        $pdo->exec('TRUNCATE TABLE settings');
        
        // Insert default settings
        $defaultSettings = [
            'site_title' => 'Ton Sui Mining',
            'contact_email' => 'admin@tonsuimining.com',
            'theme_color' => '#0ea5e9',
            'logo_url' => '/logo.png',
            'maintenance_mode' => '0',
            'registration_enabled' => '1',
            'withdrawal_min_amount' => '10',
            'withdrawal_fee' => '0.01',
            'referral_bonus' => '5',
            'referral_percentage' => '5',
            'smtp_enabled' => '0',
            'smtp_host' => '',
            'smtp_port' => '587',
            'smtp_username' => '',
            'smtp_password' => '',
            'smtp_encryption' => 'tls',
            'smtp_from_email' => 'noreply@tonsuimining.com',
            'smtp_from_name' => 'Ton Sui Mining',
        ];
        
        $stmt = $pdo->prepare('INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)');
        foreach ($defaultSettings as $key => $value) {
            $stmt->execute([$key, $value]);
        }
        
        $pdo->commit();
        
        // Clear any cached settings
        if (function_exists('apcu_clear_cache')) {
            apcu_clear_cache();
        }
        
        echo json_encode(['success' => true, 'message' => 'Settings reset to defaults']);
    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to reset settings: ' . $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);
