<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection
$host = 'localhost';
$dbname = 'cabacao_sims';
$username = 'root';
$password = '';

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8",
        $username,
        $password
    );

    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

} catch(PDOException $e) {

    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {

    try {

      $query = "
SELECT 
    g.teacher_name,

    COUNT(DISTINCT g.student_id) AS total_students,

    IFNULL(
        ROUND(AVG(g.total_grade), 2),
        0
    ) AS average_grade,

    IFNULL(
        ROUND(
            (
                SUM(
                    CASE
                        WHEN g.total_grade >= 75
                        THEN 1
                        ELSE 0
                    END
                ) * 100.0
            ) / NULLIF(COUNT(g.id),0),
        2),
    0) AS passing_rate,

    (
        SELECT IFNULL(
            ROUND(
                (
                    COUNT(
                        CASE
                            WHEN att.status = 'Present'
                            THEN 1
                        END
                    ) * 100.0
                ) / NULLIF(COUNT(*),0),
            2),
        0)
        FROM attendance att
        WHERE att.student_id IN (
            SELECT DISTINCT student_id
            FROM grades
            WHERE teacher_name = g.teacher_name
        )
    ) AS attendance_rate,

    SUM(
        CASE
            WHEN g.total_grade BETWEEN 90 AND 100
            THEN 1
            ELSE 0
        END
    ) AS excellent_count,

    SUM(
        CASE
            WHEN g.total_grade BETWEEN 80 AND 89
            THEN 1
            ELSE 0
        END
    ) AS good_count,

    SUM(
        CASE
            WHEN g.total_grade BETWEEN 75 AND 79
            THEN 1
            ELSE 0
        END
    ) AS satisfactory_count,

    SUM(
        CASE
            WHEN g.total_grade < 75
            THEN 1
            ELSE 0
        END
    ) AS failed_count

FROM grades g
GROUP BY g.teacher_name
ORDER BY g.teacher_name ASC
";

        $stmt = $pdo->query($query);

        $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'data' => $reports
        ]);

    } catch(PDOException $e) {

        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }

    exit();
}

echo json_encode([
    'success' => false,
    'error' => 'Method not allowed'
]);
?>