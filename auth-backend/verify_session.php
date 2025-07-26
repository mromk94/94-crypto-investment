<?php
// verify_session.php: Debug endpoint to check session state
header('Content-Type: application/json');
session_start();

$response = [
    'session_id' => session_id(),
    'session_data' => $_SESSION,
    'is_admin' => isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true,
    'cookie' => $_COOKIE[session_name()] ?? null,
    'headers' => getallheaders()
];

echo json_encode($response, JSON_PRETTY_INT);
