-- Add missing user_pin_settings table
CREATE TABLE IF NOT EXISTS `user_pin_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `pin_enabled` tinyint(1) DEFAULT '1',
  `max_pins` int DEFAULT '5',
  `pin_expiry_days` int DEFAULT '30',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add missing status and expiry_date fields to withdrawal_pins table
ALTER TABLE `withdrawal_pins` 
  ADD COLUMN IF NOT EXISTS `status` enum('active','used','expired','revoked') DEFAULT 'active' AFTER `used_at`,
  ADD COLUMN IF NOT EXISTS `expiry_date` timestamp NULL DEFAULT NULL AFTER `status`,
  ADD COLUMN IF NOT EXISTS `notes` text COLLATE utf8mb4_unicode_ci AFTER `expiry_date`;
