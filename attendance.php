<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Direct database connection
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

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $date = isset($_GET['date']) ? $_GET['date'] : date('Y-m-d');
        
        $sql = "SELECT 
                    a.id,
                    a.student_id,
                    a.student_name,
                    a.grade_level,
                    a.section,
                    a.attendance_date,
                    a.status,
                    a.remarks
                FROM attendance a
                WHERE a.attendance_date = ?
                ORDER BY a.grade_level, a.section, a.student_name";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$date]);
        $attendance = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($attendance);
    } catch(PDOException $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit();
}

echo json_encode(['error' => 'Method not allowed']);
?>