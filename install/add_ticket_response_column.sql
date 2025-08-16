-- Add response column to tickets table for admin responses
ALTER TABLE `tickets` ADD COLUMN `response` TEXT COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `message`;
ALTER TABLE `tickets` ADD COLUMN `response_at` TIMESTAMP NULL DEFAULT NULL AFTER `created_at`;
ALTER TABLE `tickets` ADD COLUMN `admin_id` int DEFAULT NULL AFTER `user_id`;

-- Update existing tickets to ensure they work with the new schema
UPDATE `tickets` SET `response` = NULL, `response_at` = NULL, `admin_id` = NULL;

-- Add indexes for better performance
ALTER TABLE `tickets` ADD INDEX `idx_status` (`status`);
