# Ton Sui Mining - Installation Guide

This document provides comprehensive instructions for installing the Ton Sui Mining platform using the web installer.

## System Requirements

- PHP 7.4 or higher (8.1+ recommended)
- MySQL 5.7+ or MariaDB 10.3+
- Web server (Apache/Nginx) with mod_rewrite enabled
- SSL Certificate (HTTPS) required for production use
- Minimum 512MB PHP memory limit
- Required PHP extensions: PDO, OpenSSL, JSON, Mbstring, Tokenizer, XML, CURL

## Installation Steps

### 1. Upload Files

1. Download the latest release of Ton Sui Mining
2. Upload all files to your web server's public directory (e.g., `public_html`)
3. Ensure the following directories are writable:
   - `/auth-backend`
   - `/install`
   - `/storage` (if exists)
   - `/bootstrap/cache` (if exists)

### 2. Run the Web Installer

1. Open your web browser and navigate to: `https://yourdomain.com/install/`
2. The installer will check system requirements
3. Fill in the required information:
   - **Database Configuration**
     - Host (usually `localhost`)
     - Database Name (create this in your hosting control panel first)
     - Database Username
     - Database Password
   - **Admin Account**
     - Admin Username
     - Admin Email
     - Admin Password
   - **SMTP Configuration** (optional but recommended)
     - SMTP Host
     - SMTP Port (usually 587 for TLS)
     - SMTP Username
     - SMTP Password
     - From Email

### 3. Complete Installation

1. Click "Install Now" to begin the installation
2. The installer will:
   - Test database connection
   - Create all necessary database tables
   - Create admin user account
   - Save configuration files
   - Create installation lock file

3. After successful installation:
   - The installer will automatically lock itself
   - You'll be redirected to the login page
   - **Important**: Delete the `/install` directory for security

## Post-Installation

### Accessing the Admin Panel
- URL: `https://yourdomain.com/admin`
- Use the admin credentials you created during installation

### Security Recommendations
1. Set proper file permissions:
   ```
   chmod 750 /path/to/your/application
   chmod 640 /path/to/your/application/auth-backend/config.php
   chmod 640 /path/to/your/application/install.lock
   ```
2. Set up a cron job for scheduled tasks (if applicable)
3. Configure daily database backups
4. Enable web application firewall (WAF)

## Troubleshooting

### Common Issues

1. **500 Internal Server Error**
   - Check PHP error logs in your hosting control panel
   - Ensure all file permissions are set correctly
   - Verify database credentials in `/auth-backend/config.php`

2. **Database Connection Failed**
   - Verify database credentials
   - Check if MySQL server is running
   - Ensure database user has proper permissions

3. **SMTP Not Working**
   - Verify SMTP credentials and port
   - Check if your hosting allows outbound SMTP connections
   - Try using a different SMTP provider

### Getting Help

If you encounter any issues during installation:
1. Check the error logs in your hosting control panel
2. Verify all system requirements are met
3. Contact your hosting provider for server-related issues
4. For application support, visit [Ton Sui Mining Support](https://support.tonsuimining.com)

## Upgrading

To upgrade to a new version:
1. Backup your database and files
2. Upload the new files (except `/auth-backend/config.php` and `/install.lock`)
3. Run any database migrations if required
4. Clear your application cache

## Security

- Keep your installation up to date with the latest security patches
- Use strong, unique passwords for all accounts
- Regularly backup your database and files
- Monitor your server logs for suspicious activity

---

*Ton Sui Mining v1.0.0 | [Documentation](https://docs.tonsuimining.com) | [Support](https://support.tonsuimining.com)*
