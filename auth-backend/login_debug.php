<?php
// login_debug.php: Debug version of login endpoint
header('Content-Type: application/plain');
require_once 'db.php';

// Log the raw POST data
echo "=== RAW POST DATA ===\n";
$rawPostData = file_get_contents('php://input');
echo $rawPostData . "\n\n";

// Decode the JSON data
$data = json_decode($rawPostData, true);

// Log the decoded data
echo "=== DECODED DATA ===\n\n";
echo "Identity: " . (isset($data['identity']) ? $data['identity'] : 'NOT SET') . "\n";
echo "Password: " . (isset($data['password']) ? '***MASKED***' : 'NOT SET') . "\n\n";

// Get credentials
$identity = trim($data['identity'] ?? '');
$password = $data['password'] ?? '';

if (!$identity || !$password) {
    die("ERROR: Username/email and password are required.\n");
}

// Find user by username or email
echo "=== DATABASE QUERY ===\n";
$stmt = $pdo->prepare('SELECT * FROM users WHERE username = ? OR email = ?');
$stmt->execute([$identity, $identity]);
$user = $stmt->fetch();

if (!$user) {
    die("ERROR: No user found with username/email: " . htmlspecialchars($identity) . "\n");
}

echo "FOUND USER: " . print_r($user, true) . "\n\n";

echo "=== PASSWORD VERIFICATION ===\n";
$passwordHash = $user['password'];
$passwordMatch = password_verify($password, $passwordHash);

echo "Stored hash: " . $passwordHash . "\n";
echo "Password matches: " . ($passwordMatch ? 'YES' : 'NO') . "\n";

if (!$passwordMatch) {
    die("ERROR: Invalid password for user: " . htmlspecialchars($identity) . "\n");
}

echo "\n=== LOGIN SUCCESSFUL ===\n";
echo "User ID: " . $user['id'] . "\n";
echo "Username: " . $user['username'] . "\n";
echo "Email: " . $user['email'] . "\n";
echo "Is Admin: " . ($user['is_admin'] ? 'YES' : 'NO') . "\n";

// Return success response
echo "\n=== RESPONSE ===\n";
$response = [
    'success' => true,
    'message' => 'Login successful.',
    'user' => [
        'id' => $user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'is_admin' => (bool)$user['is_admin']
    ]
];

echo json_encode($response, JSON_PRETTY_PRINT) . "\n";
