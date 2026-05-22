<?php
header("Access-Control-Allow-Origin: http://localhost:3000"); // Siguraduhing tugma sa port ng React mo (3000 o 3001)
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = 'localhost';
$dbname = 'cabacao_sims';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

try {
    // UNIFIED QUERY: Kinukuha ang totoong kalkulasyon mula sa 'grades' at 'attendance' tables
    $query = "
        SELECT 
            -- Kunin ang pangalan ng guro mula sa grades table bilang batayan
            g.teacher_name,
            
            -- Bilangin kung ilang natatanging estudyante ang may hawak niya
            COUNT(DISTINCT g.student_id) AS total_students,
            
            -- KUNIN ANG TOTOONG AVERAGE GRADE (Gumagamit ng total_grade column mula sa binigay mong code)
            IFNULL(ROUND(AVG(g.total_grade), 2), 0.00) AS average_grade,
            
            -- KUNIN ANG TOTOONG PASSING RATE (% ng mga estudyanteng may grade na 75 pataas)
            IFNULL(ROUND((SUM(CASE WHEN g.total_grade >= 75 THEN 1 ELSE 0 END) / COUNT(g.id)) * 100, 2), 100.00) AS passing_rate,
            
            -- KUNIN ANG TOTOONG ATTENDANCE RATE (Mula sa attendance table base sa section/grade level ng guro)
            (
                SELECT IFNULL(ROUND((SUM(CASE WHEN att.status = 'Present' THEN 1 ELSE 0 END) / COUNT(att.id)) * 100, 2), 0.00)
                FROM attendance att
                WHERE att.student_id IN (SELECT DISTINCT student_id FROM grades WHERE teacher_name = g.teacher_name)
            ) AS attendance_rate
            
        FROM grades g
        GROUP BY g.teacher_name
        ORDER BY g.teacher_name ASC
    ";

    $stmt = $pdo->query($query);
    $teacher_reports = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $teacher_reports
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Query Failed: ' . $e->getMessage()
    ]);
}
?>