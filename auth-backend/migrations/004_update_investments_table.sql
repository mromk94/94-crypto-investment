-- Check and add missing columns to investments table
SET @dbname = DATABASE();
SET @tablename = 'investments';

-- Check and add amount_invested column if it doesn't exist
SET @column_name = 'amount_invested';
SET @preparedStatement = (SELECT IF(
    NOT EXISTS(
        SELECT 1 FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = @dbname 
        AND TABLE_NAME = @tablename 
        AND COLUMN_NAME = @column_name
    ),
    'ALTER TABLE investments ADD COLUMN amount_invested DECIMAL(18, 8) NOT NULL AFTER roi',
    'SELECT 1'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add profit_earned column if it doesn't exist
SET @column_name = 'profit_earned';
SET @preparedStatement = (SELECT IF(
    NOT EXISTS(
        SELECT 1 FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = @dbname 
        AND TABLE_NAME = @tablename 
        AND COLUMN_NAME = @column_name
    ),
    'ALTER TABLE investments ADD COLUMN profit_earned DECIMAL(18, 8) DEFAULT 0.00000000 AFTER amount_invested',
    'SELECT 1'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add payment_method column if it doesn't exist
SET @column_name = 'payment_method';
SET @preparedStatement = (SELECT IF(
    NOT EXISTS(
        SELECT 1 FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = @dbname 
        AND TABLE_NAME = @tablename 
        AND COLUMN_NAME = @column_name
    ),
    'ALTER TABLE investments ADD COLUMN payment_method VARCHAR(50) AFTER profit_earned',
    'SELECT 1'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add transaction_hash column if it doesn't exist
SET @column_name = 'transaction_hash';
SET @preparedStatement = (SELECT IF(
    NOT EXISTS(
        SELECT 1 FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = @dbname 
        AND TABLE_NAME = @tablename 
        AND COLUMN_NAME = @column_name
    ),
    'ALTER TABLE investments ADD COLUMN transaction_hash VARCHAR(255) AFTER payment_method',
    'SELECT 1'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add last_payout_date column if it doesn't exist
SET @column_name = 'last_payout_date';
SET @preparedStatement = (SELECT IF(
    NOT EXISTS(
        SELECT 1 FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = @dbname 
        AND TABLE_NAME = @tablename 
        AND COLUMN_NAME = @column_name
    ),
    'ALTER TABLE investments ADD COLUMN last_payout_date DATETIME AFTER transaction_hash',
    'SELECT 1'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add next_payout_date column if it doesn't exist
SET @column_name = 'next_payout_date';
SET @preparedStatement = (SELECT IF(
    NOT EXISTS(
        SELECT 1 FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = @dbname 
        AND TABLE_NAME = @tablename 
        AND COLUMN_NAME = @column_name
    ),
    'ALTER TABLE investments ADD COLUMN next_payout_date DATETIME AFTER last_payout_date',
    'SELECT 1'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add payout_frequency column if it doesn't exist
SET @column_name = 'payout_frequency';
SET @preparedStatement = (SELECT IF(
    NOT EXISTS(
        SELECT 1 FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = @dbname 
        AND TABLE_NAME = @tablename 
        AND COLUMN_NAME = @column_name
    ),
    'ALTER TABLE investments ADD COLUMN payout_frequency ENUM("daily", "weekly", "monthly", "end_of_term") AFTER next_payout_date',
    'SELECT 1'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Modify status column if it exists
SET @column_name = 'status';
SET @preparedStatement = (SELECT IF(
    EXISTS(
        SELECT 1 FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = @dbname 
        AND TABLE_NAME = @tablename 
        AND COLUMN_NAME = @column_name
    ),
    'ALTER TABLE investments MODIFY COLUMN status ENUM("active", "completed", "cancelled", "pending") DEFAULT "pending"',
    'SELECT 1'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update existing records with default values if needed
UPDATE investments SET 
  amount_invested = COALESCE(amount_invested, amount),
  profit_earned = COALESCE(profit_earned, 0),
  status = COALESCE(status, 'active'),
  payout_frequency = COALESCE(payout_frequency, 'end_of_term')
WHERE amount_invested IS NULL OR profit_earned IS NULL OR status IS NULL OR payout_frequency IS NULL;

-- Add index for better query performance (with idempotent check)
SET @dbname = DATABASE();
SET @tablename = 'investments';
SET @indexname = 'idx_investments_next_payout';

-- Check if the index already exists
SET @preparedStatement = (SELECT IF(
    EXISTS(
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = @dbname
        AND TABLE_NAME = @tablename
        AND INDEX_NAME = @indexname
    ),
    'SELECT 1',
    CONCAT('CREATE INDEX ', @indexname, ' ON ', @tablename, '(next_payout_date, status)')
));

-- Execute the prepared statement
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
