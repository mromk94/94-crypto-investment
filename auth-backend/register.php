<?php
// register.php: Handles user registration for Ton Sui Mining
header('Content-Type: application/json');

require_once 'db.php';

function respond($success, $message) {
    echo json_encode(['success' => $success, 'message' => $message]);
    exit;
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);
$name = trim($data['name'] ?? '');
$username = trim($data['username'] ?? '');
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';
// Support both confirmPassword and confirm_password for backward compatibility
$confirm = $data['confirmPassword'] ?? $data['confirm_password'] ?? '';

// Validation
if (!$name || !$username || !$email || !$password || !$confirm) {
    respond(false, 'All fields are required.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'Invalid email format.');
}
if ($password !== $confirm) {
    respond(false, 'Passwords do not match.');
}
if (strlen($password) < 6) {
    respond(false, 'Password must be at least 6 characters.');
}

// Check for duplicate username/email
$stmt = $pdo->prepare('SELECT id FROM users WHERE username = ? OR email = ?');
$stmt->execute([$username, $email]);
if ($stmt->fetch()) {
    respond(false, 'Username or email already exists.');
}

// Hash password
$hash = password_hash($password, PASSWORD_DEFAULT);

// Insert new user
$stmt = $pdo->prepare('INSERT INTO users (name, username, email, password) VALUES (?, ?, ?, ?)');
if ($stmt->execute([$name, $username, $email, $hash])) {
    respond(true, 'Registration successful. You can now log in.');
} else {
    respond(false, 'Registration failed. Please try again.');
}
