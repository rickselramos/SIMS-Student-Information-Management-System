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

// FOR TESTING - Use hardcoded values first
$gradeLevel = '7';
$section = 'Sampaguita';

// Get schedule for student's grade and section
$stmt = $pdo->prepare("
    SELECT 
        s.id,
        s.subject,
        s.grade_level,
        s.section,
        s.day_of_week,
        s.start_time,
        s.end_time,
        s.room_name,
        t.full_name as teacher_name
    FROM schedules s
    LEFT JOIN teachers t ON s.teacher_id = t.id
    WHERE s.grade_level = ? AND s.section = ? AND s.is_active = 1
    ORDER BY FIELD(s.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'), s.start_time
");
$stmt->execute([$gradeLevel, $section]);
$schedules = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($schedules);
?>