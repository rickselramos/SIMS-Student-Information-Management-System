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
$teacherId = isset($_GET['teacher_id']) ? intval($_GET['teacher_id']) : 0;

if ($method === 'GET') {
    try {
        // Get students assigned to this teacher
        $query = "
            SELECT 
                s.id,
                s.user_id,
                s.student_id_number,
                s.lrn,
                s.full_name,
                s.grade_level,
                s.section,
                s.gender,
                s.contact_number,
                s.email,
                s.enrollment_status,
                s.guardian_name,
                s.guardian_contact,
                s.address,
                s.barangay,
                s.municipality,
                s.province,
                s.birth_date,
                s.birth_place,
                s.religion,
                s.citizenship,
                s.school_year,
                s.status,
                s.assigned_teacher_id
            FROM students s
            WHERE s.assigned_teacher_id = ?
            AND s.enrollment_status = 'Enrolled'
            ORDER BY s.full_name
        ";
        
        $stmt = $pdo->prepare($query);
        $stmt->execute([$teacherId]);
        $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($students);
        
    } catch (PDOException $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit();
}
?>