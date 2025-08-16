<?php
/**
 * get_investment_dashboard.php: Returns summarized data about user investments
 * Provides a clear dashboard view of all investments, returns, and statistics
 * Part of Ton Sui Mining investment workflow
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

try {
    // Get all user investments with plan details
    $stmt = $pdo->prepare("
        SELECT 
            i.*,
            p.name AS plan_name,
            p.description AS plan_description,
            p.roi_percentage,
            p.duration_days
        FROM investments i
        JOIN investment_plans p ON i.plan_id = p.id
        WHERE i.user_id = ?
        ORDER BY i.status ASC, i.created_at DESC
    ");
    
    $stmt->execute([isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 0]);
    $investments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Calculate dashboard statistics
    $active_count = 0;
    $completed_count = 0;
    $total_invested = 0;
    $total_roi_earned = 0;
    $total_roi_pending = 0;
    $total_roi_projected = 0;
    
    $today = date('Y-m-d H:i:s');
    
    foreach ($investments as &$investment) {
        // Add formatted dates and time remaining
        $investment['start_date_formatted'] = date('M d, Y', strtotime($investment['start_date']));
        $investment['end_date_formatted'] = date('M d, Y', strtotime($investment['end_date']));
        
        // Calculate days remaining for active investments
        if ($investment['status'] === 'active') {
            $days_remaining = max(0, ceil((strtotime($investment['end_date']) - strtotime($today)) / (60 * 60 * 24)));
            $investment['days_remaining'] = $days_remaining;
            $investment['progress_percent'] = 100 - ($days_remaining / $investment['duration_days'] * 100);
            
            // For active investments, calculate the projected final ROI
            $total_projected_roi = ($investment['amount'] * $investment['roi_percentage'] / 100);
            $investment['projected_final_return'] = $investment['amount'] + $total_projected_roi;
            
            // Calculate ROI earned so far and pending
            $investment['roi_earned'] = $investment['roi'];
            $investment['roi_pending'] = $total_projected_roi - $investment['roi'];
            
            $active_count++;
            $total_roi_pending += $investment['roi_pending'];
        } else {
            // For completed investments
            $investment['days_remaining'] = 0;
            $investment['progress_percent'] = 100;
            $completed_count++;
        }
        
        // Add to totals
        $total_invested += $investment['amount'];
        $total_roi_earned += $investment['roi'];
        
        // Calculate projected ROI (for all investments)
        $projected_roi = ($investment['amount'] * $investment['roi_percentage'] / 100);
        $total_roi_projected += $projected_roi;
        
        // Format monetary values
        $investment['amount_formatted'] = number_format($investment['amount'], 2);
        $investment['roi_formatted'] = number_format($investment['roi'], 2);
        $investment['total_return_formatted'] = number_format($investment['total_return'], 2);
    }
    
    // Get latest ROI transactions
    $transactionStmt = $pdo->prepare("
        SELECT * FROM transactions 
        WHERE user_id = ? AND type = 'profit' 
        ORDER BY created_at DESC 
        LIMIT 5
    ");
    
    $transactionStmt->execute([isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 0]);
    $roi_transactions = $transactionStmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($roi_transactions as &$transaction) {
        $transaction['created_at_formatted'] = date('M d, Y H:i', strtotime($transaction['created_at']));
        $transaction['amount_formatted'] = number_format($transaction['amount'], 8);
        
        // Extract investment details from JSON
        $details = json_decode($transaction['details'], true);
        if (is_array($details)) {
            $transaction['investment_id'] = $details['investment_id'] ?? null;
            $transaction['plan_id'] = $details['plan_id'] ?? null;
            $transaction['description'] = $details['description'] ?? 'ROI payment';
        }
    }
    
    // Return the dashboard data
    $dashboard = [
        'summary' => [
            'active_investments' => $active_count,
            'completed_investments' => $completed_count,
            'total_investments' => count($investments),
            'total_invested' => $total_invested,
            'total_invested_formatted' => number_format($total_invested, 2),
            'total_roi_earned' => $total_roi_earned,
            'total_roi_earned_formatted' => number_format($total_roi_earned, 8),
            'total_roi_pending' => $total_roi_pending,
            'total_roi_pending_formatted' => number_format($total_roi_pending, 8),
            'total_roi_projected' => $total_roi_projected,
            'total_roi_projected_formatted' => number_format($total_roi_projected, 8),
        ],
        'investments' => $investments,
        'roi_transactions' => $roi_transactions
    ];
    
    echo json_encode([
        'success' => true, 
        'dashboard' => $dashboard
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    error_log('Error fetching investment dashboard: ' . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'message' => 'Failed to load investment dashboard: ' . $e->getMessage()
    ]);
}
