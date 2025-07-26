-- Add investments table for tracking user investments
CREATE TABLE IF NOT EXISTS investments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  plan_id INT NOT NULL,
  amount DECIMAL(18, 8) NOT NULL,
  amount_invested DECIMAL(18, 8) NOT NULL,
  roi DECIMAL(18, 8) NOT NULL,
  profit_earned DECIMAL(18, 8) DEFAULT 0.00000000,
  payment_method VARCHAR(50) DEFAULT NULL,
  transaction_hash VARCHAR(255) DEFAULT NULL,
  last_payout_date DATETIME DEFAULT NULL,
  next_payout_date DATETIME DEFAULT NULL,
  payout_frequency ENUM('daily', 'weekly', 'monthly', 'end_of_term') DEFAULT 'end_of_term',
  status ENUM('active', 'completed', 'cancelled', 'pending') DEFAULT 'pending',
  start_date DATETIME NOT NULL,
  end_date DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES investment_plans(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add index for faster lookups (with idempotent check)
SET @dbname = DATABASE();
SET @tablename = 'investments';

-- Add index for user_id if it doesn't exist
SET @indexname = 'idx_investments_user_id';
SET @preparedStatement = (SELECT IF(
    EXISTS(
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = @dbname
        AND TABLE_NAME = @tablename
        AND INDEX_NAME = @indexname
    ),
    'SELECT 1',
    CONCAT('CREATE INDEX ', @indexname, ' ON ', @tablename, '(user_id)')
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index for plan_id if it doesn't exist
SET @indexname = 'idx_investments_plan_id';
SET @preparedStatement = (SELECT IF(
    EXISTS(
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = @dbname
        AND TABLE_NAME = @tablename
        AND INDEX_NAME = @indexname
    ),
    'SELECT 1',
    CONCAT('CREATE INDEX ', @indexname, ' ON ', @tablename, '(plan_id)')
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index for status if it doesn't exist
SET @indexname = 'idx_investments_status';
SET @preparedStatement = (SELECT IF(
    EXISTS(
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = @dbname
        AND TABLE_NAME = @tablename
        AND INDEX_NAME = @indexname
    ),
    'SELECT 1',
    CONCAT('CREATE INDEX ', @indexname, ' ON ', @tablename, '(status)')
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add sample investment data for testing
-- First, get the first two user IDs and all plan IDs from the database
SET @user1_id = (SELECT id FROM users WHERE username = 'user1' LIMIT 1);
SET @user2_id = (SELECT id FROM users WHERE username = 'user2' LIMIT 1);
SET @admin_id = (SELECT id FROM users WHERE username = 'admin' LIMIT 1);

SET @starter_plan_id = (SELECT id FROM investment_plans WHERE name = 'Starter Plan' LIMIT 1);
SET @premium_plan_id = (SELECT id FROM investment_plans WHERE name = 'Premium Plan' LIMIT 1);
SET @vip_plan_id = (SELECT id FROM investment_plans WHERE name = 'VIP Plan' LIMIT 1);

-- Only insert sample data if we have the required users and plans
INSERT INTO investments (
    user_id, plan_id, amount, amount_invested, roi, profit_earned, 
    payment_method, transaction_hash, last_payout_date, next_payout_date, 
    payout_frequency, status, start_date, end_date
) 
SELECT * FROM (
    -- User 1 - Active investment in Starter Plan (daily payouts)
    SELECT 
        @user1_id as user_id, 
        @starter_plan_id as plan_id, 
        1000.00 as amount, 
        1000.00 as amount_invested, 
        100.00 as roi, 
        25.00 as profit_earned,
        'crypto' as payment_method, 
        'tx_hash_123' as transaction_hash, 
        DATE_SUB(NOW(), INTERVAL 1 DAY) as last_payout_date, 
        DATE_ADD(NOW(), INTERVAL 1 DAY) as next_payout_date,
        'daily' as payout_frequency, 
        'active' as status, 
        DATE_SUB(NOW(), INTERVAL 5 DAY) as start_date, 
        DATE_ADD(NOW(), INTERVAL 25 DAY) as end_date
    WHERE @user1_id IS NOT NULL AND @starter_plan_id IS NOT NULL
    
    UNION ALL
    
    -- User 2 - Active investment in Premium Plan (weekly payouts)
    SELECT 
        @user2_id as user_id, 
        @premium_plan_id as plan_id, 
        5000.00 as amount, 
        5000.00 as amount_invested, 
        750.00 as roi, 
        250.00 as profit_earned,
        'bank_transfer' as payment_method, 
        'tx_hash_456' as transaction_hash, 
        DATE_SUB(NOW(), INTERVAL 7 DAY) as last_payout_date, 
        NOW() as next_payout_date,
        'weekly' as payout_frequency, 
        'active' as status, 
        DATE_SUB(NOW(), INTERVAL 21 DAY) as start_date, 
        DATE_ADD(NOW(), INTERVAL 39 DAY) as end_date
    WHERE @user2_id IS NOT NULL AND @premium_plan_id IS NOT NULL
    
    UNION ALL
    
    -- User 1 - Completed investment in VIP Plan
    SELECT 
        @user1_id as user_id, 
        @vip_plan_id as plan_id, 
        10000.00 as amount, 
        10000.00 as amount_invested, 
        2000.00 as roi, 
        2000.00 as profit_earned,
        'crypto' as payment_method, 
        'tx_hash_789' as transaction_hash, 
        DATE_SUB(NOW(), INTERVAL 7 DAY) as last_payout_date, 
        NULL as next_payout_date,
        'end_of_term' as payout_frequency, 
        'completed' as status, 
        DATE_SUB(NOW(), INTERVAL 90 DAY) as start_date, 
        DATE_SUB(NOW(), INTERVAL 1 DAY) as end_date
    WHERE @user1_id IS NOT NULL AND @vip_plan_id IS NOT NULL
    
    UNION ALL
    
    -- User 2 - Cancelled investment in Starter Plan
    SELECT 
        @user2_id as user_id, 
        @starter_plan_id as plan_id, 
        2000.00 as amount, 
        2000.00 as amount_invested, 
        200.00 as roi, 
        100.00 as profit_earned,
        'bank_transfer' as payment_method, 
        'tx_hash_abc' as transaction_hash, 
        DATE_SUB(NOW(), INTERVAL 3 DAY) as last_payout_date, 
        DATE_ADD(NOW(), INTERVAL 4 DAY) as next_payout_date,
        'monthly' as payout_frequency, 
        'cancelled' as status, 
        DATE_SUB(NOW(), INTERVAL 15 DAY) as start_date, 
        DATE_ADD(NOW(), INTERVAL 15 DAY) as end_date
    WHERE @user2_id IS NOT NULL AND @starter_plan_id IS NOT NULL
) as sample_data
WHERE user_id IS NOT NULL AND plan_id IS NOT NULL;

-- Output a summary of the inserted data
SELECT CONCAT('✅ Inserted ', ROW_COUNT(), ' investment records') as result;
