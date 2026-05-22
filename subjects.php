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

if ($method === 'GET') {
    $grade_level = isset($_GET['grade_level']) ? $_GET['grade_level'] : null;
    
    try {
        if ($grade_level) {
            $stmt = $pdo->prepare("SELECT * FROM subjects WHERE grade_level = ? AND is_active = 1 ORDER BY subject_name");
            $stmt->execute([$grade_level]);
        } else {
            $stmt = $pdo->prepare("SELECT * FROM subjects WHERE is_active = 1 ORDER BY grade_level, subject_name");
            $stmt->execute();
        }
        $subjects = $stmt->fetchAll();
        echo json_encode($subjects);
    } catch(PDOException $e) {
        echo json_encode([]);
    }
    exit();
}

echo json_encode([]);
?>