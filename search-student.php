<?php
require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

try {
    $query = "SELECT s.*, u.email, u.username 
              FROM students s 
              JOIN users u ON s.user_id = u.id 
              WHERE ";
    
    $params = [];
    
    if (!empty($data['lrn'])) {
        $query .= "s.student_id_number = ? OR s.lrn = ?";
        $params = [$data['lrn'], $data['lrn']];
    } elseif (!empty($data['student_id'])) {
        $query .= "s.id = ? OR s.student_id_number = ?";
        $params = [$data['student_id'], $data['student_id']];
    } else {
        echo json_encode(['found' => false, 'error' => 'No search criteria provided']);
        exit();
    }
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $student = $stmt->fetch();
    
    if ($student) {
        echo json_encode([
            'found' => true,
            'student' => [
                'id' => $student['id'],
                'full_name' => $student['full_name'],
                'student_id_number' => $student['student_id_number'],
                'grade_level' => $student['grade_level'],
                'section' => $student['section'],
                'birth_date' => $student['birth_date'],
                'parent_name' => $student['parent_name'],
                'parent_contact' => $student['parent_contact'],
                'address' => $student['address'],
                'status' => $student['status']
            ]
        ]);
    } else {
        echo json_encode(['found' => false]);
    }
} catch (Exception $e) {
    echo json_encode(['found' => false, 'error' => $e->getMessage()]);
}
?>