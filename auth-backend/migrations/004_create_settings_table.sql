-- Create settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default settings if the table is empty
INSERT IGNORE INTO `settings` (`setting_key`, `setting_value`) VALUES
('site_title', 'Ton Sui Mining'),
('contact_email', 'admin@tonsuimining.com'),
('theme_color', '#0ea5e9'),
('logo_url', '/logo.png'),
('maintenance_mode', '0'),
('registration_enabled', '1'),
('withdrawal_min_amount', '10'),
('withdrawal_fee', '0.01'),
('referral_bonus', '5'),
('referral_percentage', '5'),
('smtp_enabled', '0'),
('smtp_host', ''),
('smtp_port', '587'),
('smtp_username', ''),
('smtp_password', ''),
('smtp_encryption', 'tls'),
('smtp_from_email', 'noreply@tonsuimining.com'),
('smtp_from_name', 'Ton Sui Mining');
