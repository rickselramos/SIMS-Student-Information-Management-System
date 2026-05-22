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

require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM announcements ORDER BY created_at DESC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;
        
    case 'POST':
        try {
            // Kunin at i-decode ang JSON body
            $jsonInput = file_get_contents('php://input');
            $data = json_decode($jsonInput, true);
            
           
    

            // 2. PREPARE THE STATEMENT
            $stmt = $pdo->prepare("
                INSERT INTO announcements (title, content, author_name, author_role, target_audience) 
                VALUES (:title, :content, :author_name, :author_role, :target_audience)
            ");
            
            // 3. EXECUTE WITH NAMED PARAMETERS (Mas malinis i-debug)
           $success = $stmt->execute([
    ':title'           => $data['title'],
    ':content'         => $data['content'],
    ':author_name'     => $data['author_name'],
    // Kung walang pinadalang role ang frontend, gagawin itong 'Admin'
    ':author_role'     => $data['author_role'] ?? 'Admin', 
    ':target_audience' => $data['target_audience']
]);
            
            // Pwede ring maging false ang execute kung may database constraint block
            if ($success) {
                http_response_code(201); // Created
                echo json_encode([
                    'success' => true, 
                    'message' => 'Announcement posted successfully', 
                    'id' => $pdo->lastInsertId()
                ]);
            } else {
                throw new Exception("Hindi matukoy na error sa pag-execute ng query.");
            }

        } catch (PDOException $e) {
            // DITO NATIN SASALUHIN ANG DATABASE ERRORS (Maling column name, data type, etc.)
            http_response_code(500); // Internal Server Error
            echo json_encode([
                'error' => 'Database Error nangyari!',
                'debug_message' => $e->getMessage() // Ipapakita nito sa iyo kung anong eksaktong column ang may mali
            ]);
        } catch (Exception $e) {
            // SALO ANG IBANG KLASE NG ERRORS
            http_response_code(500);
            echo json_encode([
                'error' => 'System Error!',
                'debug_message' => $e->getMessage()
            ]);
        }
        break;
        
    default:
        echo json_encode(['error' => 'Method not supported']);
        break;
}
?>