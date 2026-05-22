<?php
$host = 'localhost';
$dbname = 'cabacao_sims';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    die(json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]));
}

function verifyToken() {
    session_start();
    if (isset($_SESSION['user_id'])) {
        return [
            'user_id' => $_SESSION['user_id'],
            'role' => $_SESSION['role'],
            'full_name' => $_SESSION['full_name']
        ];
    }
    return null;
}

function requireRole($allowedRoles) {
    $user = verifyToken();
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit();
    }
    if (!in_array($user['role'], (array)$allowedRoles)) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden']);
        exit();
    }
    return $user;
}
?>