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

// GET all teachers (for Manage Teachers page)
if ($method === 'GET') {
    try {
        $stmt = $pdo->prepare("
            SELECT 
                id,
                full_name,
                teacher_id_number,
                contact_number,
                address,
                advisory_grade,
                advisory_section,
                motto,
                contract_status
            FROM teachers
            WHERE contract_status = 'Active'
            ORDER BY full_name
        ");
        $stmt->execute();
        $teachers = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($teachers);
    } catch(PDOException $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit();
}

// POST - Add new teacher
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data || empty($data['full_name'])) {
        echo json_encode(['success' => false, 'error' => 'Teacher name is required']);
        exit();
    }
    
    try {
        $pdo->beginTransaction();
        
        $username = strtolower(preg_replace('/[^a-zA-Z0-9]/', '.', $data['full_name']));
        $email = !empty($data['email']) ? $data['email'] : $username . '@cabacaonhs.edu.ph';
        $hashedPassword = md5(!empty($data['password']) ? $data['password'] : 'password');
        
        // Insert into users
        $userStmt = $pdo->prepare("INSERT INTO users (username, email, full_name, password, role, status) VALUES (?, ?, ?, ?, 'teacher', 'active')");
        $userStmt->execute([$username, $email, $data['full_name'], $hashedPassword]);
        $userId = $pdo->lastInsertId();
        
        // Insert into teachers
        $teacherStmt = $pdo->prepare("
            INSERT INTO teachers (user_id, full_name, teacher_id_number, contact_number, address, advisory_grade, advisory_section, motto, contract_status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active')
        ");
        $teacherStmt->execute([
            $userId,
            $data['full_name'],
            $data['teacher_id_number'] ?? 'TCH' . str_pad($userId, 3, '0', STR_PAD_LEFT),
            $data['contact_number'] ?? '',
            $data['address'] ?? 'Brgy. Cabacao, Mindoro Occidental',
            $data['advisory_grade'] ?? '7',
            $data['advisory_section'] ?? 'Sampaguita',
            $data['motto'] ?? 'Teaching with passion, leading with purpose'
        ]);
        
        $pdo->commit();
        echo json_encode(['success' => true, 'message' => 'Teacher added successfully']);
    } catch(PDOException $e) {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit();
}

// PUT - Update teacher
if ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data || !isset($data['id'])) {
        echo json_encode(['success' => false, 'error' => 'Teacher ID required']);
        exit();
    }
    
    try {
        $stmt = $pdo->prepare("
            UPDATE teachers SET 
                full_name = ?,
                contact_number = ?,
                address = ?,
                advisory_grade = ?,
                advisory_section = ?,
                motto = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $data['full_name'],
            $data['contact_number'],
            $data['address'],
            $data['advisory_grade'],
            $data['advisory_section'],
            $data['motto'],
            $data['id']
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Teacher updated successfully']);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit();
}

// DELETE - Delete teacher
if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    if (!$id) {
        echo json_encode(['success' => false, 'error' => 'Teacher ID required']);
        exit();
    }
    
    try {
        $stmt = $pdo->prepare("UPDATE teachers SET contract_status = 'Inactive' WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode(['success' => true, 'message' => 'Teacher deleted successfully']);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit();
}

echo json_encode(['error' => 'Method not allowed']);
?>