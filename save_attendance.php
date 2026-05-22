<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$host = 'localhost';
$user = 'root';
$pass = '';
$db = 'cabacao_sims';

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    echo json_encode(['success' => false, 'error' => 'Database connection failed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$student_id = $input['student_id'];
$attendance_date = $input['attendance_date'];
$status = $input['status'];
$remarks = $input['remarks'] ?? '';

// Get student info
$student_sql = "SELECT s.full_name as student_name, s.grade_level, s.section, t.full_name as teacher_name 
                FROM students s
                LEFT JOIN teachers t ON s.assigned_teacher_id = t.id
                WHERE s.id = $student_id";
$student_result = $conn->query($student_sql);
$student = $student_result->fetch_assoc();

// Check if attendance already exists
$check_sql = "SELECT id FROM attendance WHERE student_id = $student_id AND attendance_date = '$attendance_date'";
$check_result = $conn->query($check_sql);

if ($check_result->num_rows > 0) {
    // Update existing
    $sql = "UPDATE attendance 
            SET status = '$status', remarks = '$remarks'
            WHERE student_id = $student_id AND attendance_date = '$attendance_date'";
} else {
    // Insert new
    $sql = "INSERT INTO attendance (student_id, student_name, grade_level, section, teacher_name, attendance_date, status, remarks) 
            VALUES ($student_id, '{$student['student_name']}', '{$student['grade_level']}', '{$student['section']}', '{$student['teacher_name']}', '$attendance_date', '$status', '$remarks')";
}

if ($conn->query($sql)) {
    echo json_encode(['success' => true, 'message' => 'Attendance saved']);
} else {
    echo json_encode(['success' => false, 'error' => $conn->error]);
}

$conn->close();
?>