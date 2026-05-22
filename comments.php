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

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $announcement_id = isset($_GET['announcement_id']) ? $_GET['announcement_id'] : null;
        if ($announcement_id) {
            $stmt = $pdo->prepare("
                SELECT c.*, u.full_name as user_name 
                FROM comments c
                JOIN users u ON c.user_id = u.id
                WHERE c.announcement_id = ?
                ORDER BY c.created_at ASC
            ");
            $stmt->execute([$announcement_id]);
        } else {
            $stmt = $pdo->query("SELECT * FROM comments ORDER BY created_at DESC");
        }
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $pdo->prepare("
            INSERT INTO comments (announcement_id, user_id, user_name, comment) 
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['announcement_id'],
            $data['user_id'],
            $data['user_name'],
            $data['comment']
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Comment added']);
        break;
        
    default:
        echo json_encode(['error' => 'Method not supported']);
        break;
}
?>