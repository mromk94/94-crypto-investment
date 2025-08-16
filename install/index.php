<?php
/**
 * Ton Sui Mining Installer
 * 
 * A clean, testable installer implementation that follows test_install.php requirements.
 */

// Set error reporting for development
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Start session
session_start();

// Define paths
$rootDir = dirname(__DIR__);
$lockFile = $rootDir . '/install.lock';
$configFile = $rootDir . '/auth-backend/config.php';

// Check if already installed
if (file_exists($lockFile) && !isset($_GET['force'])) {
    show_installation_locked();
    exit;
}

// Handle CSRF token
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (empty($_POST['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
        die('Invalid CSRF token');
    }
    
    handle_installation();
    exit;
}

// Show installation form
show_installation_form();

/**
 * Handle the installation process
 */
function handle_installation() {
    global $rootDir, $lockFile, $configFile;
    
    // Validate required fields with proper error handling
    $required = [
        'db_host' => 'Database host',
        'db_name' => 'Database name',
        'db_user' => 'Database username',
        'admin_username' => 'Admin username',
        'admin_email' => 'Admin email',
        'admin_password' => 'Admin password'
    ];
    
    $missing = [];
    foreach ($required as $field => $label) {
        if (empty(trim($_POST[$field] ?? ''))) {
            $missing[] = $label;
        }
    }
    
    if (!empty($missing)) {
        $errorMsg = "The following fields are required: " . implode(', ', $missing);
        show_error_page($errorMsg);
        exit;
    }
    
    // Validate email format
    if (!filter_var($_POST['admin_email'], FILTER_VALIDATE_EMAIL)) {
        show_error_page('Please enter a valid email address');
        exit;
    }
    
    // Sanitize inputs
    $db = [
        'host' => $_POST['db_host'],
        'name' => preg_replace('/[^a-z0-9_]/i', '', $_POST['db_name']),
        'user' => $_POST['db_user'],
        'pass' => $_POST['db_pass'] ?? ''
    ];
    
    $admin = [
        'username' => $_POST['admin_username'],
        'email' => filter_var($_POST['admin_email'], FILTER_VALIDATE_EMAIL),
        'password' => $_POST['admin_password']
    ];
    
    if (!$admin['email']) {
        die('Invalid admin email address');
    }
    
    // 1. Connect to database and create tables
    try {
        // First test connection without database
        try {
            $pdo = new PDO(
                "mysql:host={$db['host']};charset=utf8mb4",
                $db['user'],
                $db['pass'],
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::ATTR_TIMEOUT => 5, // 5 second timeout
                ]
            );
        } catch (PDOException $e) {
            $errorCode = $e->getCode();
            $errorMessage = "Could not connect to the database server. ";
            
            if ($errorCode == 2002) {
                $errorMessage .= "The database host '{$db['host']}' could not be reached. ";
                $errorMessage .= "Please verify the hostname and ensure the database server is running.";
            } elseif ($errorCode == 1045) {
                $errorMessage .= "Access denied for user '{$db['user']}'. ";
                $errorMessage .= "Please check the username and password and try again.";
            } else {
                $errorMessage .= "Error: " . $e->getMessage();
            }
            
            throw new Exception($errorMessage);
        }
        
        // Create database if not exists
        try {
            $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$db['name']}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            $pdo->exec("USE `{$db['name']}`");
        } catch (PDOException $e) {
            throw new Exception("Failed to create or select database '{$db['name']}'. " . 
                             "The database user may not have sufficient privileges. " . 
                             "Error: " . $e->getMessage());
        }
        
        // Import schema from the new schema file
        $schemaFile = __DIR__ . '/tonsui_schema.sql';
        if (!file_exists($schemaFile)) {
            throw new Exception("Database schema file not found at: " . $schemaFile);
        }
        
        // Read the SQL file
        $sql = file_get_contents($schemaFile);
        if ($sql === false) {
            throw new Exception("Failed to read schema file");
        }
        
        // Normalize line endings
        $sql = str_replace(["\r\n", "\r"], "\n", $sql);
        
        // Remove comments
        $sql = preg_replace("/--.*?\n/", "", $sql);
        $sql = preg_replace("/#.*?\n/", "", $sql);
        $sql = preg_replace("/\/\*.*?\*\//s", "", $sql);
        
        // Split into individual queries
        $queries = [];
        $delimiter = ';';
        $offset = 0;
        
        while (($pos = strpos($sql, $delimiter, $offset)) !== false) {
            $query = trim(substr($sql, $offset, $pos - $offset));
            if (!empty($query) && !preg_match('/^\s*$/s', $query)) {
                $queries[] = $query;
            }
            $offset = $pos + 1;
        }
        
        // Add the last query if there's no trailing delimiter
        $lastQuery = trim(substr($sql, $offset));
        if (!empty($lastQuery) && !preg_match('/^\s*$/s', $lastQuery)) {
            $queries[] = $lastQuery;
        }
        
        // Execute each query individually with error handling
        foreach ($queries as $i => $query) {
            $query = trim($query);
            if (empty($query)) {
                continue;
            }
            
            try {
                $pdo->exec($query);
            } catch (PDOException $e) {
                // Skip errors for existing tables or duplicate keys
                if (strpos($e->getMessage(), 'already exists') === false && 
                    strpos($e->getMessage(), 'Duplicate key') === false) {
                    error_log("SQL Error in query #" . ($i + 1) . ": " . $e->getMessage());
                    error_log("Query: " . $query);
                    throw new Exception("Failed to execute SQL query #" . ($i + 1) . ": " . $e->getMessage());
                }
            }
        }
        
        // Create admin user directly in admins table with robust error handling
        try {
            // First check if admin user already exists (prevent duplicate errors)
            $checkStmt = $pdo->prepare("SELECT COUNT(*) FROM admins WHERE username = ? OR email = ?");
            $checkStmt->execute([$admin['username'], $admin['email']]);
            $exists = (int)$checkStmt->fetchColumn();
            
            if ($exists > 0) {
                // Admin already exists, log but continue (not a fatal error)
                error_log("Notice: Admin user '{$admin['username']}' already exists in database");
            } else {
                // Create the admin user
                $hashedPassword = password_hash($admin['password'], PASSWORD_BCRYPT);
                $stmt = $pdo->prepare("INSERT INTO admins (name, username, email, password, is_admin, status, created_at) 
                                   VALUES (?, ?, ?, ?, 1, 'active', NOW())");
                $stmt->execute([
                    $admin['username'], // Use username as name if not provided
                    $admin['username'],
                    $admin['email'],
                    $hashedPassword
                    // Note: is_admin=1 is hardcoded in the SQL query, not needed as a parameter
                ]);
                
                // Verify admin was created
                $verifyStmt = $pdo->prepare("SELECT id FROM admins WHERE username = ?");
                $verifyStmt->execute([$admin['username']]);
                if (!$verifyStmt->fetch()) {
                    throw new Exception("Failed to verify admin user creation. The admin user may not have been created.");
                }
                
                error_log("Admin user '{$admin['username']}' created successfully");
            }
        } catch (PDOException $e) {
            error_log("Critical error creating admin user: " . $e->getMessage());
            throw new Exception("Failed to create admin user: " . $e->getMessage());
        }
        
        // Write config file
        $configDir = dirname($configFile);
        if (!is_dir($configDir)) {
            mkdir($configDir, 0755, true);
        }
        
        // Create config file with the actual database credentials entered by the user
        $configContent = "<?php\n/**\n * Configuration File\n *\n * Contains database, SMTP, and other configuration settings\n * Generated by the installer\n */\n\nreturn [\n    // Database Configuration\n    'db_host' => '" . addslashes($db['host']) . "',\n";
        $configContent .= "    'db_name' => '" . addslashes($db['name']) . "',\n";
        $configContent .= "    'db_user' => '" . addslashes($db['user']) . "',\n";
        $configContent .= "    'db_pass' => '" . addslashes($db['pass']) . "',\n";
        $configContent .= "    'db_port' => '3306',\n";
        
        // SMTP settings if provided
        $configContent .= "\n    // SMTP Configuration\n";
        if (!empty($_POST['smtp_host'])) {
            $configContent .= "    'smtp_host' => '" . addslashes($_POST['smtp_host']) . "',\n";
            $configContent .= "    'smtp_port' => " . intval($_POST['smtp_port'] ?? 587) . ",\n";
            $configContent .= "    'smtp_user' => '" . addslashes($_POST['smtp_user'] ?? '') . "',\n";
            $configContent .= "    'smtp_pass' => '" . addslashes($_POST['smtp_pass'] ?? '') . "',\n";
            $configContent .= "    'smtp_from' => '" . addslashes($_POST['smtp_from'] ?? 'noreply@' . $_SERVER['HTTP_HOST']) . "',\n";
            $configContent .= "    'smtp_from_name' => 'TonSuiMining',\n";
            $configContent .= "    'smtp_secure' => 'tls'\n";
        } else {
            // Add default SMTP settings if not provided
            $configContent .= "    'smtp_host' => 'smtp.example.com',\n";
            $configContent .= "    'smtp_port' => 587,\n";
            $configContent .= "    'smtp_user' => 'noreply@example.com',\n";
            $configContent .= "    'smtp_pass' => '',\n";
            $configContent .= "    'smtp_from' => 'noreply@example.com',\n";
            $configContent .= "    'smtp_from_name' => 'TonSuiMining',\n";
            $configContent .= "    'smtp_secure' => 'tls'\n";
        }
        
        // Close the config array with a closing bracket
        $configContent .= "];\n";
        
        // Write config file to auth-backend directory
        file_put_contents($configFile, $configContent);
        chmod($configFile, 0640);
        
        // Also write config file to root directory to ensure all components can find it
        $rootConfigFile = $rootDir . '/config.php';
        file_put_contents($rootConfigFile, $configContent);
        chmod($rootConfigFile, 0640);
        
        // Create lock file
        file_put_contents($lockFile, 'Installation completed on ' . date('Y-m-d H:i:s'));
        chmod($lockFile, 0644);
        
        // Show success page
        show_installation_complete();
        
    } catch (PDOException $e) {
        die('Database error: ' . $e->getMessage());
    } catch (Exception $e) {
        die('Installation failed: ' . $e->getMessage());
    }
}

/**
 * Show the installation form
 */
function show_installation_form() {
    $csrfToken = $_SESSION['csrf_token'];
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Install Ton Sui Mining</title>
        <style>
            body { 
                background: #10131a; 
                color: #fff; 
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; 
                margin: 0; 
                padding: 2rem; 
                line-height: 1.6;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
                background: #181c25;
                padding: 2rem;
                border-radius: 0.5rem;
                box-shadow: 0 0 20px rgba(0,0,0,0.3);
            }
            h1 {
                color: #40c9ff;
                margin-top: 0;
                text-align: center;
            }
            .form-group {
                margin-bottom: 1.5rem;
            }
            label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 600;
            }
            input[type="text"],
            input[type="email"],
            input[type="password"],
            input[type="number"],
            select {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid #2d3748;
                border-radius: 0.375rem;
                background: #1a202c;
                color: #fff;
                font-size: 1rem;
            }
            input:focus {
                outline: none;
                border-color: #4299e1;
                box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
            }
            .btn {
                display: inline-block;
                background: #4299e1;
                color: white;
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 0.375rem;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            .btn:hover {
                background: #3182ce;
            }
            .section {
                margin-bottom: 2.5rem;
                padding-bottom: 1.5rem;
                border-bottom: 1px solid #2d3748;
            }
            .section:last-child {
                border-bottom: none;
            }
            .section-title {
                color: #63b3ed;
                margin-top: 0;
                margin-bottom: 1.5rem;
                font-size: 1.25rem;
            }
            .alert {
                padding: 1rem;
                border-radius: 0.375rem;
                margin-bottom: 1.5rem;
            }
            .alert-info {
                background: #2b6cb0;
                color: #ebf8ff;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Ton Sui Mining Installation</h1>
            
            <div class="alert alert-info">
                Welcome to the Ton Sui Mining installation wizard. Please fill in the required information below.
            </div>
            
            <form method="post" action="">
                <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars($csrfToken); ?>">
                
                <div class="section">
                    <h2 class="section-title">Database Configuration</h2>
                    
                    <div class="form-group">
                        <label for="db_host">Database Host *</label>
                        <input type="text" id="db_host" name="db_host" value="localhost" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="db_name">Database Name *</label>
                        <input type="text" id="db_name" name="db_name" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="db_user">Database Username *</label>
                        <input type="text" id="db_user" name="db_user" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="db_pass">Database Password</label>
                        <input type="password" id="db_pass" name="db_pass">
                    </div>
                </div>
                
                <div class="section">
                    <h2 class="section-title">Admin Account</h2>
                    
                    <div class="form-group">
                        <label for="admin_username">Admin Username *</label>
                        <input type="text" id="admin_username" name="admin_username" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="admin_email">Admin Email *</label>
                        <input type="email" id="admin_email" name="admin_email" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="admin_password">Admin Password *</label>
                        <input type="password" id="admin_password" name="admin_password" required>
                    </div>
                </div>
                
                <div class="section">
                    <h2 class="section-title">SMTP Configuration (Optional)</h2>
                    
                    <div class="form-group">
                        <label for="smtp_host">SMTP Host</label>
                        <input type="text" id="smtp_host" name="smtp_host">
                    </div>
                    
                    <div class="form-group">
                        <label for="smtp_port">SMTP Port</label>
                        <input type="number" id="smtp_port" name="smtp_port" value="587">
                    </div>
                    
                    <div class="form-group">
                        <label for="smtp_user">SMTP Username</label>
                        <input type="text" id="smtp_user" name="smtp_user">
                    </div>
                    
                    <div class="form-group">
                        <label for="smtp_pass">SMTP Password</label>
                        <input type="password" id="smtp_pass" name="smtp_pass">
                    </div>
                    
                    <div class="form-group">
                        <label for="smtp_from">From Email</label>
                        <input type="email" id="smtp_from" name="smtp_from">
                    </div>
                </div>
                
                <div class="form-group" style="text-align: center;">
                    <button type="submit" class="btn">Install Now</button>
                </div>
            </form>
        </div>
    </body>
    </html>
    <?php
}

/**
 * Show installation complete page
 */
function show_installation_complete() {
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Installation Complete - Ton Sui Mining</title>
        <style>
            body { 
                background: #10131a; 
                color: #fff; 
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; 
                margin: 0; 
                padding: 2rem;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
            }
            .container {
                max-width: 600px;
                background: #181c25;
                padding: 3rem;
                border-radius: 0.5rem;
                text-align: center;
                box-shadow: 0 0 20px rgba(0,0,0,0.3);
            }
            h1 {
                color: #48bb78;
                margin-top: 0;
            }
            .success-icon {
                font-size: 4rem;
                color: #48bb78;
                margin-bottom: 1.5rem;
            }
            .btn {
                display: inline-block;
                background: #4299e1;
                color: white;
                padding: 0.75rem 1.5rem;
                border-radius: 0.375rem;
                text-decoration: none;
                font-weight: 600;
                margin-top: 1.5rem;
                transition: background-color 0.2s;
            }
            .btn:hover {
                background: #3182ce;
            }
            .alert {
                background: #2f855a;
                color: #f0fff4;
                padding: 1rem;
                border-radius: 0.375rem;
                margin-bottom: 1.5rem;
                text-align: left;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="success-icon">✓</div>
            <h1>Installation Complete!</h1>
            
            <div class="alert">
                <strong>Important:</strong> For security reasons, please delete the <code>install</code> directory.
            </div>
            
            <p>Your Ton Sui Mining installation is now complete. You can now log in to the admin panel.</p>
            
            <div>
                <a href="/admin" class="btn">Go to Admin Panel</a>
            </div>
        </div>
    </body>
    </html>
    <?php
}

/**
 * Show installation locked page
 */
/**
 * Show an error page with the given message
 */
function show_error_page($errorMessage) {
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Installation Error - Ton Sui Mining</title>
        <style>
            body { 
                background: #10131a; 
                color: #fff; 
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; 
                margin: 0; 
                padding: 2rem;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
            }
            .error-container { 
                background: #181c25; 
                padding: 3rem; 
                border-radius: 1rem; 
                box-shadow: 0 8px 32px rgba(0,0,0,0.1), 0 1.5px 0 rgba(34,34,34,0.3); 
                max-width: 600px; 
                width: 100%; 
                margin: 1rem; 
                text-align: center;
                border-left: 4px solid #e53e3e;
            }
            h1 { 
                color: #e53e3e; 
                font-size: 2.1rem; 
                margin-bottom: 1.2rem; 
                text-align: center; 
                letter-spacing: 0.04em; 
            }
            .error-message {
                background: #2a1d23;
                color: #ff5b6e;
                padding: 1.5rem;
                border-radius: 0.5rem;
                margin: 1.5rem 0;
                text-align: left;
                font-family: monospace;
                white-space: pre-wrap;
                word-break: break-word;
            }
            .btn { 
                display: inline-block; 
                background: #e53e3e; 
                color: white; 
                padding: 0.75rem 1.5rem; 
                border-radius: 0.375rem; 
                text-decoration: none; 
                font-weight: 600; 
                margin-top: 1.5rem; 
                transition: background-color 0.2s; 
            }
            .btn:hover { 
                background: #c53030;
            }
        </style>
    </head>
    <body>
        <div class="error-container">
            <h1>Installation Error</h1>
            <p>An error occurred during installation:</p>
            <div class="error-message"><?php echo htmlspecialchars($errorMessage); ?></div>
            <a href="javascript:history.back()" class="btn">Go Back</a>
        </div>
    </body>
    </html>
    <?php
    exit;
}

function show_installation_locked() {
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Installation Locked - Ton Sui Mining</title>
        <style>
            body { 
                background: #10131a; 
                color: #fff; 
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; 
                margin: 0; 
                padding: 2rem;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
            }
            .container {
                max-width: 600px;
                background: #181c25;
                padding: 3rem;
                border-radius: 0.5rem;
                text-align: center;
                box-shadow: 0 0 20px rgba(0,0,0,0.3);
            }
            h1 {
                color: #e53e3e;
                margin-top: 0;
            }
            .alert {
                background: #742a2a;
                color: #fff5f5;
                padding: 1rem;
                border-radius: 0.375rem;
                margin-bottom: 1.5rem;
                text-align: left;
            }
            .btn {
                display: inline-block;
                background: #e53e3e;
                color: white;
                padding: 0.75rem 1.5rem;
                border-radius: 0.375rem;
                text-decoration: none;
                font-weight: 600;
                margin-top: 1.5rem;
                transition: background-color 0.2s;
            }
            .btn:hover {
                background: #c53030;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Installation Locked</h1>
            
            <div class="alert">
                The Ton Sui Mining platform has already been installed. To prevent unauthorized access, the installer has been locked.
            </div>
            
            <p>If you need to reinstall, please delete the <code>install.lock</code> file from the root directory.</p>
            
            <div>
                <a href="/" class="btn">Go to Homepage</a>
            </div>
        </div>
    </body>
    </html>
    <?php
    exit;
}
