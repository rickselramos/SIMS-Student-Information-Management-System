<?php
require_once 'db_connect.php';

$date = isset($_GET['date']) ? $_GET['date'] : date('Y-m-d');

// Get statistics
$stats_sql = "SELECT 
                (SELECT COUNT(*) FROM teachers WHERE contract_status = 'Active') as teachers,
                (SELECT COUNT(*) FROM students WHERE enrollment_status = 'Enrolled') as students,
                (SELECT COUNT(*) FROM attendance WHERE attendance_date = '$date') as attendance_records,
                (SELECT COUNT(*) FROM students WHERE assigned_teacher_id IS NOT NULL) as students_with_teacher";
$stats_result = $conn->query($stats_sql);
$stats = $stats_result->fetch_assoc();

// Get teachers with attendance summary
$teachers_sql = "SELECT 
                    t.id, t.full_name, t.advisory_grade, t.advisory_section,
                    COUNT(DISTINCT s.id) as total_students,
                    COUNT(DISTINCT CASE WHEN a.status = 'Present' THEN s.id END) as present,
                    COUNT(DISTINCT CASE WHEN a.status = 'Absent' THEN s.id END) as absent,
                    COUNT(DISTINCT CASE WHEN a.status = 'Late' THEN s.id END) as late
                FROM teachers t
                LEFT JOIN students s ON s.assigned_teacher_id = t.id
                LEFT JOIN attendance a ON a.student_id = s.id AND a.attendance_date = '$date'
                WHERE t.contract_status = 'Active'
                GROUP BY t.id ORDER BY t.id";
$teachers_result = $conn->query($teachers_sql);
?>

<!DOCTYPE html>
<html>
<head>
    <title>Attendance Monitoring - Cabacao NHS</title>
    <style>
        body { font-family: Arial; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1400px; margin: 0 auto; background: white; padding: 20px; border-radius: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #2c3e50; color: white; }
        .stats { display: flex; gap: 20px; margin-bottom: 20px; }
        .stat-card { background: #ecf0f1; padding: 15px; border-radius: 5px; flex: 1; text-align: center; }
        .stat-card h3 { margin: 0; font-size: 24px; }
        .present { color: green; }
        .absent { color: red; }
        .late { color: orange; }
        .expand-icon { cursor: pointer; display: inline-block; width: 20px; }
        .students-row { background: #f9f9f9; }
        .students-table { margin: 10px 0 10px 30px; width: 95%; }
        .students-table th { background: #7f8c8d; font-size: 14px; }
        select, button { padding: 5px; margin: 2px; }
        .save-btn { background: #3498db; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px; }
        .save-btn:hover { background: #2980b9; }
    </style>
</head>
<body>
<div class="container">
    <h1>📅 Attendance Monitoring</h1>
    <p><strong>Date:</strong> <?php echo $date; ?></p>
    
    <div class="stats">
        <div class="stat-card"><h3><?php echo $stats['teachers']; ?></h3><p>Teachers</p></div>
        <div class="stat-card"><h3><?php echo $stats['students']; ?></h3><p>Students</p></div>
        <div class="stat-card"><h3><?php echo $stats['attendance_records']; ?></h3><p>Attendance Records</p></div>
        <div class="stat-card"><h3><?php echo $stats['students_with_teacher']; ?></h3><p>Students with teacher assignment</p></div>
    </div>
    
    <div style="margin-bottom: 20px;">
        <input type="date" id="attendanceDate" value="<?php echo $date; ?>">
        <button onclick="window.location.href='?date='+document.getElementById('attendanceDate').value">Refresh</button>
    </div>
    
    <table id="teacherTable">
        <thead>
            <tr><th></th><th>Teacher Name</th><th>Advisory Class</th><th>Students</th><th>Present</th><th>Absent</th><th>Late</th><th>Rate</th></tr>
        </thead>
        <tbody>
        <?php while($teacher = $teachers_result->fetch_assoc()): 
            $rate = $teacher['total_students'] > 0 ? round(($teacher['present'] / $teacher['total_students']) * 100, 1) : 0;
            $email = strtolower(str_replace(' ', '.', $teacher['full_name'])) . '@cabacaonhs.edu.ph';
        ?>
            <tr onclick="toggleStudents(<?php echo $teacher['id']; ?>)" style="cursor: pointer;">
                <td><span id="icon-<?php echo $teacher['id']; ?>">▶</span></td>
                <td><strong><?php echo $teacher['full_name']; ?></strong><br><small><?php echo $email; ?></small></td>
                <td>Grade <?php echo $teacher['advisory_grade']; ?> - <?php echo $teacher['advisory_section']; ?></td>
                <td><?php echo $teacher['total_students']; ?></td>
                <td class="present">✅ <?php echo $teacher['present']; ?></td>
                <td class="absent">❌ <?php echo $teacher['absent']; ?></td>
                <td class="late">⏰ <?php echo $teacher['late']; ?></td>
                <td><?php echo $rate; ?>%</td>
            </tr>
            <tr id="students-<?php echo $teacher['id']; ?>" style="display: none;" class="students-row">
                <td colspan="8">
                    <div style="padding: 10px;">
                        <h4>📋 Students under <?php echo $teacher['full_name']; ?></h4>
                        <?php
                        $students_sql = "SELECT s.id, s.full_name, s.section, a.status, a.remarks 
                                        FROM students s 
                                        LEFT JOIN attendance a ON a.student_id = s.id AND a.attendance_date = '$date'
                                        WHERE s.assigned_teacher_id = {$teacher['id']}
                                        ORDER BY s.full_name";
                        $students_result = $conn->query($students_sql);
                        ?>
                        <table class="students-table">
                            <thead><tr><th>#</th><th>Student Name</th><th>Section</th><th>Status</th><th>Remarks</th></tr></thead>
                            <tbody>
                            <?php $i = 1; while($student = $students_result->fetch_assoc()): ?>
                                <tr>
                                    <td><?php echo $i++; ?></td>
                                    <td><?php echo $student['full_name']; ?></td>
                                    <td><?php echo $student['section']; ?></td>
                                    <td><?php echo $student['status'] ?? 'Not Recorded'; ?></td>
                                    <td><?php echo $student['remarks'] ?? ''; ?></td>
                                </tr>
                            <?php endwhile; ?>
                            </tbody>
                        </table>
                    </div>
                </td>
            </tr>
        <?php endwhile; ?>
        </tbody>
    </table>
</div>

<script>
function toggleStudents(teacherId) {
    const row = document.getElementById(`students-${teacherId}`);
    const icon = document.getElementById(`icon-${teacherId}`);
    if (row.style.display === 'none') {
        row.style.display = 'table-row';
        icon.innerHTML = '▼';
    } else {
        row.style.display = 'none';
        icon.innerHTML = '▶';
    }
}
</script>
</body>
</html>
