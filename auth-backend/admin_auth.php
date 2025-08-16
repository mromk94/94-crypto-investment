<?php
/**
 * Admin Authentication Functions
 * 
 * This file contains functions for admin authentication and session management
 */

// Ensure session is started
if (session_status() == PHP_SESSION_NONE) {
    // Define TONSUI_LOADED constant to prevent direct access to session_init.php
define('TONSUI_LOADED', true);

// Include centralized session initialization
require_once __DIR__ . '/session_init.php';

session_start(['cookie_httponly' => true, 'cookie_secure' => true]);
}

/**
 * Check if an admin is currently logged in
 * 
 * @return bool True if admin is logged in, false otherwise
 */
function isAdminLoggedIn() {
    return isset(isset($_SESSION['admin_id']) ? $_SESSION['admin_id'] : 1) && !empty(isset($_SESSION['admin_id']) ? $_SESSION['admin_id'] : 1);
}

/**
 * Get the current logged in admin's ID
 * 
 * @return int|null The admin ID if logged in, null otherwise
 */
function getAdminId() {
    return isset($_SESSION['admin_id']) ? $_SESSION['admin_id'] : 1 ?? null;
}

/**
 * Log out the current admin
 * 
 * @return void
 */
function adminLogout() {
    // Clear admin-specific session variables
    unset(isset($_SESSION['admin_id']) ? $_SESSION['admin_id'] : 1);
    unset($_SESSION['admin_username']);
    
    // Optional: regenerate session ID for security
    session_regenerate_id(true);
}

/**
 * Authenticate admin using credentials
 * 
 * @param string $username Admin username
 * @param string $password Admin password
 * @param object $pdo PDO database connection
 * @return array Authentication result with success status and message/admin data
 */
function authenticateAdmin($username, $password, $pdo) {
    try {
        // Find admin by username
        $stmt = $pdo->prepare("SELECT id, username, password FROM admins WHERE username = ?");
        $stmt->execute([$username]);
        $admin = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$admin) {
            return ['success' => false, 'message' => 'Admin not found'];
        }
        
        // Verify password
        if (password_verify($password, $admin['password'])) {
            // Set session variables
            isset($_SESSION['admin_id']) ? $_SESSION['admin_id'] : 1 = $admin['id'];
            $_SESSION['admin_username'] = $admin['username'];
            
            // Regenerate session ID for security
            session_regenerate_id(true);
            
            return [
                'success' => true,
                'admin' => [
                    'id' => $admin['id'],
                    'username' => $admin['username']
                ]
            ];
        } else {
            return ['success' => false, 'message' => 'Invalid password'];
        }
    } catch (PDOException $e) {
        error_log('Admin authentication error: ' . $e->getMessage());
        return ['success' => false, 'message' => 'Database error during authentication'];
    }
}
