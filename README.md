# Ton Sui Mining Platform

A comprehensive, AI-powered cryptocurrency investment platform with user management, investment tracking, and admin dashboard.

## 🌟 Features

### User Features
- **Secure Authentication**: User registration, login, and password recovery
- **Investment Plans**: Multiple investment plans with different ROI rates and durations
- **Portfolio Dashboard**: Track investments, earnings, and transaction history
- **Profile Management**: Update personal information and security settings
- **KYC Verification**: Secure identity verification process
- **Withdrawal System**: Request and track withdrawals with transaction hashes
- **Support Tickets**: Create and track support requests

### Admin Features
- **User Management**: View, edit, and manage all users
- **Investment Management**: Monitor and manage all investments
- **Withdrawal Approval**: Review and approve/deny withdrawal requests
- **KYC Verification**: Verify user identities and documents
- **Content Management**: Update website content and investment plans
- **Analytics Dashboard**: View platform statistics and performance metrics
- **Security Logs**: Monitor security events and user activities
- **System Settings**: Configure platform settings and parameters

## 🚀 Technology Stack

### Frontend
- React 18 with Vite
- Tailwind CSS for styling
- React Router for navigation
- Axios for API requests
- React Hook Form for form handling
- React Query for data fetching and caching

### Backend (auth-backend)
- PHP 8.1+
- MySQL 8.0+
- PDO for database access
- JWT for authentication
- PHPMailer for email functionality
- Secure session management

### Security Features
- CSRF protection
- XSS prevention
- SQL injection prevention
- Rate limiting
- Secure password hashing (bcrypt)
- Input validation and sanitization
- Secure file uploads

## 🛠️ Prerequisites

- PHP 8.1 or higher
- MySQL 8.0 or higher
- Node.js 16+ and npm 8+
- Composer (for PHP dependencies)
- Web server (Apache/Nginx) with mod_rewrite enabled
- SSL certificate (highly recommended for production)

## 🚀 Deployment to cPanel

### 1. Upload Files
1. Log in to your cPanel account
2. Navigate to "File Manager"
3. Upload the entire project to your public_html directory (or a subdirectory)

### 2. Set Up Database
1. In cPanel, go to "MySQL Database Wizard"
2. Create a new database and user with all privileges
3. Note down the database name, username, and password

### 3. Configure Environment
1. In the `auth-backend` directory, copy `.env.example` to `.env`
2. Update the following variables in `.env`:
   ```
   DB_HOST=localhost
   DB_NAME=your_database_name
   DB_USER=your_database_user
   DB_PASS=your_database_password
   JWT_SECRET=generate_a_secure_random_string
   SITE_URL=https://yourdomain.com
   MAIL_HOST=your_smtp_host
   MAIL_USER=your_smtp_username
   MAIL_PASS=your_smtp_password
   MAIL_FROM=no-reply@yourdomain.com
   ```

### 4. Install Dependencies
1. In the project root, run:
   ```bash
   npm install
   npm run build
   ```
2. In the `auth-backend` directory, run:
   ```bash
   composer install --no-dev
   ```

### 5. Set Up Database Tables
1. Run database migrations:
   ```bash
   php auth-backend/migrations/run_migrations.php
   ```
2. Create an admin user (replace placeholders with secure values):
   ```sql
   INSERT INTO users (username, name, email, password, is_admin, status, created_at)
   VALUES ('admin', 'Admin User', 'admin@yourdomain.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 'active', NOW());
   
   INSERT INTO admins (user_id, username, email, role, created_at)
   VALUES (1, 'admin', 'admin@yourdomain.com', 'superadmin', NOW());
   ```
   *Note: The password above is 'password' - change it immediately after first login.*

### 6. Configure Web Server
#### For Apache:
1. Create or edit `.htaccess` in the project root:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteCond %{REQUEST_FILENAME} !-l
     RewriteRule . /index.html [L]
   </IfModule>
   ```

#### For Nginx:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 7. Set File Permissions
```bash
chmod -R 755 /path/to/your/site
chmod -R 755 auth-backend/storage
chmod -R 755 auth-backend/logs
```

## 🔒 Security Hardening

1. **File Permissions**:
   - Set proper file permissions (directories: 755, files: 644)
   - Protect sensitive files (e.g., `.env`, `composer.json`)

2. **PHP Configuration**:
   - Disable dangerous PHP functions
   - Set appropriate `upload_max_filesize` and `post_max_size`
   - Enable error logging but hide errors from users

3. **Web Server Security**:
   - Enable HTTPS with HSTS
   - Set security headers (CSP, X-XSS-Protection, etc.)
   - Disable directory listing

## 🔄 Updating the Application

1. Backup your database and files
2. Pull the latest changes from Git
3. Run database migrations if needed:
   ```bash
   php auth-backend/migrations/run_migrations.php
   ```
4. Clear caches if necessary

## 📊 Database Schema

Key tables:
- `users`: User accounts and authentication
- `investments`: User investment records
- `investment_plans`: Available investment plans
- `withdrawals`: Withdrawal requests
- `kyc_verifications`: KYC verification data
- `tickets`: Support tickets
- `security_logs`: Security-related events
- `settings`: System settings

## 📞 Support

For support, please contact your system administrator or open a support ticket through the platform.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ using modern web technologies
- Special thanks to all contributors
