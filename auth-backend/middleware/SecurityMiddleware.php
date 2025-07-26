<?php
/**
 * Security Middleware for Ton Sui Mining
 * 
 * Applies security headers and session validation to all requests
 */

class SecurityMiddleware {
    /**
     * Apply security headers to the response
     */
    public static function applySecurityHeaders() {
        // Remove potentially dangerous headers
        header_remove('X-Powered-By');
        header_remove('Server');
        
        // Security headers
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: DENY');
        header('X-XSS-Protection: 1; mode=block');
        header('Referrer-Policy: same-origin');
        header('Content-Security-Policy: default-src \'self\'');
        header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
        
        // Prevent caching of sensitive pages
        header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        header('Pragma: no-cache');
    }
    
    /**
     * Validate the user's session
     * 
     * @param bool $requireAdmin Whether admin access is required
     * @return array User data if valid, false otherwise
     */
    public static function validateSession($requireAdmin = false) {
        // Start session if not already started
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // Check if user is logged in
        if (empty($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Authentication required']);
            exit;
        }
        
        // Check for session fixation/hijacking
        if (!self::validateSessionSecurity()) {
            self::destroySession();
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Invalid session']);
            exit;
        }
        
        // Check admin access if required
        if ($requireAdmin && empty($_SESSION['admin_logged_in'])) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Admin access required']);
            exit;
        }
        
        // Return user data
        return [
            'id' => $_SESSION['user_id'],
            'username' => $_SESSION['username'] ?? '',
            'email' => $_SESSION['email'] ?? '',
            'is_admin' => !empty($_SESSION['admin_logged_in'])
        ];
    }
    
    /**
     * Validate session security (prevent fixation/hijacking)
     */
    private static function validateSessionSecurity() {
        // Check if user agent has changed
        if (isset($_SESSION['user_agent']) && 
            $_SESSION['user_agent'] !== ($_SERVER['HTTP_USER_AGENT'] ?? '')) {
            return false;
        }
        
        // Check if IP has changed (be careful with this in environments with load balancers)
        $ipKey = 'REMOTE_ADDR';
        if (isset($_SESSION['ip_fingerprint'])) {
            $currentFingerprint = md5(($_SERVER[$ipKey] ?? '') . ($_SERVER['HTTP_USER_AGENT'] ?? ''));
            if ($_SESSION['ip_fingerprint'] !== $currentFingerprint) {
                return false;
            }
        }
        
        // Check session timeout (30 minutes)
        $timeout = 1800; // 30 minutes in seconds
        if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > $timeout)) {
            return false;
        }
        
        // Update last activity time
        $_SESSION['last_activity'] = time();
        
        return true;
    }
    
    /**
     * Completely destroy the session
     */
    public static function destroySession() {
        // Clear session data
        $_SESSION = [];
        
        // Delete the session cookie
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                [
                    'expires' => time() - 42000,
                    'path' => $params['path'],
                    'domain' => $params['domain'],
                    'secure' => $params['secure'],
                    'httponly' => true,
                    'samesite' => 'Strict'
                ]
            );
        }
        
        // Destroy the session
        if (session_status() === PHP_SESSION_ACTIVE) {
            session_destroy();
        }
    }
    
    /**
     * Log a security event
     */
    public static function logSecurityEvent($event, $userId = null, $details = null) {
        global $pdo;
        
        if (!$pdo) {
            error_log("Security event (no DB): $event - User: $userId - Details: " . json_encode($details));
            return;
        }
        
        try {
            $stmt = $pdo->prepare('INSERT INTO security_logs (event_type, user_id, ip_address, user_agent, details, created_at) 
                                 VALUES (?, ?, ?, ?, ?, NOW())');
            $stmt->execute([
                $event,
                $userId,
                $_SERVER['REMOTE_ADDR'] ?? 'unknown',
                $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
                $details ? json_encode($details) : null
            ]);
        } catch (Exception $e) {
            error_log('Failed to log security event: ' . $e->getMessage());
        }
    }
}

// Apply security headers to all requests
SecurityMiddleware::applySecurityHeaders();
