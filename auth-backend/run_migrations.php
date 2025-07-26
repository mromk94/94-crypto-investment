<?php
// run_migrations.php: Applies database migrations
require_once 'db.php';

echo "Running database migrations...\n";

// Get all migration files
$migrationDir = __DIR__ . '/migrations';
$migrationFiles = glob("$migrationDir/*.sql");
sort($migrationFiles);

// Check if migrations table exists
$migrationsTableExists = $pdo->query("SHOW TABLES LIKE 'migrations'")->rowCount() > 0;

if (!$migrationsTableExists) {
    // Create migrations table if it doesn't exist
    $pdo->exec("CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        migration VARCHAR(255) NOT NULL,
        batch INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    
    echo "Created migrations table\n";
}

// Get already run migrations
$runMigrations = $pdo->query("SELECT migration FROM migrations")->fetchAll(PDO::FETCH_COLUMN);
$batch = $pdo->query("SELECT IFNULL(MAX(batch), 0) + 1 as next_batch FROM migrations")->fetchColumn();

// Run new migrations
$applied = 0;
foreach ($migrationFiles as $file) {
    $migrationName = basename($file);
    
    if (!in_array($migrationName, $runMigrations)) {
        echo "Applying migration: $migrationName\n";
        
        // Read and execute migration SQL
        $sql = file_get_contents($file);
        
        try {
            $pdo->exec($sql);
            
            // Record migration
            $stmt = $pdo->prepare("INSERT INTO migrations (migration, batch) VALUES (?, ?)");
            $stmt->execute([$migrationName, $batch]);
            
            $applied++;
            echo "Applied migration: $migrationName\n";
        } catch (PDOException $e) {
            die("Error applying migration $migrationName: " . $e->getMessage() . "\n");
        }
    }
}

if ($applied === 0) {
    echo "No new migrations to apply.\n";
} else {
    echo "Successfully applied $applied migration(s).\n";
}
