-- Add payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add content_sections table
CREATE TABLE IF NOT EXISTS content_sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  section_key VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  content LONGTEXT,
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default content sections if they don't exist
INSERT IGNORE INTO content_sections (section_key, title, content, status) VALUES
('home_hero', 'Home Hero', '<h1>Welcome to Ton Sui Mining</h1><p>Start mining Ton Sui today and earn rewards!</p>', 'published'),
('about_us', 'About Us', '<h2>About Ton Sui Mining</h2><p>We are a leading cryptocurrency mining platform.</p>', 'published'),
('testimonials', 'Testimonials', '<h2>What Our Users Say</h2><p>Great platform with amazing returns!</p>', 'published'),
('faq', 'Frequently Asked Questions', '<h2>Frequently Asked Questions</h2><p>Find answers to common questions about our platform.</p>', 'published'),
('terms', 'Terms of Service', '<h2>Terms of Service</h2><p>Please read our terms and conditions carefully.</p>', 'published'),
('privacy', 'Privacy Policy', '<h2>Privacy Policy</h2><p>Learn how we protect your data.</p>', 'published');

-- Add admin_logs table for admin activity tracking
CREATE TABLE IF NOT EXISTS admin_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  details TEXT,
  ip_address VARCHAR(45) DEFAULT NULL,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
