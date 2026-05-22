<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $teacher_id = isset($_GET['teacher_id']) ? $_GET['teacher_id'] : null;
        
        if ($teacher_id) {
            $query = "SELECT * FROM schedules WHERE teacher_id = :teacher_id ORDER BY grade_level, section, FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'), start_time";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':teacher_id', $teacher_id);
        } else {
            $query = "SELECT * FROM schedules ORDER BY grade_level, section, FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'), start_time";
            $stmt = $db->prepare($query);
        }
        
        $stmt->execute();
        $schedules = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($schedules);
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        
        $query = "INSERT INTO schedules (teacher_id, teacher_name, grade_level, section, subject, day_of_week, start_time, end_time, room) 
                  VALUES (:teacher_id, :teacher_name, :grade_level, :section, :subject, :day_of_week, :start_time, :end_time, :room)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':teacher_id', $data['teacher_id']);
        $stmt->bindParam(':teacher_name', $data['teacher_name']);
        $stmt->bindParam(':grade_level', $data['grade_level']);
        $stmt->bindParam(':section', $data['section']);
        $stmt->bindParam(':subject', $data['subject']);
        $stmt->bindParam(':day_of_week', $data['day_of_week']);
        $stmt->bindParam(':start_time', $data['start_time']);
        $stmt->bindParam(':end_time', $data['end_time']);
        $stmt->bindParam(':room', $data['room']);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Schedule added successfully', 'id' => $db->lastInsertId()]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Failed to add schedule']);
        }
        break;
        
    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        
        $query = "UPDATE schedules SET grade_level = :grade_level, section = :section, subject = :subject, 
                  day_of_week = :day_of_week, start_time = :start_time, end_time = :end_time, room = :room 
                  WHERE id = :id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $data['id']);
        $stmt->bindParam(':grade_level', $data['grade_level']);
        $stmt->bindParam(':section', $data['section']);
        $stmt->bindParam(':subject', $data['subject']);
        $stmt->bindParam(':day_of_week', $data['day_of_week']);
        $stmt->bindParam(':start_time', $data['start_time']);
        $stmt->bindParam(':end_time', $data['end_time']);
        $stmt->bindParam(':room', $data['room']);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Schedule updated successfully']);
        } else {
            echo json_encode(['success' => false, 'error' => 'Failed to update schedule']);
        }
        break;
        
    case 'DELETE':
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        
        if ($id) {
            $query = "DELETE FROM schedules WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id);
            
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Schedule deleted successfully']);
            } else {
                echo json_encode(['success' => false, 'error' => 'Failed to delete schedule']);
            }
        } else {
            echo json_encode(['success' => false, 'error' => 'No ID provided']);
        }
        break;
}
?>