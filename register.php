<?php
// register.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// CONFIGURATION NG IYONG XAMPP MYSQL DATABASE
$host = "localhost";
$db_name = "cabacao_sims"; // Palitan mo ito kung iba ang pangalan ng DB mo sa phpMyAdmin
$username = "root";
$password = "";

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name . ";charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $e->getMessage()]);
    exit();
}

// Basahin ang JSON object galing sa React Axios
$data = json_decode(file_get_contents("php://input"), true);

if (empty($data)) {
    echo json_encode(["success" => false, "message" => "No data received from frontend."]);
    exit();
}

// Kunin at i-sanitize ang lahat ng ipinadalang inputs
$full_name = $data['full_name'] ?? '';
$student_id_number = $data['student_id_number'] ?? '';
$lrn = $data['lrn'] ?? '';
$email = $data['email'] ?? '';
$user_name = $data['username'] ?? $student_id_number;
$plain_password = $data['password'] ?? '';
$grade_level = $data['grade_level'] ?? '';
$section = $data['section'] ?? '';
$school_year = $data['school_year'] ?? '';
$recovery_email = $data['recovery_email'] ?? '';
$security_question = $data['security_question'] ?? '';
$security_answer = $data['security_answer'] ?? '';

// Check required fields
if (empty($full_name) || empty($student_id_number) || empty($plain_password)) {
    echo json_encode(["success" => false, "message" => "Please fill in all required fields."]);
    exit();
}

try {
    // Simulan ang transaction para siguradong sabay silang mase-save
    $conn->beginTransaction();

    // 1. Suriin kung may kaparehong Username o Student ID na sa system
    $checkQuery = $conn->prepare("SELECT id FROM users WHERE username = ?");
    $checkQuery->execute([$user_name]);
    if ($checkQuery->rowCount() > 0) {
        echo json_encode(["success" => false, "message" => "Username or Student ID is already taken!"]);
        $conn->rollBack();
        exit();
    }

    // 2. I-hash ang password para hindi plain text sa database (Security standard para sa system niyo)
    // *Paunawa: Kung MD5 ang gamit sa inyong login system, palitan ito ng: $hashed_password = md5($plain_password);
    $hashed_password = password_hash($plain_password, PASSWORD_DEFAULT);

    // 3. I-insert sa `users` Table
    $userSql = "INSERT INTO users (username, password, role, status) VALUES (?, ?, 'student', 'pending')";
    $userStmt = $conn->prepare($userSql);
    $userStmt->execute([$user_name, $hashed_password]);
    
    // Kunin ang huling ID na ginawa para i-link sa student profile
    $user_id = $conn->lastInsertId();

    // 4. I-insert sa `students` Table kasama ang academic at security answers
    $studentSql = "INSERT INTO students (user_id, student_id_number, full_name, lrn, email, grade_level, section, school_year, recovery_email, security_question, security_answer) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $studentStmt = $conn->prepare($studentSql);
    $studentStmt->execute([
        $user_id,
        $student_id_number,
        $full_name,
        $lrn,
        $email,
        $grade_level,
        $section,
        $school_year,
        $recovery_email,
        $security_question,
        $security_answer
    ]);

    // I-commit ang transaksyon para i-save na nang tuluyan sa MySQL database
    $conn->commit();
    echo json_encode(["success" => true, "message" => "Account created successfully! It is now saved in the database."]);

} catch (Exception $e) {
    // Kung may nag-error, i-cancel ang pagsusulat para walang masirang data
    $conn->rollBack();
    echo json_encode(["success" => false, "message" => "Error saving data: " . $e->getMessage()]);
}
?>