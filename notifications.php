<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

$userData = verifyToken();
$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $stmt = $pdo->prepare("
            SELECT * FROM notifications 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT 20
        ");
        $stmt->execute([$userData['user_id']]);
        echo json_encode($stmt->fetchAll());
        break;
        
    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("
            UPDATE notifications SET is_read = 1, read_at = NOW()
            WHERE id = ? AND user_id = ?
        ");
        $stmt->execute([$data['id'], $userData['user_id']]);
        echo json_encode(['success' => true]);
        break;
        
    default:
        echo json_encode(['error' => 'Method not supported']);
        break;
}
?>