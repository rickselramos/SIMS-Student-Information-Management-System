<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Database connection
$host = 'localhost';
$user = 'root';
$pass = '';
$db = 'cabacao_sims';

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    echo json_encode(['success' => false, 'error' => 'Database connection failed']);
    exit;
}

$date = isset($_GET['date']) ? $_GET['date'] : date('Y-m-d');

// Get all teachers with their students
$sql = "SELECT 
            t.id as teacher_id,
            t.full_name as teacher_name,
            CONCAT('Grade ', t.advisory_grade, ' - ', t.advisory_section) as advisory_class,
            COUNT(DISTINCT s.id) as total_students,
            COUNT(DISTINCT CASE WHEN a.status = 'Present' THEN s.id END) as present_count,
            COUNT(DISTINCT CASE WHEN a.status = 'Absent' THEN s.id END) as absent_count,
            COUNT(DISTINCT CASE WHEN a.status = 'Late' THEN s.id END) as late_count,
            ROUND((COUNT(DISTINCT CASE WHEN a.status = 'Present' THEN s.id END) / NULLIF(COUNT(DISTINCT s.id), 0)) * 100, 1) as attendance_rate
        FROM teachers t
        LEFT JOIN students s ON s.assigned_teacher_id = t.id
        LEFT JOIN attendance a ON a.student_id = s.id AND a.attendance_date = '$date'
        WHERE t.contract_status = 'Active'
        GROUP BY t.id";

$result = $conn->query($sql);
$teachers = array();

while ($row = $result->fetch_assoc()) {
    // Get students for each teacher
    $students_sql = "SELECT s.id, s.full_name as student_name, s.section, a.status, a.remarks 
                     FROM students s
                     LEFT JOIN attendance a ON a.student_id = s.id AND a.attendance_date = '$date'
                     WHERE s.assigned_teacher_id = " . $row['teacher_id'] . "
                     ORDER BY s.full_name";
    $students_result = $conn->query($students_sql);
    $students = array();
    
    while ($student = $students_result->fetch_assoc()) {
        $students[] = $student;
    }
    
    $row['students'] = $students;
    $teachers[] = $row;
}

// Get statistics
$stats_sql = "SELECT 
                (SELECT COUNT(*) FROM teachers WHERE contract_status = 'Active') as total_teachers,
                (SELECT COUNT(*) FROM students WHERE enrollment_status = 'Enrolled') as total_students,
                (SELECT COUNT(*) FROM attendance WHERE attendance_date = '$date') as total_attendance_records,
                (SELECT COUNT(*) FROM students WHERE assigned_teacher_id IS NOT NULL) as students_with_teacher";
$stats_result = $conn->query($stats_sql);
$statistics = $stats_result->fetch_assoc();

echo json_encode(array(
    'success' => true,
    'date' => $date,
    'statistics' => $statistics,
    'teachers' => $teachers
));

$conn->close();
?>