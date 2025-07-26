-- Migration: Add security_logs table
-- This table will store all security-related events for auditing and monitoring

CREATE TABLE IF NOT EXISTS `security_logs` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `event_type` varchar(100) NOT NULL COMMENT 'Type of security event (e.g., login_attempt, password_reset, etc.)',
  `user_id` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'ID of the user associated with the event, if any',
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'IP address of the client',
  `user_agent` text DEFAULT NULL COMMENT 'User agent string of the client',
  `details` text DEFAULT NULL COMMENT 'Additional details about the event in JSON format',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_security_logs_event_type` (`event_type`),
  KEY `idx_security_logs_user_id` (`user_id`),
  KEY `idx_security_logs_created_at` (`created_at`),
  CONSTRAINT `fk_security_logs_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add index for faster lookups by IP
ALTER TABLE `security_logs` ADD INDEX `idx_security_logs_ip` (`ip_address`);

-- Add comment to the table
ALTER TABLE `security_logs` COMMENT = 'Security event logging for audit and monitoring purposes';

-- Add sample event types as an enum for reference
-- This is just for documentation, actual values are stored as strings for flexibility
-- Possible event types:
-- - login_success - Successful user login
-- - login_failed - Failed login attempt
-- - logout - User logout
-- - password_reset_request - Password reset requested
-- - password_reset_success - Password successfully reset
-- - account_locked - Account locked due to too many failed attempts
-- - account_unlocked - Account unlocked by admin
-- - admin_action - Administrative action performed
-- - security_alert - Security-related alert
-- - session_timeout - Session timed out
-- - session_hijack - Possible session hijack attempt detected
