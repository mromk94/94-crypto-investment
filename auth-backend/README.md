# Ton Sui Mining Auth Backend (PHP + MySQL)

This backend provides authentication endpoints for registration, login, and password reset, designed for local testing and easy deployment to shared hosting (e.g., Namecheap cPanel).

## Endpoints
- `register.php`: User registration
- `login.php`: User login (username/email + password)
- `forgot_password.php`: Password reset (simulated for local/dev)

## Setup
1. **Create the MySQL Database & Table:**
   - Import `users.sql` into your MySQL database.
2. **Configure Database Connection:**
   - Edit `db.php` with your local or hosting MySQL credentials.
3. **Run Locally:**
   - Place these files in a PHP-enabled web server directory (e.g., XAMPP `htdocs`, MAMP, or cPanel `public_html`).
   - Access endpoints via `http://localhost/auth-backend/register.php`, etc.
   - Use tools like Postman or connect via your React frontend for testing.

## Example Request (Registration)
```
POST /auth-backend/register.php
Content-Type: application/json

{
  "name": "Alice",
  "username": "alice01",
  "email": "alice@example.com",
  "password": "secret123",
  "confirmPassword": "secret123"
}
```

## Notes
- Passwords are hashed using PHP's `password_hash()`.
- No email is actually sent in `forgot_password.php` (for local/dev only).
- All endpoints return JSON.
- Ready for upload to cPanel or further extension (e.g., real email sending, JWT, etc.).
