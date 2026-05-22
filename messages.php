<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';
require_once '../config/jwt.php';

// Get user data from token
$userData = verifyToken();

if (!$userData) {
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

// GET messages
if ($method === 'GET') {
    try {
        $stmt = $pdo->prepare("
            SELECT 
                m.*,
                u.full_name as sender_name,
                u.role as sender_role
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.receiver_id = :receiver_id 
            ORDER BY m.created_at DESC
        ");
        $stmt->execute([':receiver_id' => $userData['user_id']]);
        $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($messages);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit();
}

// POST send message
if ($method === 'POST') {
    // Get raw input
    $rawInput = file_get_contents('php://input');
    error_log("Raw input: " . $rawInput); // Debug log
    
    $data = json_decode($rawInput, true);
    
    if (!$data) {
        echo json_encode(['success' => false, 'error' => 'Invalid JSON data']);
        exit();
    }
    
    // Validate required fields
    if (!isset($data['receiver_id']) || empty($data['receiver_id'])) {
        echo json_encode(['success' => false, 'error' => 'Missing receiver_id']);
        exit();
    }
    
    if (!isset($data['subject']) || empty(trim($data['subject']))) {
        echo json_encode(['success' => false, 'error' => 'Missing subject']);
        exit();
    }
    
    if (!isset($data['message']) || empty(trim($data['message']))) {
        echo json_encode(['success' => false, 'error' => 'Missing message']);
        exit();
    }
    
    try {
        $receiver_role = isset($data['receiver_role']) ? $data['receiver_role'] : 'student';
        
        // Verify receiver exists
        $checkStmt = $pdo->prepare("SELECT id FROM users WHERE id = ?");
        $checkStmt->execute([$data['receiver_id']]);
        if (!$checkStmt->fetch()) {
            echo json_encode(['success' => false, 'error' => 'Receiver not found']);
            exit();
        }
        
        $stmt = $pdo->prepare("
            INSERT INTO messages (sender_id, sender_role, receiver_id, receiver_role, subject, message, created_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        ");
        
        $result = $stmt->execute([
            $userData['user_id'],
            $userData['role'],
            $data['receiver_id'],
            $receiver_role,
            trim($data['subject']),
            trim($data['message'])
        ]);
        
        if ($result) {
            echo json_encode(['success' => true, 'message' => 'Message sent successfully']);
        } else {
            echo json_encode(['success' => false, 'error' => 'Failed to insert message']);
        }
    } catch (PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }
    exit();
}

echo json_encode(['success' => false, 'error' => 'Invalid request method']);
?>