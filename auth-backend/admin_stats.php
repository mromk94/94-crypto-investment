<?php
// admin_stats.php: Fixed admin dashboard statistics endpoint

// Enable detailed error logging
ini_set('display_errors', 0); // Don't display errors to browser
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/admin_stats_error.log');

// CORS and security headers
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

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Define TONSUI_LOADED constant to prevent direct access to session_init.php
define('TONSUI_LOADED', true);

// Include centralized session initialization
require_once __DIR__ . '/session_init.php';

// Require admin authentication
requireAdmin(true);

// Log request details
$request_time = date('Y-m-d H:i:s');
$request_ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$request_method = $_SERVER['REQUEST_METHOD'] ?? 'unknown';
error_log("[$request_time] [$request_ip] [$request_method] Admin stats request received");

// Helper function for responses
function respond($success, $message, $code = 200, $data = []) {
    http_response_code($code);
    echo json_encode([
        'success' => $success, 
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

// Database connection
$DB_HOST = $_ENV['DB_HOST'] ?? "localhost";
$DB_NAME = $_ENV['DB_NAME'] ?? "tonsui";
$DB_USER = $_ENV['DB_USER'] ?? "tonsui_user";
$DB_PASS = $_ENV['DB_PASS'] ?? "";

try {
    // Create PDO connection
    $dsn = "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    $pdo = new PDO($dsn, $DB_USER, $DB_PASS, $options);
    error_log("Connected to database successfully");
} catch (PDOException $e) {
    error_log("Database connection failed: " . $e->getMessage());
    respond(false, 'Database connection error', 500);
}

try {
    // Get total users count (handle missing table gracefully)
    try {
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM users");
        $totalUsers = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    } catch (PDOException $e) {
        error_log("Error counting users: " . $e->getMessage());
        $totalUsers = 0;
    }
    
    // Get users joined last 7 days
    try {
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)");
        $newUsers = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    } catch (PDOException $e) {
        error_log("Error counting new users: " . $e->getMessage());
        $newUsers = 0;
    }
    
    // Get total deposits amount
    try {
        $stmt = $pdo->query("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'deposit' AND status = 'approved'");
        $totalDeposits = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    } catch (PDOException $e) {
        error_log("Error summing deposits: " . $e->getMessage());
        $totalDeposits = 0;
    }
    
    // Get total withdrawals amount
    try {
        $stmt = $pdo->query("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'withdrawal' AND status = 'approved'");
        $totalWithdrawals = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    } catch (PDOException $e) {
        error_log("Error summing withdrawals: " . $e->getMessage());
        $totalWithdrawals = 0;
    }
    
    // Get pending deposits count
    try {
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM transactions WHERE type = 'deposit' AND status = 'pending'");
        $pendingDeposits = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    } catch (PDOException $e) {
        error_log("Error counting pending deposits: " . $e->getMessage());
        $pendingDeposits = 0;
    }
    
    // Get pending withdrawals count
    try {
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM transactions WHERE type = 'withdrawal' AND status = 'pending'");
        $pendingWithdrawals = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    } catch (PDOException $e) {
        error_log("Error counting pending withdrawals: " . $e->getMessage());
        $pendingWithdrawals = 0;
    }

    // Return the stats
    $stats = [
        'total_users' => $totalUsers,
        'new_users' => $newUsers,
        'total_deposits' => $totalDeposits,
        'total_withdrawals' => $totalWithdrawals,
        'pending_deposits' => $pendingDeposits,
        'pending_withdrawals' => $pendingWithdrawals,
        'system_time' => date('Y-m-d H:i:s')
    ];
    
    error_log("Admin stats retrieved successfully: " . json_encode($stats));
    respond(true, 'Stats retrieved successfully', 200, $stats);
    
} catch (Exception $e) {
    error_log("Unexpected error retrieving admin stats: " . $e->getMessage());
    respond(false, 'Failed to retrieve stats', 500);
}
