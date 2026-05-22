<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config/database.php';

$student_id = isset($_GET['student_id']) ? intval($_GET['student_id']) : 0;
if (!$student_id) {
    echo json_encode(['error' => 'Student ID required']);
    exit();
}

try {
    $stmt = $pdo->prepare("SELECT * FROM attendance WHERE student_id = ? ORDER BY attendance_date DESC LIMIT 30");
    $stmt->execute([$student_id]);
    echo json_encode($stmt->fetchAll());
} catch(PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>