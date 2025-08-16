# 94 Crypto Investment Platform

A complete crypto investment platform with secure authentication, KYC verification, and admin management.

## Features

### Core Features
- **Secure Authentication System**: Complete login/registration flows with session management
- **KYC Verification System**: Dynamic KYC form builder and verification workflows
- **Investment Plans**: Create and manage custom investment plans with ROI settings
- **Wallet Management**: Secure wallet operations with withdrawal PIN protection
- **Transaction System**: Complete deposit and withdrawal management
- **Admin Dashboard**: Comprehensive control panel for platform management

### Enhanced Security
- **Session Management**: Centralized session initialization with secure parameters
- **CSRF Protection**: Cross-site request forgery protection on all endpoints
- **XSS Protection**: Input sanitization and output encoding
- **Secure Cookies**: HTTP-only, SameSite=Strict cookie settings
- **Database Security**: Prepared statements and parameter binding for all queries

### User Features
- **Dashboard Overview**: Real-time balance and investment statistics
- **KYC Submission**: Simple step-by-step KYC submission process
- **Payment Methods**: Multiple payment method management
- **Ticket System**: Support ticket system with admin responses
- **Referral System**: Multi-tier referral program with tracking
- **Investment Portfolio**: Visual breakdown of active investments

### Admin Features
- **User Management**: Complete control over user accounts
- **KYC Management**: Review, approve, reject KYC submissions
- **Investment Control**: Create, modify, and manage investment plans
- **Financial Operations**: Process deposits, withdrawals, and adjustments
- **Analytics Dashboard**: Complete system statistics and insights
- **Admin Logs**: Comprehensive activity logging for security audit

### Technical Improvements
- **Centralized Session Management**: All endpoints use unified session initialization
- **Standardized Config Loading**: Consistent configuration across all components
- **Enhanced Error Handling**: Proper error handling and logging system
- **Optimized Database Connections**: Improved database connection management
- **Clean Production Deployment**: No development artifacts or test scripts

## Installation

1. Upload the package to your web server
2. Navigate to the `/install` directory in your browser
3. Follow the installation wizard to configure database and email settings
4. Once installation is complete, access the admin dashboard using default credentials

## Requirements

- PHP 7.4 or higher
- MySQL 5.7 or higher
- mod_rewrite enabled (for clean URLs)
- OpenSSL PHP extension
- PDO PHP extension
- Mbstring PHP extension
