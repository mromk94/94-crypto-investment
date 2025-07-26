<?php
// forgot_password.php: Handles password reset request for Ton Sui Mining
header('Content-Type: application/json');
require_once 'db.php';

function respond($success, $message) {
    echo json_encode(['success' => $success, 'message' => $message]);
    exit;
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);
$email = trim($data['email'] ?? '');

if (!$email) {
    respond(false, 'Email is required.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'Invalid email format.');
}

// Check if user exists
$stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();
if (!$user) {
    respond(false, 'No user found with that email.');
}

// Generate a simple reset code (for demo)
$reset_code = bin2hex(random_bytes(8));
$reset_link = 'https://' . $_SERVER['HTTP_HOST'] . '/reset-password.php?code=' . $reset_code . '&email=' . urlencode($email);

// Send reset email
require_once 'send_mail.php';
$mail_result = send_mail($email, 'Password Reset Request', "Hello,\n\nTo reset your password, click the link below:\n$reset_link\n\nIf you did not request this, ignore this email.\n\nTon Sui Mining Team");

if ($mail_result === true) {
    respond(true, 'If your email exists, you will receive a password reset link.');
} else {
    respond(false, 'Failed to send reset email: ' . $mail_result);
}
