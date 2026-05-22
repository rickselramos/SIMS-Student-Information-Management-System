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
        // Get teachers for this student (based on grade and section)
        $query = "
            SELECT 
                t.id as teacher_id,
                t.full_name as teacher_name,
                t.advisory_grade,
                t.advisory_section,
                t.motto,
                t.contact_number,
                t.email,
                t.subject_specialization,
                t.department
            FROM teachers t
            JOIN students s ON s.grade_level = t.advisory_grade AND s.section = t.advisory_section
            WHERE s.id = ?
            GROUP BY t.id
            ORDER BY t.advisory_grade
        ";
        
        $stmt = $pdo->prepare($query);
        $stmt->execute([$studentId]);
        $teachers = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($teachers);
        
    } catch (PDOException $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit();
}
?>