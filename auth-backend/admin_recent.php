<?php
// admin_recent.php: Returns recent activities for admin dashboard
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

// Include database connection after authentication check
require_once 'db.php';

try {
    // Get recent registrations (last 5)
    $registrations = [];
    $stmt = $pdo->query("SELECT id, username, email, created_at FROM users ORDER BY created_at DESC LIMIT 5");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $registrations[] = [
            'id' => $row['id'],
            'username' => $row['username'],
            'email' => $row['email'],
            'date' => $row['created_at']
        ];
    }
    
    // Get recent deposits (last 5)
    $deposits = [];
    $stmt = $pdo->query("SELECT t.id, u.username, t.amount, t.status, t.created_at 
                        FROM transactions t 
                        JOIN users u ON t.user_id = u.id 
                        WHERE t.type = 'deposit'
                        ORDER BY t.created_at DESC LIMIT 5");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $deposits[] = [
            'id' => $row['id'],
            'username' => $row['username'],
            'amount' => $row['amount'],
            'status' => $row['status'],
            'date' => $row['created_at']
        ];
    }
    
    // Get recent withdrawals (last 5)
    $withdrawals = [];
    $stmt = $pdo->query("SELECT t.id, u.username, t.amount, t.status, t.created_at 
                        FROM transactions t 
                        JOIN users u ON t.user_id = u.id 
                        WHERE t.type = 'withdrawal'
                        ORDER BY t.created_at DESC LIMIT 5");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $withdrawals[] = [
            'id' => $row['id'],
            'username' => $row['username'],
            'amount' => $row['amount'],
            'status' => $row['status'],
            'date' => $row['created_at']
        ];
    }
    
    // Return all recent activities
    echo json_encode([
        'success' => true,
        'data' => [
            'registrations' => $registrations,
            'deposits' => $deposits,
            'withdrawals' => $withdrawals
        ]
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error', 'error' => $e->getMessage()]);
    exit;
}
