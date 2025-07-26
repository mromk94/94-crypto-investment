<?php
require_once 'config.php';
require_once 'auth.php';

header('Content-Type: application/json');

// Check if user is admin
if (!isset($_SESSION['user_id']) || !isAdmin($_SESSION['user_id'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

// Start impersonation
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (empty($data['username'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Username is required']);
        exit;
    }

    try {
        $stmt = $pdo->prepare('SELECT id, username, email, role FROM users WHERE username = ?');
        $stmt->execute([$data['username']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'User not found']);
            exit;
        }

        // Store original admin session
        if (!isset($_SESSION['original_admin_id'])) {
            $_SESSION['original_admin_id'] = $_SESSION['user_id'];
            $_SESSION['original_admin_username'] = $_SESSION['username'];
            $_SESSION['original_admin_role'] = $_SESSION['role'];
        }

        // Set user session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['is_impersonating'] = true;

        echo json_encode(['success' => true, 'message' => 'Impersonation started']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database error']);
    }
    
    exit;
}

// Stop impersonation
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (!isset($_SESSION['original_admin_id'])) {
        echo json_encode(['success' => true, 'message' => 'Not impersonating']);
        exit;
    }

    // Restore admin session
    $_SESSION['user_id'] = $_SESSION['original_admin_id'];
    $_SESSION['username'] = $_SESSION['original_admin_username'];
    $_SESSION['role'] = $_SESSION['original_admin_role'];
    
    // Clear impersonation data
    unset(
        $_SESSION['original_admin_id'],
        $_SESSION['original_admin_username'],
        $_SESSION['original_admin_role'],
        $_SESSION['is_impersonating']
    );

    echo json_encode(['success' => true, 'message' => 'Impersonation ended']);
    exit;
}

// Get current impersonation status
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $response = [
        'is_impersonating' => !empty($_SESSION['is_impersonating']),
        'original_admin' => [
            'id' => $_SESSION['original_admin_id'] ?? null,
            'username' => $_SESSION['original_admin_username'] ?? null
        ],
        'current_user' => [
            'id' => $_SESSION['user_id'] ?? null,
            'username' => $_SESSION['username'] ?? null,
            'role' => $_SESSION['role'] ?? null
        ]
    ];
    
    echo json_encode(['success' => true, 'data' => $response]);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);
