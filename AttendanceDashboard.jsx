import React, { useState, useEffect } from 'react';

const AttendanceDashboard = () => {
  const [date, setDate] = useState('2026-05-20');
  const [teachers, setTeachers] = useState([]);
  const [stats, setStats] = useState({});
  const [expandedTeacher, setExpandedTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [date]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Use your actual API endpoint URL
      const response = await fetch(`/api/get_attendance_dashboard.php?date=${date}`);
      const data = await response.json();
      
      if (data.success) {
        setTeachers(data.teachers || []);
        setStats(data.statistics || {});
      } else {
        console.error('API error:', data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const saveAttendance = async (studentId, status, remarks) => {
    try {
      const response = await fetch('/api/save_attendance.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          attendance_date: date,
          status: status,
          remarks: remarks
        })
      });
      
      const result = await response.json();
      if (result.success) {
        // Reload to show updated data
        loadData();
      }
      return result.success;
    } catch (error) {
      console.error('Error saving:', error);
      return false;
    }
  };

  const getStatusColor = (rate) => {
    if (rate >= 90) return 'green';
    if (rate >= 75) return 'orange';
    return 'red';
  };

  if (loading) return <div>Loading attendance data...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>📅 Attendance Monitoring</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <input 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
        />
        <button onClick={loadData} style={{ marginLeft: '10px' }}>
          🔄 Refresh
        </button>
      </div>

      {/* Statistics */}
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        marginBottom: '20px',
        background: '#f0f0f0',
        padding: '15px',
        borderRadius: '5px'
      }}>
        <div><strong>Teachers:</strong> {stats.teachers || 0}</div>
        <div><strong>Students:</strong> {stats.students || 0}</div>
        <div><strong>Attendance Records:</strong> {stats.attendance_records || 0}</div>
        <div><strong>Students with teacher assignment:</strong> {stats.students_with_teacher || 0}</div>
      </div>

      {/* Teachers Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#2c3e50', color: 'white' }}>
            <th style={{ padding: '10px', textAlign: 'left' }}>Teacher Name</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Advisory Class</th>
            <th style={{ padding: '10px', textAlign: 'center' }}>Students</th>
            <th style={{ padding: '10px', textAlign: 'center' }}>Present</th>
            <th style={{ padding: '10px', textAlign: 'center' }}>Absent</th>
            <th style={{ padding: '10px', textAlign: 'center' }}>Late</th>
            <th style={{ padding: '10px', textAlign: 'center' }}>Rate</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((teacher) => (
            <React.Fragment key={teacher.id}>
              <tr 
                onClick={() => setExpandedTeacher(expandedTeacher === teacher.id ? null : teacher.id)}
                style={{ 
                  cursor: 'pointer', 
                  borderBottom: '1px solid #ddd',
                  background: expandedTeacher === teacher.id ? '#e8f4f8' : 'white'
                }}
              >
                <td style={{ padding: '10px' }}>
                  <strong>{teacher.name}</strong><br/>
                  <small>{teacher.email}</small>
                </td>
                <td style={{ padding: '10px' }}>{teacher.advisory_class}</td>
                <td style={{ padding: '10px', textAlign: 'center' }}>{teacher.total_students}</td>
                <td style={{ padding: '10px', textAlign: 'center', color: 'green' }}>✅ {teacher.present}</td>
                <td style={{ padding: '10px', textAlign: 'center', color: 'red' }}>❌ {teacher.absent}</td>
                <td style={{ padding: '10px', textAlign: 'center', color: 'orange' }}>⏰ {teacher.late}</td>
                <td style={{ 
                  padding: '10px', 
                  textAlign: 'center',
                  color: getStatusColor(teacher.rate),
                  fontWeight: 'bold'
                }}>
                  {teacher.rate}%
                </td>
              </tr>
              
              {/* Expanded Students Row */}
              {expandedTeacher === teacher.id && (
                <tr>
                  <td colSpan="7" style={{ padding: '20px', background: '#f9f9f9' }}>
                    <h4>📋 Students under {teacher.name}</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#7f8c8d', color: 'white' }}>
                          <th style={{ padding: '8px' }}>#</th>
                          <th style={{ padding: '8px' }}>Student Name</th>
                          <th style={{ padding: '8px' }}>Section</th>
                          <th style={{ padding: '8px' }}>Status</th>
                          <th style={{ padding: '8px' }}>Remarks</th>
                          <th style={{ padding: '8px' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teacher.students && teacher.students.map((student, idx) => (
                          <AttendanceRow 
                            key={student.id}
                            student={student}
                            idx={idx}
                            onSave={saveAttendance}
                          />
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Component for each student row
const AttendanceRow = ({ student, idx, onSave }) => {
  const [status, setStatus] = useState(student.status || 'Not Recorded');
  const [remarks, setRemarks] = useState(student.remarks || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const success = await onSave(student.id, status, remarks);
    if (success) {
      alert('Attendance saved!');
    } else {
      alert('Error saving attendance');
    }
    setSaving(false);
  };

  return (
    <tr style={{ borderBottom: '1px solid #ddd' }}>
      <td style={{ padding: '8px' }}>{idx + 1}</td>
      <td style={{ padding: '8px' }}>{student.name}</td>
      <td style={{ padding: '8px' }}>{student.section}</td>
      <td style={{ padding: '8px' }}>
        <select 
          value={status} 
          onChange={(e) => setStatus(e.target.value)}
          style={{ padding: '5px' }}
        >
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
          <option value="Late">Late</option>
          <option value="Not Recorded">Not Recorded</option>
        </select>
      </td>
      <td style={{ padding: '8px' }}>
        <input 
          type="text" 
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Remarks"
          style={{ padding: '5px', width: '150px' }}
        />
      </td>
      <td style={{ padding: '8px' }}>
        <button 
          onClick={handleSave} 
          disabled={saving}
          style={{
            padding: '5px 10px',
            background: saving ? '#95a5a6' : '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </td>
    </tr>
  );
};

export default AttendanceDashboard;