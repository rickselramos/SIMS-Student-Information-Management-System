<?php
header("Access-Control-Allow-Origin: http://localhost:3001");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$studentId = isset($_GET['student_id']) ? intval($_GET['student_id']) : 0;

if ($method === 'GET') {
    try {
        $query = "
            SELECT 
                g.id,
                g.subject_name,
                g.teacher_name,
                g.assignment,
                g.project,
                g.exam,
                g.total_grade,
                g.remarks,
                g.grading_period
            FROM grades g
            WHERE g.student_id = ?
            ORDER BY g.grading_period, g.subject_name
        ";
        
        $stmt = $pdo->prepare($query);
        $stmt->execute([$studentId]);
        $grades = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($grades);
        
    } catch (PDOException $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit();
}
?>