<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

include 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $grade_level = isset($_GET['grade_level']) ? $_GET['grade_level'] : '';
    $section = isset($_GET['section']) ? $_GET['section'] : '';
    
    $query = "SELECT g.*, s.full_name, s.student_id_number 
              FROM grades g 
              JOIN students s ON g.student_id = s.id 
              WHERE s.grade_level = '$grade_level' AND s.section = '$section'";
    
    $result = $conn->query($query);
    $grades = [];
    
    while ($row = $result->fetch_assoc()) {
        $grades[] = $row;
    }
    
    echo json_encode($grades);
} 
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $student_id = $data['student_id'];
    $quiz1 = $data['quiz_1'] ?? 0;
    $quiz2 = $data['quiz_2'] ?? 0;
    $quiz3 = $data['quiz_3'] ?? 0;
    $assignment = $data['assignment'] ?? 0;
    $project = $data['project'] ?? 0;
    $exam = $data['exam'] ?? 0;
    
    $quizAvg = ($quiz1 + $quiz2 + $quiz3) / 3;
    $totalGrade = ($quizAvg * 0.3) + ($assignment * 0.2) + ($project * 0.2) + ($exam * 0.3);
    $remarks = $totalGrade >= 75 ? 'Passed' : ($totalGrade > 0 ? 'Failed' : 'Pending');
    
    $checkQuery = "SELECT id FROM grades WHERE student_id = $student_id";
    $checkResult = $conn->query($checkQuery);
    
    if ($checkResult->num_rows > 0) {
        $query = "UPDATE grades SET 
                  quiz_1 = $quiz1, quiz_2 = $quiz2, quiz_3 = $quiz3,
                  assignment = $assignment, project = $project, exam = $exam,
                  total_grade = $totalGrade, remarks = '$remarks'
                  WHERE student_id = $student_id";
    } else {
        $query = "INSERT INTO grades (student_id, quiz_1, quiz_2, quiz_3, assignment, project, exam, total_grade, remarks) 
                  VALUES ($student_id, $quiz1, $quiz2, $quiz3, $assignment, $project, $exam, $totalGrade, '$remarks')";
    }
    
    if ($conn->query($query)) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}

$conn->close();
?>