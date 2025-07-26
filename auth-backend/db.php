<?php
// db.php: Database connection for Ton Sui Mining Auth

// Check if we're running in a test environment
$isTestEnv = (getenv('APP_ENV') === 'test' || php_sapi_name() === 'cli');

if ($isTestEnv) {
    // Load test configuration
    $testConfigFile = __DIR__ . '/../tests/test_config.php';
    if (file_exists($testConfigFile)) {
        $testConfig = include $testConfigFile;
        $host = $testConfig['db_host'];
        $db   = $testConfig['db_name'];
        $user = $testConfig['db_user'];
        $pass = $testConfig['db_pass'];
    } else {
        // Fallback to test defaults if config file not found
        $host = 'localhost';
        $db   = 'tonsui_test';
        $user = 'root';
        $pass = '';
    }
} else {
    // Production/development configuration
    $host = 'localhost';
    $db   = 'tonsui';
    $user = 'root';
    $pass = '';
}

$charset = 'utf8mb4';

// Set up DSN with error handling for port specification
$port = '';
if (strpos($host, ':') !== false) {
    list($host, $port) = explode(':', $host, 2);
    $dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";
} else {
    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
}

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
    PDO::ATTR_TIMEOUT => 5, // Add a timeout to prevent hanging
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
    
    // Test the connection with a simple query
    $pdo->query('SELECT 1');
    
} catch (PDOException $e) {
    error_log('Database connection failed: ' . $e->getMessage());
    
    // Return a JSON response if this is an API request
    if (!empty($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false) {
        header('Content-Type: application/json');
        http_response_code(500);
        echo json_encode([
            'success' => false, 
            'message' => 'Database connection failed',
            'error' => $isTestEnv ? $e->getMessage() : 'Internal server error'
        ]);
    } else {
        // For non-API requests, just show a simple error
        http_response_code(500);
        echo 'Database connection failed. Please try again later.';
        if ($isTestEnv) {
            echo ' Error: ' . $e->getMessage();
        }
    }
    exit;
}
