<?php
/**
 * admin_get_all_withdrawal_pins.php
 * 
 * Admin endpoint to view and manage all withdrawal PINs in the system
 * Includes filtering by user, status, date range, and pagination
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

require_once 'db.php';

try {
    // Parse query parameters
    $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : null;
    $status = isset($_GET['status']) ? trim($_GET['status']) : null;
    $from_date = isset($_GET['from_date']) ? trim($_GET['from_date']) : null;
    $to_date = isset($_GET['to_date']) ? trim($_GET['to_date']) : null;
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $limit = isset($_GET['limit']) ? min(100, max(1, intval($_GET['limit']))) : 20;
    $offset = ($page - 1) * $limit;
    
    // Build the query
    $query = "SELECT 
                wp.id, 
                wp.user_id, 
                wp.pin, 
                wp.status, 
                wp.expiry_date,
                wp.transaction_id, 
                wp.notes,
                wp.created_at, 
                wp.updated_at,
                u.username,
                u.email
            FROM withdrawal_pins wp
            LEFT JOIN users u ON wp.user_id = u.id";
    
    $where_clauses = [];
    $params = [];
    
    if ($user_id) {
        $where_clauses[] = "wp.user_id = ?";
        $params[] = $user_id;
    }
    
    if ($status) {
        if ($status === 'active' || $status === 'used' || $status === 'cancelled' || $status === 'expired') {
            $where_clauses[] = "wp.status = ?";
            $params[] = $status;
        }
    }
    
    if ($from_date) {
        $where_clauses[] = "wp.created_at >= ?";
        $params[] = $from_date . ' 00:00:00';
    }
    
    if ($to_date) {
        $where_clauses[] = "wp.created_at <= ?";
        $params[] = $to_date . ' 23:59:59';
    }
    
    if (!empty($where_clauses)) {
        $query .= " WHERE " . implode(" AND ", $where_clauses);
    }
    
    // Count total matching pins for pagination
    $count_query = "SELECT COUNT(*) FROM withdrawal_pins wp";
    if (!empty($where_clauses)) {
        $count_query .= " WHERE " . implode(" AND ", $where_clauses);
    }
    
    $count_stmt = $pdo->prepare($count_query);
    $count_stmt->execute($params);
    $total_pins = $count_stmt->fetchColumn();
    $total_pages = ceil($total_pins / $limit);
    
    // Add pagination and ordering
    $query .= " ORDER BY wp.created_at DESC LIMIT ? OFFSET ?";
    $params[] = $limit;
    $params[] = $offset;
    
    // Execute the query
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $pins = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get pin settings for users if we're filtering by user_id
    $user_settings = null;
    if ($user_id) {
        $settings_stmt = $pdo->prepare("SELECT * FROM user_pin_settings WHERE user_id = ? LIMIT 1");
        $settings_stmt->execute([$user_id]);
        $user_settings = $settings_stmt->fetch(PDO::FETCH_ASSOC);
        
        // If no explicit settings, get the basic user setting
        if (!$user_settings) {
            $user_stmt = $pdo->prepare("SELECT withdrawal_pin_required FROM users WHERE id = ? LIMIT 1");
            $user_stmt->execute([$user_id]);
            $user_data = $user_stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user_data) {
                $user_settings = [
                    'user_id' => $user_id,
                    'pin_enabled' => (bool)($user_data['withdrawal_pin_required'] ?? 1),
                    'max_pins' => 5,
                    'pin_expiry_days' => 30
                ];
            }
        }
    }
    
    // Prepare the response
    $response = [
        'success' => true,
        'pins' => $pins,
        'pagination' => [
            'total_pins' => $total_pins,
            'total_pages' => $total_pages,
            'current_page' => $page,
            'limit' => $limit
        ]
    ];
    
    if ($user_settings) {
        $response['user_settings'] = $user_settings;
    }
    
    echo json_encode($response);
    
} catch (PDOException $e) {
    error_log('Database error in admin_get_all_withdrawal_pins: ' . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Database error fetching withdrawal PINs'
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch withdrawal pins: ' . $e->getMessage()
    ]);
}
