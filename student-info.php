<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

$student_id = isset($_GET['student_id']) ? intval($_GET['student_id']) : 0;

if ($student_id == 0) {
    echo json_encode(['error' => 'Student ID required']);
    exit();
}

try {
    $query = "
        SELECT 
            u.id,
            u.username,
            u.email,
            u.full_name,
            u.contact_number,
            u.address,
            s.student_id_number,
            s.lrn,
            s.grade_level,
            s.section,
            s.status as enrollment_status,
            s.guardian_name,
            s.parent_name
        FROM users u
        LEFT JOIN students s ON u.id = s.user_id
        WHERE u.id = ? AND u.role = 'student'
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute([$student_id]);
    $student = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($student) {
        // Format name for display
        $nameParts = explode(' ', $student['full_name']);
        if (count($nameParts) >= 2) {
            $student['formatted_name'] = strtoupper($nameParts[count($nameParts)-1] . ', ' . $nameParts[0]);
        } else {
            $student['formatted_name'] = strtoupper($student['full_name']);
        }
        
        // Set defaults for null values
        if (empty($student['student_id_number'])) {
            $student['student_id_number'] = 'STU' . str_pad($student['id'], 4, '0', STR_PAD_LEFT);
        }
        if (empty($student['grade_level'])) {
            $student['grade_level'] = '7';
        }
        if (empty($student['section'])) {
            $student['section'] = 'Sampaguita';
        }
        if (empty($student['enrollment_status'])) {
            $student['enrollment_status'] = 'Enrolled';
        }
        if (empty($student['contact_number'])) {
            $student['contact_number'] = 'N/A';
        }
        if (empty($student['email'])) {
            $student['email'] = 'N/A';
        }
        if (empty($student['address'])) {
            $student['address'] = 'N/A';
        }
        
        echo json_encode($student);
    } else {
        echo json_encode(['error' => 'Student not found']);
    }
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>