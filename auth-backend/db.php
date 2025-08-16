<?php
/**
 * Database Connection
 * Establishes connection to the MySQL database
 */

// Check if config.php was included
if (!isset($config) || !is_array($config)) {
    require_once __DIR__ . '/config.php';
}

try {
    // Create PDO connection
    $dsn = 'mysql:host=' . $config['db_host'] . ';dbname=' . $config['db_name'] . ';charset=utf8mb4';
    $pdo = new PDO($dsn, $config['db_user'], $config['db_pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ]);
    
    // Create missing tables if needed
    function ensureCriticalTablesExist() {
        global $pdo, $config;
        
        // Check for critical tables
        $tables = [
            'admin_logs',
            'kyc_form_fields',
            'kyc_requests'
        ];
        
        foreach ($tables as $table) {
            try {
                $stmt = $pdo->query("SHOW TABLES LIKE '{$table}'");
                if ($stmt->rowCount() === 0) {
                    // Table doesn't exist, create it based on name
                    switch($table) {
                        case 'kyc_form_fields':
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
                            break;
                        case 'admin_logs':
                            $pdo->exec("CREATE TABLE IF NOT EXISTS admin_logs (
                                id INT AUTO_INCREMENT PRIMARY KEY,
                                admin_id INT NOT NULL,
                                action VARCHAR(100) NOT NULL,
                                details TEXT NULL,
                                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                            )");
                            break;
                        case 'kyc_requests':
                            $pdo->exec("CREATE TABLE IF NOT EXISTS kyc_requests (
                                id INT AUTO_INCREMENT PRIMARY KEY,
                                user_id INT NOT NULL,
                                status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                                data TEXT NOT NULL,
                                admin_id INT NULL,
                                admin_notes TEXT NULL,
                                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                            )");
                            break;
                    }
                }
            } catch (Exception $e) {
                // Log error but continue
                error_log("Error checking/creating table {$table}: " . $e->getMessage());
            }
        }
    }
    
    // Ensure critical tables exist
    ensureCriticalTablesExist();
    
} catch (PDOException $e) {
    // Log database connection error
    error_log('Database connection failed: ' . $e->getMessage());
    
    // Return JSON error if this is an API endpoint
    if (strpos($_SERVER['REQUEST_URI'], '.php') !== false) {
        header('Content-Type: application/json');
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Database connection failed',
            'details' => [
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'host' => $config['db_host'],
                'database' => $config['db_name']
            ]
        ]);
        exit;
    }
    
    throw new Exception('Database connection failed: ' . $e->getMessage());
}