<?php
/**
 * get_deposit_status.php
 * 
 * Endpoint to check the status of a user's deposit
 * Provides visual confirmation for deposit status (pending/complete)
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

// Require user authentication
requireLogin(true);

require_once 'config.php';
require_once 'db.php';

// Get the transaction ID from the request
$transaction_id = isset($_GET['transaction_id']) ? (int)$_GET['transaction_id'] : 0;

try {
    // Validate the transaction belongs to the user
    if ($transaction_id > 0) {
        $stmt = $pdo->prepare("
            SELECT t.*, pm.name as payment_method_name 
            FROM transactions t
            LEFT JOIN payment_methods pm ON JSON_EXTRACT(t.details, '$.payment_method_id') = pm.id
            WHERE t.id = ? AND t.user_id = ? AND t.type = 'deposit'
        ");
        $stmt->execute([$transaction_id, isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 0]);
        $transaction = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($transaction) {
            // Get status steps
            $status_steps = getStatusSteps($transaction['status']);
            
            // Format the amount with currency symbol
            $formatted_amount = formatAmount($transaction['amount']);
            
            // Return the transaction with status steps
            echo json_encode([
                'success' => true,
                'transaction' => [
                    'id' => $transaction['id'],
                    'amount' => $transaction['amount'],
                    'formatted_amount' => $formatted_amount,
                    'status' => $transaction['status'],
                    'created_at' => $transaction['created_at'],
                    'payment_method' => $transaction['payment_method_name'],
                    'reference' => $transaction['reference']
                ],
                'status_steps' => $status_steps
            ]);
            exit;
        }
    }
    
    // Get all deposit transactions for this user
    $stmt = $pdo->prepare("
        SELECT t.*, pm.name as payment_method_name 
        FROM transactions t
        LEFT JOIN payment_methods pm ON JSON_EXTRACT(t.details, '$.payment_method_id') = pm.id
        WHERE t.user_id = ? AND t.type = 'deposit'
        ORDER BY t.created_at DESC
    ");
    $stmt->execute([isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 0]);
    $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format transactions for display
    $formatted_transactions = [];
    foreach ($transactions as $transaction) {
        $formatted_transactions[] = [
            'id' => $transaction['id'],
            'amount' => $transaction['amount'],
            'formatted_amount' => formatAmount($transaction['amount']),
            'status' => $transaction['status'],
            'created_at' => $transaction['created_at'],
            'payment_method' => $transaction['payment_method_name'],
            'reference' => $transaction['reference'],
            'status_steps' => getStatusSteps($transaction['status'])
        ];
    }
    
    // Return all transactions
    echo json_encode([
        'success' => true,
        'transactions' => $formatted_transactions
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    error_log('Error getting deposit status: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while checking deposit status'
    ]);
}

/**
 * Get the status steps for a deposit transaction
 * 
 * @param string $current_status The current status of the transaction
 * @return array Array of status steps with completion indicators
 */
function getStatusSteps($current_status) {
    $steps = [
        [
            'name' => 'Submitted',
            'description' => 'Deposit request received',
            'complete' => true, // Always true since we have a record
            'current' => $current_status === 'pending'
        ],
        [
            'name' => 'Processing',
            'description' => 'Deposit is being verified',
            'complete' => in_array($current_status, ['processing', 'approved', 'completed']),
            'current' => $current_status === 'processing'
        ],
        [
            'name' => 'Approved',
            'description' => 'Deposit verified and approved',
            'complete' => in_array($current_status, ['approved', 'completed']),
            'current' => $current_status === 'approved'
        ],
        [
            'name' => 'Completed',
            'description' => 'Funds added to your account',
            'complete' => $current_status === 'completed',
            'current' => $current_status === 'completed'
        ]
    ];
    
    // If rejected, override the steps
    if ($current_status === 'rejected') {
        $steps = [
            [
                'name' => 'Submitted',
                'description' => 'Deposit request received',
                'complete' => true,
                'current' => false
            ],
            [
                'name' => 'Rejected',
                'description' => 'Deposit was rejected',
                'complete' => true,
                'current' => true,
                'error' => true
            ]
        ];
    }
    
    return $steps;
}

/**
 * Format a numeric amount with currency symbol
 * 
 * @param float $amount The amount to format
 * @param string $currency The currency code (default: USD)
 * @return string The formatted amount
 */
function formatAmount($amount, $currency = 'USD') {
    switch ($currency) {
        case 'BTC':
            return '₿ ' . number_format($amount, 8);
        case 'ETH':
            return 'Ξ ' . number_format($amount, 6);
        case 'TON':
            return 'TON ' . number_format($amount, 2);
        case 'SUI':
            return 'SUI ' . number_format($amount, 2);
        case 'USDT':
            return 'USDT ' . number_format($amount, 2);
        default:
            return '$' . number_format($amount, 2);
    }
}
