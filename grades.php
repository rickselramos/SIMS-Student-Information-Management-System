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
        $sql = "SELECT 
                    g.id,
                    g.student_id,
                    g.student_name,
                    g.subject_name,
                    g.grade_level,
                    g.section,
                    g.quiz_1,
                    g.quiz_2,
                    g.quiz_3,
                    g.assignment,
                    g.project,
                    g.exam,
                    g.total_grade,
                    g.remarks
                FROM grades g
                ORDER BY g.grade_level, g.section, g.student_name, g.subject_name";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        $grades = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Convert numeric fields to numbers
        foreach ($grades as &$grade) {
            $grade['quiz_1'] = floatval($grade['quiz_1'] ?? 0);
            $grade['quiz_2'] = floatval($grade['quiz_2'] ?? 0);
            $grade['quiz_3'] = floatval($grade['quiz_3'] ?? 0);
            $grade['assignment'] = floatval($grade['assignment'] ?? 0);
            $grade['project'] = floatval($grade['project'] ?? 0);
            $grade['exam'] = floatval($grade['exam'] ?? 0);
            $grade['total_grade'] = floatval($grade['total_grade'] ?? 0);
        }
        
        echo json_encode($grades);
    } catch(PDOException $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit();
}

echo json_encode(['error' => 'Method not allowed']);
?>