-- Migration: Add security_logs table (fixed)
-- This table will store all security-related events for auditing and monitoring

CREATE TABLE IF NOT EXISTS `security_logs` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `event_type` varchar(100) NOT NULL COMMENT 'Type of security event (e.g., login_attempt, password_reset, etc.)',
  `user_id` int DEFAULT NULL COMMENT 'ID of the user associated with the event, if any',
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

-- Add index for faster lookups by IP (with idempotent check)
SET @dbname = DATABASE();
SET @tablename = 'security_logs';
SET @indexname = 'idx_security_logs_ip';

-- Check if the index already exists
SET @preparedStatement = (SELECT IF(
    NOT EXISTS(
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = @dbname
        AND TABLE_NAME = @tablename
        AND INDEX_NAME = @indexname
    ),
    CONCAT('ALTER TABLE `', @tablename, '` ADD INDEX `', @indexname, '` (`ip_address`)'),
    'SELECT 1'
));

-- Execute the prepared statement
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add comment to the table if it doesn't have one
SET @preparedStatement = (SELECT IF(
    (SELECT TABLE_COMMENT FROM information_schema.TABLES 
     WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename) = '',
    CONCAT('ALTER TABLE `', @tablename, '` COMMENT = "Security event logging for audit and monitoring purposes"'),
    'SELECT 1'
));

PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
