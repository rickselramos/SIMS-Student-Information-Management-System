<?php
header('Content-Type: application/json');
include 'db_connect.php';

$query = "SELECT g.*, s.full_name, s.grade_level, s.section 
          FROM grades g 
          JOIN students s ON g.student_id = s.id";
$result = $conn->query($query);
$grades = [];
while ($row = $result->fetch_assoc()) {
    $grades[] = $row;
}
echo json_encode($grades);
$conn->close();
?>