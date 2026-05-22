<?php
require_once '../config/database.php';
$userData = verifyToken();
$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if (isset($_GET['grade']) && isset($_GET['section'])) {
            $stmt = $pdo->prepare("
                SELECT s.*, t.id as teacher_id, t.full_name as teacher_name
                FROM sections s
                LEFT JOIN teachers t ON s.teacher_id = t.id
                WHERE s.grade_level = ? AND s.section_name = ?
            ");
            $stmt->execute([$_GET['grade'], $_GET['section']]);
            echo json_encode($stmt->fetch());
        } else {
            $stmt = $pdo->query("
                SELECT s.*, t.full_name as teacher_name
                FROM sections s
                LEFT JOIN teachers t ON s.teacher_id = t.id
                ORDER BY s.grade_level, s.section_name
            ");
            echo json_encode($stmt->fetchAll());
        }
        break;
        
    default:
        echo json_encode(['error' => 'Method not supported']);
        break;
}
?>