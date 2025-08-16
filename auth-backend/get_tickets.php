<?php
/**
 * Get Tickets API
 * 
 * Fetches all tickets with user and admin information for admin dashboard
 */

header("Content-Type: application/json");
// Critical: Add cache control headers
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

// Define TONSUI_LOADED constant to prevent direct access to session_init.php
define('TONSUI_LOADED', true);

// Include centralized session initialization
require_once __DIR__ . '/session_init.php';

// Require admin authentication
requireAdmin(true);

require_once "db.php";

try {
    // Enhanced query to include admin details for responses
    $query = "SELECT t.*, 
              u.username,
              a.username AS admin_username 
              FROM tickets t 
              LEFT JOIN users u ON t.user_id = u.id 
              LEFT JOIN admins a ON t.admin_id = a.id 
              ORDER BY t.created_at DESC";
              
    $stmt = $pdo->query($query);
    $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format dates for easier frontend display
    foreach ($tickets as &$ticket) {
        if (!empty($ticket['created_at'])) {
            $ticket['created_at_formatted'] = date('M d, Y h:i A', strtotime($ticket['created_at']));
        }
        if (!empty($ticket['response_at'])) {
            $ticket['response_at_formatted'] = date('M d, Y h:i A', strtotime($ticket['response_at']));
        }
    }
    
    echo json_encode(["success" => true, "tickets" => $tickets]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>