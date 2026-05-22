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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$uploadDir = '../uploads/profiles/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

if (isset($_FILES['profile_picture']) && $_FILES['profile_picture']['error'] === UPLOAD_ERR_OK) {
    $fileTmpPath = $_FILES['profile_picture']['tmp_name'];
    $fileName = $_FILES['profile_picture']['name'];
    $fileExtension = pathinfo($fileName, PATHINFO_EXTENSION);
    $newFileName = 'profile_' . $userData['user_id'] . '_' . time() . '.' . $fileExtension;
    $destPath = $uploadDir . $newFileName;
    
    if (move_uploaded_file($fileTmpPath, $destPath)) {
        $filePath = 'uploads/profiles/' . $newFileName;
        
        $stmt = $pdo->prepare("UPDATE users SET profile_picture = ? WHERE id = ?");
        $stmt->execute([$filePath, $userData['user_id']]);
        
        echo json_encode(['success' => true, 'file_path' => $filePath]);
    } else {
        echo json_encode(['error' => 'Failed to move uploaded file']);
    }
} else {
    echo json_encode(['error' => 'No file uploaded']);
}
?>