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

$userData = verifyToken();
$method = $_SERVER['REQUEST_METHOD'];

// For development - return sample attendance if no data
if ($method === 'GET') {
    try {
        // Get teacher's advisory info
        $stmt = $pdo->prepare("SELECT id, advisory_grade, advisory_section FROM teachers WHERE user_id = ?");
        $stmt->execute([$userData['user_id']]);
        $teacher = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($teacher && $teacher['advisory_grade'] && $teacher['advisory_section']) {
            $stmt = $pdo->prepare("
                SELECT 
                    a.*,
                    s.full_name as student_name,
                    s.student_id_number
                FROM student_attendance a
                JOIN students s ON a.student_id = s.id
                WHERE s.grade_level = ? AND s.section = ?
                ORDER BY a.attendance_date DESC, s.full_name
                LIMIT 50
            ");
            $stmt->execute([$teacher['advisory_grade'], $teacher['advisory_section']]);
            $attendance = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($attendance);
        } else {
            // Return empty array if no advisory class
            echo json_encode([]);
        }
    } catch (PDOException $e) {
        echo json_encode([]);
    }
    exit();
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    try {
        $stmt = $pdo->prepare("SELECT id FROM teachers WHERE user_id = ?");
        $stmt->execute([$userData['user_id']]);
        $teacher = $stmt->fetch(PDO::FETCH_ASSOC);
        $teacherId = $teacher ? $teacher['id'] : 1;
        
        // Check if attendance exists
        $checkStmt = $pdo->prepare("
            SELECT id FROM student_attendance 
            WHERE student_id = ? AND attendance_date = ?
        ");
        $checkStmt->execute([$data['student_id'], $data['attendance_date']]);
        
        if ($checkStmt->fetch()) {
            $stmt = $pdo->prepare("
                UPDATE student_attendance 
                SET status = ?, remarks = ?
                WHERE student_id = ? AND attendance_date = ?
            ");
            $stmt->execute([
                $data['status'], $data['remarks'] ?? null,
                $data['student_id'], $data['attendance_date']
            ]);
        } else {
            $stmt = $pdo->prepare("
                INSERT INTO student_attendance (student_id, teacher_id, attendance_date, status, remarks)
                VALUES (?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $data['student_id'], $teacherId, $data['attendance_date'], 
                $data['status'], $data['remarks'] ?? null
            ]);
        }
        
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit();
}

echo json_encode(['error' => 'Method not supported']);
?>