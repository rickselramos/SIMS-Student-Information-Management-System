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

if (!$userData) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

switch($method) {
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $pdo->prepare("
            INSERT INTO announcement_comments (announcement_id, user_id, comment) 
            VALUES (?, ?, ?)
        ");
        $stmt->execute([
            $data['announcement_id'], 
            $userData['user_id'], 
            $data['comment']
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Comment added']);
        break;
        
    case 'GET':
        $announcementId = isset($_GET['announcement_id']) ? $_GET['announcement_id'] : null;
        
        if ($announcementId) {
            $stmt = $pdo->prepare("
                SELECT c.*, u.full_name as user_name, u.role as user_role
                FROM announcement_comments c
                JOIN users u ON c.user_id = u.id
                WHERE c.announcement_id = ?
                ORDER BY c.created_at ASC
            ");
            $stmt->execute([$announcementId]);
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        } else {
            echo json_encode([]);
        }
        break;
        
    default:
        echo json_encode(['error' => 'Method not supported']);
        break;
}
?>