<?php
/**
 * Configuration File
 *
 * Contains database, SMTP, and other configuration settings
 */

return [
    // Database Configuration
    'db_host' => 'localhost',
    'db_name' => 'tonsui',
    'db_user' => 'root',
    'db_pass' => '',
    'db_port' => '3306',

    // SMTP Configuration
    'smtp_host' => 'smtp.example.com',
    'smtp_port' => 587,
    'smtp_user' => 'noreply@example.com',
    'smtp_pass' => '',
    'smtp_from' => 'noreply@example.com',
    'smtp_from_name' => 'TonSuiMining',
    'smtp_secure' => 'tls'
];
