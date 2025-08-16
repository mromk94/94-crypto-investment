<?php
/**
 * admin_manage_plans.php: Handles admin creation, update and deletion of investment plans
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
header('Access-Control-Allow-Methods: POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
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

// Require admin authentication
requireAdmin(true);

require_once 'config.php';
require_once 'db.php';
require_once 'csrf.php';

function respond($success, $message, $data = null) {
    $response = ['success' => $success, 'message' => $message];
    if ($data !== null) {
        $response['data'] = $data;
    }
    echo json_encode($response);
    exit;
}

// Parse request data
$data = json_decode(file_get_contents('php://input'), true);
$method = $_SERVER['REQUEST_METHOD'];

try {
    // Handle different HTTP methods (REST API)
    switch ($method) {
        case 'POST': // Create new plan
            if (!isset($data['name'], $data['roi_percentage'], $data['duration_days'], $data['min_amount'])) {
                respond(false, 'Missing required fields. Required: name, roi_percentage, duration_days, min_amount');
            }
            
            $name = $data['name'];
            $roi_percentage = floatval($data['roi_percentage']);
            $duration_days = intval($data['duration_days']);
            $min_amount = floatval($data['min_amount']);
            $max_amount = isset($data['max_amount']) ? floatval($data['max_amount']) : null;
            $description = $data['description'] ?? '';
            $features = isset($data['features']) ? json_encode($data['features']) : null;
            
            // Validate input
            if ($roi_percentage <= 0) {
                respond(false, 'ROI percentage must be greater than zero.');
            }
            
            if ($duration_days <= 0) {
                respond(false, 'Duration days must be greater than zero.');
            }
            
            if ($min_amount <= 0) {
                respond(false, 'Minimum amount must be greater than zero.');
            }
            
            if ($max_amount !== null && $max_amount <= $min_amount) {
                respond(false, 'Maximum amount must be greater than minimum amount.');
            }
            
            // Create the plan
            $stmt = $pdo->prepare('
                INSERT INTO investment_plans 
                (name, roi_percentage, duration_days, min_amount, max_amount, description, features, status, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            ');
            
            $stmt->execute([
                $name,
                $roi_percentage,
                $duration_days,
                $min_amount,
                $max_amount,
                $description,
                $features,
                'active' // Default to active
            ]);
            
            $plan_id = $pdo->lastInsertId();
            
            respond(true, 'Investment plan created successfully.', [
                'id' => $plan_id,
                'name' => $name,
                'roi_percentage' => $roi_percentage,
                'duration_days' => $duration_days,
                'min_amount' => $min_amount,
                'max_amount' => $max_amount,
                'description' => $description,
                'features' => $data['features'] ?? null,
                'status' => 'active'
            ]);
            break;
            
        case 'PUT': // Update existing plan
            if (!isset($data['id'])) {
                respond(false, 'Missing plan ID.');
            }
            
            $plan_id = intval($data['id']);
            
            // Check if plan exists
            $checkStmt = $pdo->prepare('SELECT id FROM investment_plans WHERE id = ?');
            $checkStmt->execute([$plan_id]);
            if (!$checkStmt->fetch()) {
                respond(false, 'Investment plan not found.');
            }
            
            // Build update query dynamically based on provided fields
            $updateFields = [];
            $params = [];
            
            // Check each possible field and add to update if present
            if (isset($data['name'])) {
                $updateFields[] = 'name = ?';
                $params[] = $data['name'];
            }
            
            if (isset($data['roi_percentage'])) {
                $roi_percentage = floatval($data['roi_percentage']);
                if ($roi_percentage <= 0) {
                    respond(false, 'ROI percentage must be greater than zero.');
                }
                $updateFields[] = 'roi_percentage = ?';
                $params[] = $roi_percentage;
            }
            
            if (isset($data['duration_days'])) {
                $duration_days = intval($data['duration_days']);
                if ($duration_days <= 0) {
                    respond(false, 'Duration days must be greater than zero.');
                }
                $updateFields[] = 'duration_days = ?';
                $params[] = $duration_days;
            }
            
            if (isset($data['min_amount'])) {
                $min_amount = floatval($data['min_amount']);
                if ($min_amount <= 0) {
                    respond(false, 'Minimum amount must be greater than zero.');
                }
                $updateFields[] = 'min_amount = ?';
                $params[] = $min_amount;
            }
            
            if (isset($data['max_amount'])) {
                $updateFields[] = 'max_amount = ?';
                $params[] = floatval($data['max_amount']);
            }
            
            if (isset($data['description'])) {
                $updateFields[] = 'description = ?';
                $params[] = $data['description'];
            }
            
            if (isset($data['features'])) {
                $updateFields[] = 'features = ?';
                $params[] = json_encode($data['features']);
            }
            
            if (isset($data['status'])) {
                if (!in_array($data['status'], ['active', 'inactive'])) {
                    respond(false, 'Invalid status. Must be either "active" or "inactive".');
                }
                $updateFields[] = 'status = ?';
                $params[] = $data['status'];
            }
            
            // Add updated_at field
            $updateFields[] = 'updated_at = NOW()';
            
            // If no fields to update, return
            if (empty($updateFields)) {
                respond(false, 'No fields to update.');
            }
            
            // Build and execute the update query
            $sql = 'UPDATE investment_plans SET ' . implode(', ', $updateFields) . ' WHERE id = ?';
            $params[] = $plan_id;
            
            $updateStmt = $pdo->prepare($sql);
            $updateStmt->execute($params);
            
            respond(true, 'Investment plan updated successfully.');
            break;
            
        case 'DELETE': // Delete or deactivate plan
            if (!isset($data['id'])) {
                respond(false, 'Missing plan ID.');
            }
            
            $plan_id = intval($data['id']);
            $hard_delete = isset($data['hard_delete']) && $data['hard_delete'] === true;
            
            // Check if plan exists
            $checkStmt = $pdo->prepare('SELECT id FROM investment_plans WHERE id = ?');
            $checkStmt->execute([$plan_id]);
            if (!$checkStmt->fetch()) {
                respond(false, 'Investment plan not found.');
            }
            
            // Check if plan has active investments
            $checkInvestmentsStmt = $pdo->prepare('
                SELECT COUNT(*) as count 
                FROM investments 
                WHERE plan_id = ? AND status = "active"
            ');
            $checkInvestmentsStmt->execute([$plan_id]);
            $result = $checkInvestmentsStmt->fetch();
            
            if ($result && $result['count'] > 0) {
                respond(false, 'Cannot delete plan. There are active investments using this plan.');
            }
            
            if ($hard_delete) {
                // Hard delete - remove from database
                $stmt = $pdo->prepare('DELETE FROM investment_plans WHERE id = ?');
                $stmt->execute([$plan_id]);
                respond(true, 'Investment plan deleted successfully.');
            } else {
                // Soft delete - just mark as inactive
                $stmt = $pdo->prepare('UPDATE investment_plans SET status = "inactive", updated_at = NOW() WHERE id = ?');
                $stmt->execute([$plan_id]);
                respond(true, 'Investment plan deactivated successfully.');
            }
            break;
            
        default:
            http_response_code(405);
            respond(false, 'Method not allowed.');
    }
} catch (Exception $e) {
    error_log('Admin manage plans error: ' . $e->getMessage());
    respond(false, 'An error occurred while processing the request. Please try again or contact support.');
}
