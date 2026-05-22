<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../db_connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $date = isset($_GET['date']) ? $_GET['date'] : date('Y-m-d');
    
    // Get all active teachers
    $teachers_sql = "SELECT id, full_name, advisory_grade, advisory_section 
                     FROM teachers 
                     WHERE contract_status = 'Active' 
                     ORDER BY id";
    
    $teachers_result = $conn->query($teachers_sql);
    $teachers = array();
    
    while ($teacher = $teachers_result->fetch_assoc()) {
        // Get students for this teacher
        $students_sql = "SELECT id, full_name, section 
                         FROM students 
                         WHERE assigned_teacher_id = " . $teacher['id'] . "
                         ORDER BY full_name";
        
        $students_result = $conn->query($students_sql);
        $students = array();
        $present = 0;
        $absent = 0;
        $late = 0;
        
        while ($student = $students_result->fetch_assoc()) {
            // Check attendance for this student
            $att_sql = "SELECT status FROM attendance 
                        WHERE student_id = " . $student['id'] . " 
                        AND attendance_date = '$date'";
            $att_result = $conn->query($att_sql);
            $status = 'Not Recorded';
            
            if ($att_result->num_rows > 0) {
                $att_row = $att_result->fetch_assoc();
                $status = $att_row['status'];
                if ($status == 'Present') $present++;
                elseif ($status == 'Absent') $absent++;
                elseif ($status == 'Late') $late++;
            }
            
            $students[] = array(
                'id' => $student['id'],
                'name' => $student['full_name'],
                'section' => $student['section'],
                'status' => $status,
                'remarks' => ''
            );
        }
        
        $total = count($students);
        $rate = $total > 0 ? round(($present / $total) * 100, 1) : 0;
        
        $teachers[] = array(
            'id' => $teacher['id'],
            'name' => $teacher['full_name'],
            'email' => strtolower(str_replace(' ', '.', $teacher['full_name'])) . '@cabacaonhs.edu.ph',
            'advisory_class' => 'Grade ' . $teacher['advisory_grade'] . ' - ' . $teacher['advisory_section'],
            'total_students' => $total,
            'present' => $present,
            'absent' => $absent,
            'late' => $late,
            'rate' => $rate,
            'students' => $students
        );
    }
    
    // Get statistics
    $stats_sql = "SELECT 
                    (SELECT COUNT(*) FROM teachers WHERE contract_status = 'Active') as teachers,
                    (SELECT COUNT(*) FROM students WHERE enrollment_status = 'Enrolled') as students,
                    (SELECT COUNT(*) FROM attendance WHERE attendance_date = '$date') as attendance_records,
                    (SELECT COUNT(*) FROM students WHERE assigned_teacher_id IS NOT NULL) as students_with_teacher";
    
    $stats_result = $conn->query($stats_sql);
    $stats = $stats_result->fetch_assoc();
    
    echo json_encode(array(
        'success' => true,
        'date' => $date,
        'statistics' => $stats,
        'teachers' => $teachers
    ));
}

$conn->close();
?>