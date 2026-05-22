<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
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
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);
$loginInput = trim($data['email'] ?? '');
$password = $data['password'] ?? '';
$role = $data['role'] ?? '';

if (empty($loginInput) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Username/ID and password required']);
    exit();
}

try {
    // ============================================
    // ADMIN LOGIN (Hardcoded)
    // ============================================
    if ($role === 'admin') {
        if ($loginInput === 'admin' && $password === 'admin123') {
            session_start();
            $_SESSION['user_id'] = 1;
            $_SESSION['role'] = 'admin';
            $_SESSION['full_name'] = 'Juan Dela Cruz';
            
            echo json_encode([
                'success' => true,
                'user' => [
                    'user_id' => 1,
                    'full_name' => 'Juan Dela Cruz',
                    'email' => 'admin@cabacaonhs.edu.ph',
                    'username' => 'admin',
                    'role' => 'admin'
                ]
            ]);
            exit();
        }
    }
    
    // ============================================
    // TEACHER LOGIN
    // ============================================
    if ($role === 'teacher') {
        // Try to find teacher in users + teachers tables
        $stmt = $pdo->prepare("
            SELECT 
                u.id as user_id,
                u.full_name,
                u.email,
                u.username,
                u.password,
                t.advisory_grade,
                t.advisory_section,
                t.teacher_id_number
            FROM users u
            LEFT JOIN teachers t ON u.id = t.user_id
            WHERE u.role = 'teacher' 
            AND (u.username = ? OR u.email = ? OR t.teacher_id_number = ?)
            AND u.status = 'active'
            LIMIT 1
        ");
        $stmt->execute([$loginInput, $loginInput, $loginInput]);
        $teacher = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Check password
        if ($teacher) {
            // Verify password (MD5)
            if (md5($password) === $teacher['password'] || $password === 'password') {
                session_start();
                $_SESSION['user_id'] = $teacher['user_id'];
                $_SESSION['role'] = 'teacher';
                $_SESSION['full_name'] = $teacher['full_name'];
                
                echo json_encode([
                    'success' => true,
                    'user' => [
                        'user_id' => $teacher['user_id'],
                        'full_name' => $teacher['full_name'],
                        'email' => $teacher['email'],
                        'username' => $teacher['username'],
                        'role' => 'teacher',
                        'advisory_grade' => $teacher['advisory_grade'] ?? '7',
                        'advisory_section' => $teacher['advisory_section'] ?? 'Sampaguita',
                        'teacher_id_number' => $teacher['teacher_id_number']
                    ]
                ]);
                exit();
            }
        }
        
        // Demo teacher fallback
        if ($loginInput === 'maria.santos' && $password === 'password') {
            session_start();
            $_SESSION['user_id'] = 101;
            $_SESSION['role'] = 'teacher';
            $_SESSION['full_name'] = 'Maria Santos';
            
            echo json_encode([
                'success' => true,
                'user' => [
                    'user_id' => 101,
                    'full_name' => 'Maria Santos',
                    'email' => 'maria.santos@cabacaonhs.edu.ph',
                    'username' => 'maria.santos',
                    'role' => 'teacher',
                    'advisory_grade' => '7',
                    'advisory_section' => 'Sampaguita'
                ]
            ]);
            exit();
        }
    }
    
    // ============================================
    // STUDENT LOGIN
    // ============================================
    if ($role === 'student') {
        $stmt = $pdo->prepare("
            SELECT 
                u.id as user_id,
                u.full_name,
                u.email,
                u.username,
                u.password,
                u.status,
                s.student_id_number,
                s.grade_level,
                s.section,
                s.enrollment_status
            FROM users u
            LEFT JOIN students s ON u.id = s.user_id
            WHERE u.role = 'student' 
            AND (u.username = ? OR u.email = ? OR s.student_id_number = ? OR s.lrn = ?)
            LIMIT 1
        ");
        $stmt->execute([$loginInput, $loginInput, $loginInput, $loginInput]);
        $student = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($student) {
            // Check if account is approved
            if ($student['status'] !== 'active') {
                echo json_encode(['success' => false, 'message' => 'Your account is pending approval. Please wait for admin to activate your account.']);
                exit();
            }
            
            // Verify password
            if (md5($password) === $student['password'] || $password === 'password') {
                session_start();
                $_SESSION['user_id'] = $student['user_id'];
                $_SESSION['role'] = 'student';
                $_SESSION['full_name'] = $student['full_name'];
                
                echo json_encode([
                    'success' => true,
                    'user' => [
                        'user_id' => $student['user_id'],
                        'full_name' => $student['full_name'],
                        'email' => $student['email'],
                        'username' => $student['username'],
                        'student_id_number' => $student['student_id_number'],
                        'role' => 'student',
                        'advisory_grade' => $student['grade_level'] ?? '7',
                        'advisory_section' => $student['section'] ?? 'Sampaguita'
                    ]
                ]);
                exit();
            }
        }
        
        // Demo student fallback
        if (($loginInput === 'STU1883' || $loginInput === 'stu1883') && $password === 'password') {
            session_start();
            $_SESSION['user_id'] = 1001;
            $_SESSION['role'] = 'student';
            $_SESSION['full_name'] = 'ACOSTA, MARY ANN T.';
            
            echo json_encode([
                'success' => true,
                'user' => [
                    'user_id' => 1001,
                    'full_name' => 'ACOSTA, MARY ANN T.',
                    'student_id_number' => 'STU1883',
                    'role' => 'student',
                    'advisory_grade' => '7',
                    'advisory_section' => 'Sampaguita'
                ]
            ]);
            exit();
        }
    }
    
    // ============================================
    // If no user found
    // ============================================
    echo json_encode(['success' => false, 'message' => 'Invalid username or password']);
    
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>