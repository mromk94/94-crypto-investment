<?php
/**
 * Get User Tickets API
 * 
 * Retrieves tickets for the logged-in user with admin responses
 */

header('Content-Type: application/json');

// CRITICAL FIX: Allow specific origin instead of wildcard for credential support
$allowed_origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $allowed_origin");
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

// CRITICAL: Strong cache control to prevent stale data issues
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

// CRITICAL FIX: Enhanced session debugging and relaxed authentication
if (!isUserLoggedIn() && !isUserAdmin()) {
    // Debug session state
    $debug = [
        'error' => 'Authentication failed',
        'session_id' => session_id(),
        'session_status' => session_status(),
        'session_variables' => array_keys($_SESSION),
    ];
    
    // Log the failure for debugging
    error_log('User ticket auth failed: ' . json_encode($debug));
    
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => 'Authentication required',
        'debug' => $debug
    ]);
    exit;
}

// Allow either user_id from session or impersonation by admin
$user_id = isset($_GET['user_id']) && isUserAdmin() ? intval($_GET['user_id']) : isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 0;

// Debug endpoint for troubleshooting if needed
if (isset($_GET['debug']) && $_GET['debug'] == 1) {
    echo json_encode([
        'success' => true,
        'debug' => true,
        'session' => [
            'id' => session_id(),
            'admin' => isset($_SESSION['admin_logged_in']) ? $_SESSION['admin_logged_in'] : false,
            'user' => isset(isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 0) ? isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 0 : null,
            'selected_user_id' => $user_id
        ]
    ]);
    exit;
}

// Load configuration and database connection
require_once 'config.php';
require_once 'db.php';

// User ID already set in authentication block above

try {
    // Enhanced query to include admin response information
    $query = "
        SELECT t.*, 
               a.username AS admin_username 
        FROM tickets t 
        LEFT JOIN admins a ON t.admin_id = a.id 
        WHERE t.user_id = ? 
        ORDER BY t.created_at DESC
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute([$user_id]);
    $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format dates for easier frontend display
    foreach ($tickets as &$ticket) {
        if (!empty($ticket['created_at'])) {
            $ticket['created_at_formatted'] = date('M d, Y h:i A', strtotime($ticket['created_at']));
        }
        if (!empty($ticket['response_at'])) {
            $ticket['response_at_formatted'] = date('M d, Y h:i A', strtotime($ticket['response_at']));
        }
        
        // Add status class for frontend styling
        switch ($ticket['status']) {
            case 'open':
                $ticket['status_class'] = 'text-yellow-400';
                break;
            case 'closed':
                $ticket['status_class'] = 'text-green-400';
                break;
            case 'pending':
                $ticket['status_class'] = 'text-blue-400';
                break;
            case 'assigned':
                $ticket['status_class'] = 'text-purple-400';
                break;
            default:
                $ticket['status_class'] = 'text-gray-400';
        }
    }
    
    echo json_encode(['success' => true, 'tickets' => $tickets]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
