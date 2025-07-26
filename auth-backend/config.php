<?php
// Unified config for DB and SMTP
return [
    // Database settings
    'db_host' => 'localhost:3306',
    'db_name' => 'tonsvxcx_ultimate',
    'db_user' => 'tonsvxcx_admin',
    'db_pass' => 'Successtrain2024@@',

    // SMTP settings (editable from admin dashboard)
    'smtp_host' => 'tonsuimining.com',
    'smtp_port' => 465,
    'smtp_user' => 'support@tonsuimining.com',
    'smtp_pass' => 'Successtrain2025@',
    'smtp_secure' => 'ssl', // 'tls' or 'ssl'
    'smtp_from' => 'support@tonsuimining.com',
    'smtp_from_name' => 'Ton Sui Mining',
];
