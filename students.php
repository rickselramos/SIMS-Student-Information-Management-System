<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
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

// GET - Fetch all students
if ($method === 'GET') {
    try {
        $stmt = $pdo->prepare("
            SELECT 
                s.id,
                s.student_id_number,
                s.lrn,
                u.full_name,
                s.grade_level,
                s.section,
                s.gender,
                s.contact_number,
                u.email,
                s.enrollment_status,
                s.guardian_name,
                s.address,
                s.birth_date,
                s.assigned_teacher_id
            FROM students s
            INNER JOIN users u ON s.user_id = u.id
            WHERE u.status = 'active'
            ORDER BY s.grade_level, s.section, u.full_name
        ");
        $stmt->execute();
        $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($students);
    } catch(PDOException $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit();
}

// POST - Add new student
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data || empty($data['full_name'])) {
        echo json_encode(['success' => false, 'error' => 'Student name is required']);
        exit();
    }
    
    try {
        $pdo->beginTransaction();
        
        // Generate username and email
        $username = strtolower(preg_replace('/[^a-zA-Z0-9]/', '.', $data['full_name'])) . rand(100, 999);
        $email = !empty($data['email']) ? $data['email'] : $username . '@cabacaonhs.edu.ph';
        $hashedPassword = md5(!empty($data['password']) ? $data['password'] : 'password');
        $studentIdNumber = !empty($data['student_id_number']) ? $data['student_id_number'] : 'STU' . rand(1000, 9999);
        
        // Insert into users table
        $userStmt = $pdo->prepare("INSERT INTO users (username, email, full_name, password, role, status) VALUES (?, ?, ?, ?, 'student', 'active')");
        $userStmt->execute([$username, $email, $data['full_name'], $hashedPassword]);
        $userId = $pdo->lastInsertId();
        
        // Insert into students table
        $studentStmt = $pdo->prepare("
            INSERT INTO students (
                user_id, student_id_number, lrn, grade_level, section, 
                gender, contact_number, address, guardian_name, birth_date, 
                enrollment_status, assigned_teacher_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $studentStmt->execute([
            $userId,
            $studentIdNumber,
            $data['lrn'] ?? '',
            $data['grade_level'] ?? '7',
            $data['section'] ?? 'Sampaguita',
            $data['gender'] ?? 'Male',
            $data['contact_number'] ?? '',
            $data['address'] ?? 'Brgy. Cabacao, Mindoro Occidental',
            $data['guardian_name'] ?? '',
            $data['birth_date'] ?? null,
            $data['enrollment_status'] ?? 'Enrolled',
            $data['assigned_teacher_id'] ?? null
        ]);
        
        $pdo->commit();
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId(), 'message' => 'Student added successfully']);
    } catch(PDOException $e) {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit();
}

// PUT - Update student
if ($method === 'PUT') {
    // Get raw input
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);
    
    // Log for debugging
    error_log("PUT Request received: " . $rawInput);
    
    if (!$data) {
        echo json_encode(['success' => false, 'error' => 'Invalid JSON data']);
        exit();
    }
    
    if (!isset($data['id'])) {
        echo json_encode(['success' => false, 'error' => 'Student ID is required']);
        exit();
    }
    
    try {
        // First, get the user_id from students table
        $getUserStmt = $pdo->prepare("SELECT user_id FROM students WHERE id = ?");
        $getUserStmt->execute([$data['id']]);
        $studentRecord = $getUserStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$studentRecord) {
            echo json_encode(['success' => false, 'error' => 'Student not found']);
            exit();
        }
        
        $userId = $studentRecord['user_id'];
        
        // Update users table
        if (isset($data['full_name']) || isset($data['email'])) {
            $userUpdate = [];
            $userParams = [];
            
            if (isset($data['full_name'])) {
                $userUpdate[] = "full_name = ?";
                $userParams[] = $data['full_name'];
            }
            if (isset($data['email'])) {
                $userUpdate[] = "email = ?";
                $userParams[] = $data['email'];
            }
            
            if (!empty($userUpdate)) {
                $userParams[] = $userId;
                $userStmt = $pdo->prepare("UPDATE users SET " . implode(", ", $userUpdate) . " WHERE id = ?");
                $userStmt->execute($userParams);
            }
        }
        
        // Update students table
        $studentStmt = $pdo->prepare("
            UPDATE students SET 
                student_id_number = COALESCE(?, student_id_number),
                lrn = COALESCE(?, lrn),
                grade_level = COALESCE(?, grade_level),
                section = COALESCE(?, section),
                gender = COALESCE(?, gender),
                contact_number = COALESCE(?, contact_number),
                address = COALESCE(?, address),
                guardian_name = COALESCE(?, guardian_name),
                birth_date = COALESCE(?, birth_date),
                enrollment_status = COALESCE(?, enrollment_status),
                assigned_teacher_id = COALESCE(?, assigned_teacher_id)
            WHERE id = ?
        ");
        
        $studentStmt->execute([
            $data['student_id_number'] ?? null,
            $data['lrn'] ?? null,
            $data['grade_level'] ?? null,
            $data['section'] ?? null,
            $data['gender'] ?? null,
            $data['contact_number'] ?? null,
            $data['address'] ?? null,
            $data['guardian_name'] ?? null,
            $data['birth_date'] ?? null,
            $data['enrollment_status'] ?? null,
            $data['assigned_teacher_id'] ?? null,
            $data['id']
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Student updated successfully']);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit();
}

// DELETE - Delete student
if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    if (!$id) {
        echo json_encode(['success' => false, 'error' => 'Student ID is required']);
        exit();
    }
    
    try {
        // Get user_id first
        $getUserStmt = $pdo->prepare("SELECT user_id FROM students WHERE id = ?");
        $getUserStmt->execute([$id]);
        $student = $getUserStmt->fetch();
        
        if ($student) {
            // Delete from users (cascade will delete from students)
            $deleteStmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
            $deleteStmt->execute([$student['user_id']]);
        }
        
        echo json_encode(['success' => true, 'message' => 'Student deleted successfully']);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit();
}

echo json_encode(['error' => 'Method not allowed']);
?>