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

if ($userData['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

// Get teacher's ID and advisory info
$stmt = $pdo->prepare("SELECT id, advisory_grade, advisory_section FROM teachers WHERE user_id = ?");
$stmt->execute([$userData['user_id']]);
$teacher = $stmt->fetch();

if (!$teacher) {
    echo json_encode([]);
    exit();
}

// Get teacher's schedule for their advisory class and subjects they teach
$stmt = $pdo->prepare("
    SELECT 
        cs.*,
        s.subject_name,
        s.subject_code
    FROM class_schedules cs
    JOIN subjects s ON cs.subject_id = s.id
    WHERE cs.teacher_id = ? AND cs.grade_level = ? AND cs.section = ?
    ORDER BY FIELD(cs.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'), cs.start_time
");
$stmt->execute([$teacher['id'], $teacher['advisory_grade'], $teacher['advisory_section']]);
$schedules = $stmt->fetchAll();

echo json_encode($schedules);
?>