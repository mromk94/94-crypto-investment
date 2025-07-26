-- Add investment_plans table
CREATE TABLE IF NOT EXISTS investment_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  min_amount DECIMAL(18, 8) NOT NULL,
  max_amount DECIMAL(18, 8) NOT NULL,
  roi_percentage DECIMAL(5, 2) NOT NULL,
  duration_days INT NOT NULL,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add sample investment plans
INSERT INTO investment_plans (name, description, min_amount, max_amount, roi_percentage, duration_days, status) VALUES
('Starter Plan', 'Perfect for beginners', 100.00, 1000.00, 10.00, 30, 'active'),
('Premium Plan', 'For serious investors', 1000.00, 10000.00, 15.00, 60, 'active'),
('VIP Plan', 'Exclusive high-yield plan', 5000.00, 50000.00, 20.00, 90, 'active'),
('Trial Plan', 'Test our platform', 10.00, 100.00, 5.00, 7, 'inactive');
