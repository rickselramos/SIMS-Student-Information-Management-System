import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

function TeacherDashboard({ onLogout, userData }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [myStudents, setMyStudents] = useState([]);
  const [mySchedule, setMySchedule] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [grades, setGrades] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newMessage, setNewMessage] = useState({ subject: '', message: '' });
  const [profile, setProfile] = useState(userData);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showExcuseModal, setShowExcuseModal] = useState(false);
  const [excuseReason, setExcuseReason] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [openAttendanceRow, setOpenAttendanceRow] = useState(null);
  const [teacherMotto, setTeacherMotto] = useState('');
  const [greeting, setGreeting] = useState('');
  const [showPostAnnouncement, setShowPostAnnouncement] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', target_audience: 'students' });

  // Profile edit states
  const [isEditing, setIsEditing] = useState(false);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [editFormData, setEditFormData] = useState({
    full_name: userData?.full_name || 'Maria Santos',
    email: userData?.email || 'maria.santos@cabacaonhs.edu.ph',
    contact_number: userData?.contact_number || '+63 917 482 5619',
    address: userData?.address || 'Purok 3, Brgy. Sampaguita, Cabacao',
    birth_date: '1985-06-15',
    gender: 'Female'
  });

  const teacherSubjects = ['Mathematics 7', 'Science 7'];
  const teacherDetails = {
    employee_id: 'TCH-2019-004',
    position: 'Public School Teacher I',
    department: 'Junior High School Department',
    date_hired: '2019-06-03',
    years_in_service: 6,
    employment_status: 'Permanent',
    school_assigned: 'Cabacao National High School'
  };

  const advisoryGrade = userData?.advisory_grade || '7';
  const advisorySection = userData?.advisory_section || 'Sampaguita';
  const teacherAdvisory = `Grade ${advisoryGrade} – ${advisorySection}`;
  const teacherId = userData?.user_id || userData?.id || 101;

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('🌞 Good Morning');
    else if (hour < 18) setGreeting('🌤️ Good Afternoon');
    else setGreeting('🌙 Good Evening');

    // Load saved profile picture
    const savedPicture = localStorage.getItem('profilePicture');
    if (savedPicture) {
      setProfilePicturePreview(savedPicture);
    }
  }, []);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = [
    { start: '07:30', end: '08:30', period: '1st Period' },
    { start: '08:30', end: '09:30', period: '2nd Period' },
    { start: '09:30', end: '09:45', period: 'Recess', isBreak: true, label: '🥪 Recess Break' },
    { start: '09:45', end: '10:45', period: '3rd Period' },
    { start: '10:45', end: '11:45', period: '4th Period' },
    { start: '11:45', end: '12:45', period: 'Lunch', isBreak: true, label: '🍱 Lunch Break' },
    { start: '12:45', end: '13:45', period: '5th Period' },
    { start: '13:45', end: '14:45', period: '6th Period' },
    { start: '14:45', end: '15:45', period: '7th Period' }
  ];

  const motivationalMessages = [
    "✨ 'The future of the world is in your classroom today.' - Ivan Welton Fitzwater",
    "📚 'Teaching is the one profession that creates all other professions.'",
    "🌟 'Every student can learn, just not on the same day or in the same way.'",
    "💡 'The art of teaching is the art of assisting discovery.'",
    "🎯 'Your impact as a teacher lasts a lifetime.'"
  ];
  const [currentMessage, setCurrentMessage] = useState(motivationalMessages[0]);

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    excusedToday: 0,
    averageGrade: 0,
    topPerformer: 'N/A'
  });

  useEffect(() => {
    fetchAllData();
    fetchMessages();
    fetchNotifications();
    fetchTeacherMotto();
    const messageInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
      setCurrentMessage(motivationalMessages[randomIndex]);
    }, 10000);
    return () => clearInterval(messageInterval);
  }, []);

  const fetchTeacherMotto = async () => {
    setTeacherMotto("Teaching with passion, leading with purpose. Every student can learn, just not on the same day or in the same way.");
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const teacherIdValue = teacherId;

      // Fetch schedule
      let scheduleData = [];
      try {
        const scheduleRes = await api.get(`/schedules.php?teacher_id=${teacherIdValue}`);
        scheduleData = Array.isArray(scheduleRes.data) ? scheduleRes.data : [];
      } catch (err) {
        console.log('Using fallback schedule');
      }

      if (scheduleData.length === 0) {
        scheduleData = [
          { id: 1, day_of_week: "Monday", subject: "Mathematics 7", start_time: "07:30", end_time: "09:30", room_name: "Room 101" },
          { id: 2, day_of_week: "Monday", subject: "Science 7", start_time: "09:45", end_time: "11:45", room_name: "Science Lab" },
          { id: 3, day_of_week: "Tuesday", subject: "Mathematics 7", start_time: "07:30", end_time: "09:30", room_name: "Room 101" },
          { id: 4, day_of_week: "Tuesday", subject: "Science 7", start_time: "09:45", end_time: "11:45", room_name: "Science Lab" },
          { id: 5, day_of_week: "Wednesday", subject: "Mathematics 7", start_time: "07:30", end_time: "09:30", room_name: "Room 101" },
          { id: 6, day_of_week: "Wednesday", subject: "Science 7", start_time: "09:45", end_time: "11:45", room_name: "Science Lab" },
          { id: 7, day_of_week: "Thursday", subject: "Mathematics 7", start_time: "07:30", end_time: "09:30", room_name: "Room 101" },
          { id: 8, day_of_week: "Thursday", subject: "Science 7", start_time: "09:45", end_time: "11:45", room_name: "Science Lab" },
          { id: 9, day_of_week: "Friday", subject: "Mathematics 7", start_time: "07:30", end_time: "09:30", room_name: "Room 101" },
          { id: 10, day_of_week: "Friday", subject: "Science 7", start_time: "09:45", end_time: "11:45", room_name: "Science Lab" }
        ];
      }
      setMySchedule(scheduleData);

      // Fetch students
      const studentsRes = await api.get(`/my-students.php?teacher_id=${teacherIdValue}`);
      let studentsData = Array.isArray(studentsRes.data) ? studentsRes.data : [];

      if (studentsData.length === 0) {
        const realNames = [
          'ABAD, JOHNNY S.', 'ACOSTA, MARY ANN T.', 'AGUILAR, JOSEPH U.', 'ALCANTARA, VICTORIA V.',
          'ALVAREZ, RONALD W.', 'AMBROCIO, CATHERINE X.', 'ANDRES, PATRICK Y.', 'ANGELES, JENNIFER Z.',
          'ANTONIO, CHRISTIAN A1.', 'APOSTOL, MONICA B2.', 'ARAGON, JEROME C3.', 'ARANETA, KRISTINE D4.',
          'ARAYATA, NELSON E5.', 'ARCEO, ROSEMARIE F6.', 'ARCILLA, FERNANDO G7.', 'ARELLANO, LOURDES H8.',
          'ARROYO, CARLOS I9.', 'ASIS, MA. LOURDES J10.', 'ASTORGA, DANILO K11.', 'ATIENZA, EVELYN L12.',
          'AURELIO, RENE M13.', 'AVILA, CORAZON N14.', 'AYALA, EMMANUEL O15.', 'AZNAR, GLORIA P16.',
          'BABASA, RODRIGO Q17.', 'BACANI, TERESITA R18.', 'BACOLOD, ALEJANDRO S19.', 'BADILLA, MARIA T20.',
          'BAGUIO, VICENTE U21.', 'BALABAG, LEA V22.', 'BALAGTAS, FRANCIS W23.', 'BALBASTRO, MARCELO X24.',
          'BALDERAMA, RIZA Y25.', 'BALINGIT, ROMULO Z26.', 'BALTAZAR, OLIVIA A27.', 'CRUZ, ANA R.',
          'DELA CRUZ, JUAN M.', 'FERNANDEZ, ROSA S.', 'GARCIA, CARLOS M.', 'GONZALES, ANDRES V.',
          'MENDOZA, RICARDO T.', 'RAMIREZ, TERESA W.', 'REYES, JOSE P.', 'SANTOS, MARIA L.', 'VILLANUEVA, ELENA U.'
        ];
        studentsData = realNames.map((name, i) => ({
          id: 2000 + i,
          full_name: name,
          student_id_number: `2024-7${String(i + 1).padStart(3, '0')}`,
          grade_level: '7',
          section: 'Sampaguita',
          contact_number: `09123456${String(i + 1).padStart(3, '0')}`
        }));
      }
      setMyStudents(studentsData);

      // Fetch attendance
      let attendanceData = [];
      try {
        const attendanceRes = await api.get(`/attendance.php?grade_level=7&section=Sampaguita&date=${selectedDate}`);
        attendanceData = Array.isArray(attendanceRes.data) ? attendanceRes.data : [];
      } catch (err) { }

      if (attendanceData.length === 0 && studentsData.length > 0) {
        attendanceData = studentsData.map((s, idx) => ({
          student_id: s.id,
          student_name: s.full_name,
          attendance_date: selectedDate,
          status: idx < 28 ? 'Present' : (idx < 35 ? 'Absent' : 'Late'),
          remarks: ''
        }));
      }
      setAttendance(attendanceData);

      // Fetch grades
      let gradesData = [];
      try {
        const gradesRes = await api.get(`/teacher-grades.php?grade_level=7&section=Sampaguita`);
        gradesData = Array.isArray(gradesRes.data) ? gradesRes.data : [];
      } catch (err) { }

      if (gradesData.length === 0 && studentsData.length > 0) {
        const gradeValues = [93, 83, 77, 81, 84, 93, 97, 80, 93, 81, 89, 88, 95, 77, 79, 78, 93, 96, 75, 83, 85, 76, 80, 93, 94, 96, 82, 75, 90, 89, 95, 77, 80, 76, 93, 96, 84, 90, 84, 81, 98, 93, 97, 88, 94];
        gradesData = studentsData.map((s, idx) => ({
          student_id: s.id,
          student_name: s.full_name,
          total_grade: gradeValues[idx % gradeValues.length],
          quiz_1: 80, quiz_2: 85, quiz_3: 82, assignment: 88, project: 90, exam: 85
        }));
      }
      setGrades(gradesData);

      // Fetch announcements
      try {
        const annRes = await api.get('/announcements.php');
        setAnnouncements(Array.isArray(annRes.data) ? annRes.data : []);
      } catch (err) {
        setAnnouncements([
          { id: 1, title: "Welcome to Grade 7!", content: "Welcome to the new school year. Please check your schedules.", author_name: "Admin", created_at: new Date().toISOString() },
          { id: 2, title: "Periodic Exam Schedule", content: "First periodic exam will be on June 15-20, 2026.", author_name: "Principal", created_at: new Date().toISOString() }
        ]);
      }

      // Compute stats
      const todayAttendance = attendanceData.filter(a => a.attendance_date === selectedDate);
      const validGrades = gradesData.filter(g => g.total_grade > 0);
      const avgGrade = validGrades.length > 0 ? (validGrades.reduce((sum, g) => sum + (g.total_grade || 0), 0) / validGrades.length).toFixed(1) : 0;

      let topPerformer = 'N/A';
      let topAvg = 0;
      const studentAverages = {};
      validGrades.forEach(g => {
        if (!studentAverages[g.student_id]) {
          studentAverages[g.student_id] = { total: 0, count: 0, name: g.student_name };
        }
        studentAverages[g.student_id].total += g.total_grade;
        studentAverages[g.student_id].count++;
      });
      for (const [id, data] of Object.entries(studentAverages)) {
        const avg = data.total / data.count;
        if (avg > topAvg) {
          topAvg = avg;
          topPerformer = data.name;
        }
      }

      setStats({
        totalStudents: studentsData.length,
        totalClasses: scheduleData.length,
        presentToday: todayAttendance.filter(a => a.status === 'Present').length,
        absentToday: todayAttendance.filter(a => a.status === 'Absent').length,
        lateToday: todayAttendance.filter(a => a.status === 'Late').length,
        excusedToday: todayAttendance.filter(a => a.status === 'Excused').length,
        averageGrade: avgGrade,
        topPerformer: topPerformer || 'N/A'
      });

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get('/messages.php');
      setMessages(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setMessages([]);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications.php');
      setNotifications(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setNotifications([]);
    }
  };

  const handleRecordAttendance = async (studentId, status, remarks = null) => {
    const studentName = myStudents.find(s => s.id === studentId)?.full_name;

    setAttendance(prev => {
      const existing = prev.find(a => a.student_id === studentId && a.attendance_date === selectedDate);
      if (existing) {
        return prev.map(a => a.student_id === studentId && a.attendance_date === selectedDate
          ? { ...a, status: status, remarks: remarks || a.remarks } : a);
      } else {
        return [...prev, {
          student_id: studentId,
          student_name: studentName,
          attendance_date: selectedDate,
          status: status,
          remarks: remarks || ''
        }];
      }
    });

    setStats(prev => {
      const newStats = { ...prev };
      if (status === 'Present') newStats.presentToday++;
      else if (status === 'Absent') newStats.absentToday++;
      else if (status === 'Late') newStats.lateToday++;
      else if (status === 'Excused') newStats.excusedToday++;
      return newStats;
    });

    alert(`✅ Attendance recorded: ${status} for ${studentName}`);
    setExcuseReason('');
    setShowExcuseModal(false);
    setOpenAttendanceRow(null);
  };

  const handleSaveGrade = async (studentId) => {
    const quiz1 = parseFloat(document.getElementById(`quiz1_${studentId}`)?.value) || 0;
    const quiz2 = parseFloat(document.getElementById(`quiz2_${studentId}`)?.value) || 0;
    const quiz3 = parseFloat(document.getElementById(`quiz3_${studentId}`)?.value) || 0;
    const assignment = parseFloat(document.getElementById(`assignment_${studentId}`)?.value) || 0;
    const project = parseFloat(document.getElementById(`project_${studentId}`)?.value) || 0;
    const exam = parseFloat(document.getElementById(`exam_${studentId}`)?.value) || 0;

    const quizAvg = (quiz1 + quiz2 + quiz3) / 3;
    const totalGrade = (quizAvg * 0.3) + (assignment * 0.2) + (project * 0.2) + (exam * 0.3);
    const finalGrade = isNaN(totalGrade) ? 0 : totalGrade;
    const studentName = myStudents.find(s => s.id === studentId)?.full_name;

    setGrades(prev => {
      const existing = prev.find(g => g.student_id === studentId);
      if (existing) {
        return prev.map(g => g.student_id === studentId
          ? { ...g, total_grade: finalGrade, quiz_1: quiz1, quiz_2: quiz2, quiz_3: quiz3, assignment: assignment, project: project, exam: exam }
          : g);
      } else {
        return [...prev, {
          student_id: studentId,
          student_name: studentName,
          total_grade: finalGrade,
          quiz_1: quiz1, quiz_2: quiz2, quiz_3: quiz3,
          assignment: assignment, project: project, exam: exam
        }];
      }
    });

    alert(`✅ Grades saved for ${studentName}`);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;

    try {
      const response = await api.post('/messages.php', {
        receiver_id: selectedStudent.id,
        receiver_name: selectedStudent.full_name,
        receiver_role: 'student',
        subject: newMessage.subject,
        message: newMessage.message,
        sender_id: teacherId,
        sender_name: profile?.full_name || 'Maria Santos',
        sender_role: 'teacher'
      });

      if (response.data.success) {
        alert('✅ Message sent successfully to ' + selectedStudent.full_name);
        setShowMessageModal(false);
        setNewMessage({ subject: '', message: '' });
        setSelectedStudent(null);
        fetchMessages(); // Refresh messages
      } else {
        alert('Error sending message');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error sending message');
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post('/announcements.php', {
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        target_audience: newAnnouncement.target_audience,
        author_name: profile?.full_name || 'Maria Santos',
        author_role: 'teacher'
      });

      if (response.data.success) {
        alert('✅ Announcement posted successfully!');
        setNewAnnouncement({ title: '', content: '', target_audience: 'students' });
        setShowPostAnnouncement(false);
        fetchAllData(); // Refresh announcements
      } else {
        alert('Error posting announcement');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error posting announcement');
    }
  };

  const handleAddComment = async (announcementId) => {
    const commentTextarea = document.getElementById(`comment_${announcementId}`);
    const comment = commentTextarea?.value;

    if (!comment || !comment.trim()) {
      alert('Please enter a comment');
      return;
    }

    try {
      const response = await api.post('/comments.php', {
        announcement_id: announcementId,
        comment: comment,
        user_id: teacherId,
        user_name: profile?.full_name || 'Maria Santos'
      });

      if (response.data.success) {
        alert('✅ Comment added!');
        if (commentTextarea) commentTextarea.value = '';
        fetchAllData(); // Refresh to show new comment
      } else {
        alert('Error adding comment');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error adding comment');
    }
  };
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
        localStorage.setItem('profilePicture', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setProfile({
      ...profile,
      full_name: editFormData.full_name,
      email: editFormData.email,
      contact_number: editFormData.contact_number,
      address: editFormData.address
    });
    setIsEditing(false);
    alert('✅ Profile updated successfully!');
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const getTodayAttendance = (studentId) => {
    return attendance.find(a => a.student_id === studentId && a.attendance_date === selectedDate);
  };

  const getStudentGrade = (studentId) => {
    return grades.find(g => g.student_id === studentId);
  };

  const getClassAtTime = (day, timeStart, timeEnd) => {
    const convertToMinutes = (time) => {
      const [hours, minutes] = time.split(':');
      return parseInt(hours) * 60 + parseInt(minutes);
    };
    const slotStartMinutes = convertToMinutes(timeStart);
    const slotEndMinutes = convertToMinutes(timeEnd);
    return mySchedule.find(s =>
      s.day_of_week === day &&
      convertToMinutes(s.start_time) <= slotStartMinutes &&
      convertToMinutes(s.end_time) >= slotEndMinutes
    );
  };

  const attendanceChartData = [
    { name: 'Present', value: stats.presentToday, color: '#28a745' },
    { name: 'Absent', value: stats.absentToday, color: '#dc3545' },
    { name: 'Late', value: stats.lateToday, color: '#ffc107' },
    { name: 'Excused', value: stats.excusedToday, color: '#17a2b8' }
  ];

  const gradeDistribution = [
    { range: '90-100%', count: grades.filter(g => g.total_grade >= 90).length },
    { range: '80-89%', count: grades.filter(g => g.total_grade >= 80 && g.total_grade < 90).length },
    { range: '75-79%', count: grades.filter(g => g.total_grade >= 75 && g.total_grade < 80).length },
    { range: 'Below 75%', count: grades.filter(g => g.total_grade > 0 && g.total_grade < 75).length }
  ];

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'student_list', label: 'My Students', icon: '👨‍🎓' },
    { id: 'schedule', label: 'My Schedule', icon: '📅' },
    { id: 'attendance', label: 'Attendance', icon: '📝' },
    { id: 'grades', label: 'Grade Management', icon: '📊' },
    { id: 'announcements', label: 'Announcements', icon: '📢' },
    { id: 'messages', label: 'Messages', icon: '💬' },
    { id: 'reports', label: 'Reports', icon: '📈' },
    { id: 'profile', label: 'My Profile', icon: '👤' },
    { id: 'logout', label: 'Log-out', icon: '🚪' }
  ];

  const handleMenuClick = (itemId) => {
    if (itemId === 'logout') {
      onLogout();
    } else {
      setActiveTab(itemId);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const unreadMessagesCount = messages.filter(m => !m.is_read && m.receiver_id === teacherId).length;

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px', fontSize: '20px' }}>Loading teacher dashboard...</div>;
  }

  return (
    <div className="dashboard teacher-dashboard">
      {/* Navbar */}
      <nav className="navbar" style={{ background: '#2c3e50', color: 'white', padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginLeft: '260px' }}>
        <div>
          <h2 style={{ margin: 0 }}>🏫 Teacher Dashboard – Cabacao NHS</h2>
          <div style={{ fontSize: '12px', marginTop: '5px', opacity: 0.8 }}>💭 {currentMessage}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="notification-bell" onClick={() => setShowNotifications(!showNotifications)} style={{ position: 'relative', cursor: 'pointer' }}>
            🔔 {unreadCount > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#e74c3c', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '10px' }}>{unreadCount}</span>}
          </div>
          <div className="message-icon" onClick={() => handleMenuClick('messages')} style={{ position: 'relative', cursor: 'pointer' }}>
            💬 {unreadMessagesCount > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#e74c3c', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '10px' }}>{unreadMessagesCount}</span>}
          </div>
          <span>👋 Welcome, {userData?.full_name?.split(' ')[0] || 'Teacher'}</span>
          <button onClick={onLogout} style={{ background: '#e74c3c', padding: '8px 16px', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer' }}>🚪 Logout</button>
        </div>
        {showNotifications && (
          <div style={{ position: 'absolute', top: '70px', right: '20px', background: 'white', color: '#333', borderRadius: '8px', width: '300px', maxHeight: '400px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 100 }}>
            <h4 style={{ padding: '12px', margin: 0, borderBottom: '1px solid #eee' }}>🔔 Notifications</h4>
            {notifications.map(notif => (
              <div key={notif.id} className={`notification-item ${!notif.is_read ? 'unread' : ''}`} onClick={() => markNotificationRead(notif.id)} style={{ padding: '12px', borderBottom: '1px solid #eee', cursor: 'pointer', background: !notif.is_read ? '#e8f4fd' : 'white' }}>
                <strong>{notif.title}</strong>
                <p style={{ margin: '5px 0', fontSize: '12px' }}>{notif.message}</p>
                <small style={{ color: '#999' }}>{new Date(notif.created_at).toLocaleString()}</small>
              </div>
            ))}
          </div>
        )}
      </nav>

      {/* Sidebar */}
      <div className="sidebar" style={{ width: '260px', background: '#2c3e50', color: 'white', position: 'fixed', height: '100vh', overflowY: 'auto', top: 0, left: 0 }}>
        <div style={{ padding: '20px', textAlign: 'center', borderBottom: '1px solid #34495e' }}>
          <h3 style={{ margin: 0 }}>📋 MENU</h3>
        </div>
        {menuItems.map(item => (
          <button key={item.id} className={activeTab === item.id ? 'active' : ''} onClick={() => handleMenuClick(item.id)} style={{ width: '100%', padding: '14px 20px', textAlign: 'left', background: activeTab === item.id ? '#1abc9c' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px', transition: 'all 0.3s' }}>
            <span style={{ marginRight: '10px' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="content" style={{ marginLeft: '260px', padding: '25px' }}>

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="welcome-header" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '20px', padding: '25px', marginBottom: '25px', color: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                <div>
                  <h1 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>{greeting}, {userData?.full_name?.split(' ')[0] || 'Teacher'}!</h1>
                  <p style={{ margin: '0', fontSize: '16px', opacity: 0.95 }}>Empower learning, monitor progress, and inspire your students today.</p>
                  <div className="motto-card" style={{ marginTop: '15px', padding: '12px 18px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', fontStyle: 'italic' }}>💭 "{teacherMotto}"</div>
                </div>
                <div style={{ fontSize: '60px' }}>🍎</div>
              </div>
            </div>

            <h2>📋 Dashboard Overview</h2>
            <p style={{ marginBottom: '20px', color: '#666' }}>Quick summary of your teaching activities.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '25px' }}>
              <div className="stat-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <span style={{ fontSize: '32px' }}>📌</span>
                <div><div style={{ fontSize: '12px', color: '#666' }}>Advisory Class</div><strong>{teacherAdvisory}</strong></div>
              </div>
              <div className="stat-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <span style={{ fontSize: '32px' }}>📚</span>
                <div><div style={{ fontSize: '12px', color: '#666' }}>Subjects Handled</div><strong>{teacherSubjects.join(', ')}</strong></div>
              </div>
              <div className="stat-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <span style={{ fontSize: '32px' }}>🟢</span>
                <div><div style={{ fontSize: '12px', color: '#666' }}>Teaching Status</div><strong>Active</strong></div>
              </div>
            </div>

            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
              <div className="stat-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}><div style={{ fontSize: '40px' }}>👨‍🎓</div><h3 style={{ margin: '10px 0 5px', fontSize: '28px', color: '#667eea' }}>{stats.totalStudents}</h3><p>Total Students</p></div>
              <div className="stat-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}><div style={{ fontSize: '40px' }}>📊</div><h3 style={{ margin: '10px 0 5px', fontSize: '28px', color: stats.averageGrade >= 80 ? '#28a745' : '#ffc107' }}>{stats.averageGrade}%</h3><p>Average Grade</p></div>
              <div className="stat-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}><div style={{ fontSize: '40px' }}>✅</div><h3 style={{ margin: '10px 0 5px', fontSize: '28px', color: '#28a745' }}>{stats.presentToday}</h3><p>Present Today</p></div>
              <div className="stat-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}><div style={{ fontSize: '40px' }}>⭐</div><h3 style={{ margin: '10px 0 5px', fontSize: '16px', color: '#ffc107' }}>{stats.topPerformer?.substring(0, 15) || 'N/A'}</h3><p>Top Performer</p></div>
            </div>

            <div className="charts-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '30px' }}>
              <div className="chart-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <h3>📊 Grade Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={gradeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#667eea" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <h3>📅 Today's Attendance</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={attendanceChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" label>
                      {attendanceChartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="recent-activity" style={{ background: 'white', borderRadius: '12px', padding: '20px' }}>
              <h3>📢 Recent Announcements</h3>
              {announcements.slice(0, 3).map(ann => (
                <div key={ann.id} style={{ padding: '12px 0', borderBottom: '1px solid #eee' }}>
                  <strong>{ann.title}</strong>
                  <p style={{ margin: '5px 0 0', fontSize: '13px', color: '#666' }}>{ann.content?.substring(0, 100)}...</p>
                  <small style={{ color: '#999' }}>{new Date(ann.created_at).toLocaleString()}</small>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MY STUDENTS TAB */}
        {activeTab === 'student_list' && (
          <div>
            <h2>👨‍🎓 My Advisory Students - {teacherAdvisory}</h2>
            <div className="data-table" style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', padding: '20px' }}>
              <table className="minimal-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: '#667eea', color: 'white' }}><th style={{ padding: '12px', textAlign: 'left' }}>#</th><th>Student ID</th><th>Student Name</th><th>Grade</th><th>Section</th><th>Contact</th><th>Average</th><th>Action</th></tr></thead>
                <tbody>
                  {myStudents.map((student, index) => {
                    const avgGrade = getStudentGrade(student.id)?.total_grade;
                    return (
                      <tr key={student.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px' }}>{index + 1}</td>
                        <td style={{ padding: '12px' }}>{student.student_id_number || 'N/A'}</td>
                        <td style={{ padding: '12px' }}>{student.full_name || 'N/A'}</td>
                        <td style={{ padding: '12px' }}>{student.grade_level || advisoryGrade}</td>
                        <td style={{ padding: '12px' }}>{student.section || advisorySection}</td>
                        <td style={{ padding: '12px' }}>{student.contact_number || 'N/A'}</td>
                        <td className={avgGrade && avgGrade >= 75 ? 'grade-pass' : 'grade-fail'} style={{ padding: '12px' }}>{avgGrade ? avgGrade.toFixed(2) + '%' : 'N/A'}</td>
                        <td style={{ padding: '12px' }}><button className="message-btn" onClick={() => { setSelectedStudent(student); setShowMessageModal(true); }} style={{ background: '#667eea', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer' }}>💬 Message</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SCHEDULE TAB */}
        {activeTab === 'schedule' && (
          <div>
            <h2>📅 My Class Schedule</h2>
            <p style={{ marginBottom: '20px' }}>👨‍🏫 Teacher: {profile?.full_name || userData?.full_name}</p>
            <div className="schedule-week-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginTop: '15px' }}>
              {days.map(day => (
                <div key={day} className="schedule-day" style={{ background: '#f8f9fa', borderRadius: '10px', padding: '12px', minHeight: '400px' }}>
                  <div className="day-header" style={{ fontWeight: 'bold', textAlign: 'center', padding: '8px', background: '#667eea', color: 'white', borderRadius: '8px', marginBottom: '10px' }}>{day}</div>
                  {timeSlots.map((slot, idx) => {
                    const classAtTime = getClassAtTime(day, slot.start, slot.end);
                    if (slot.isBreak) {
                      return <div key={idx} className="break-slot" style={{ background: '#fff3cd', borderRadius: '6px', padding: '8px', marginBottom: '6px', borderLeft: '4px solid #ffc107', textAlign: 'center', fontWeight: 'bold' }}>{slot.label}<br /><small>{slot.start} - {slot.end}</small></div>;
                    }
                    if (classAtTime) {
                      return (
                        <div key={idx} className="class-slot" style={{ background: 'white', borderRadius: '6px', padding: '8px', marginBottom: '6px', borderLeft: '4px solid #667eea', fontSize: '12px' }}>
                          <div>⏰ {slot.start} - {slot.end}</div>
                          <div>📖 <strong>{classAtTime.subject}</strong></div>
                          <div>📍 {classAtTime.room_name || 'Room TBA'}</div>
                        </div>
                      );
                    }
                    return (
                      <div key={idx} className="class-slot" style={{ background: '#f5f5f5', borderRadius: '6px', padding: '8px', marginBottom: '6px', borderLeft: '4px solid #ccc', fontSize: '12px', color: '#999' }}>
                        <div>{slot.start} - {slot.end}</div>
                        <div>📭 No class</div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ATTENDANCE TAB */}
        {activeTab === 'attendance' && (
          <div>
            <h2>📝 Student Attendance</h2>
            <div style={{ marginBottom: '20px' }}><label>📅 Date: </label><input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }} /></div>
            <div className="data-table" style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', padding: '20px' }}>
              <table className="minimal-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: '#667eea', color: 'white' }}><th style={{ padding: '12px', textAlign: 'left' }}>Student Name</th><th>Status</th><th>Reason</th><th>Action</th></tr></thead>
                <tbody>
                  {myStudents.map(student => {
                    const todayAttendance = getTodayAttendance(student.id);
                    const currentStatus = todayAttendance?.status || 'Not Recorded';
                    const isOpen = openAttendanceRow === student.id;
                    return (
                      <React.Fragment key={student.id}>
                        <tr style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '12px' }}>{student.full_name}</td>
                          <td style={{ padding: '12px' }}>{currentStatus}</td>
                          <td style={{ padding: '12px' }}>{todayAttendance?.status === 'Excused' && todayAttendance?.remarks ? todayAttendance.remarks : '—'}</td>
                          <td style={{ padding: '12px' }}><button className="att-status-btn" onClick={() => setOpenAttendanceRow(isOpen ? null : student.id)} style={{ background: '#667eea', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>{isOpen ? 'Close' : 'Record'}</button></td>
                        </tr>
                        {isOpen && (
                          <tr><td colSpan="4" style={{ padding: '12px' }}>
                            <div className="attendance-buttons" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                              <button className="att-status-btn present" onClick={() => handleRecordAttendance(student.id, 'Present')} style={{ background: '#28a745', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>✅ Present</button>
                              <button className="att-status-btn absent" onClick={() => handleRecordAttendance(student.id, 'Absent')} style={{ background: '#dc3545', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>❌ Absent</button>
                              <button className="att-status-btn late" onClick={() => handleRecordAttendance(student.id, 'Late')} style={{ background: '#ffc107', color: '#333', padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>⏰ Late</button>
                              <button className="att-status-btn excused" onClick={() => { setSelectedStudentId(student.id); setShowExcuseModal(true); setOpenAttendanceRow(null); }} style={{ background: '#17a2b8', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>📝 Excused</button>
                            </div>
                          </td></tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {showExcuseModal && (
              <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div className="modal" style={{ background: 'white', borderRadius: '12px', padding: '25px', width: '500px', maxWidth: '90%' }}>
                  <h3>📝 Reason for Excuse</h3>
                  <textarea value={excuseReason} onChange={(e) => setExcuseReason(e.target.value)} rows="4" style={{ width: '100%', marginBottom: '15px', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }} placeholder="Enter reason..." />
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button onClick={() => setShowExcuseModal(false)} style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={() => handleRecordAttendance(selectedStudentId, 'Excused', excuseReason)} style={{ background: '#17a2b8', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Submit</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* GRADE MANAGEMENT TAB */}
        {activeTab === 'grades' && (
          <div>
            <h2>📊 Grade Management - {teacherAdvisory}</h2>
            <div className="data-table" style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', padding: '20px' }}>
              <table className="minimal-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: '#667eea', color: 'white' }}><th style={{ padding: '12px', textAlign: 'left' }}>Student</th><th>Quiz1</th><th>Quiz2</th><th>Quiz3</th><th>Assignment</th><th>Project</th><th>Exam</th><th>Average</th><th>Remarks</th><th>Action</th></tr></thead>
                <tbody>
                  {myStudents.map(student => {
                    const existingGrade = grades.find(g => g.student_id === student.id);
                    const avg = existingGrade?.total_grade || 0;
                    return (
                      <tr key={student.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px' }}>{student.full_name}</td>
                        <td style={{ padding: '12px' }}><input type="number" id={`quiz1_${student.id}`} className="grade-input" defaultValue={existingGrade?.quiz_1 || 80} step="any" style={{ width: '70px', padding: '5px', border: '1px solid #ddd', borderRadius: '4px' }} /></td>
                        <td style={{ padding: '12px' }}><input type="number" id={`quiz2_${student.id}`} className="grade-input" defaultValue={existingGrade?.quiz_2 || 85} step="any" style={{ width: '70px', padding: '5px', border: '1px solid #ddd', borderRadius: '4px' }} /></td>
                        <td style={{ padding: '12px' }}><input type="number" id={`quiz3_${student.id}`} className="grade-input" defaultValue={existingGrade?.quiz_3 || 82} step="any" style={{ width: '70px', padding: '5px', border: '1px solid #ddd', borderRadius: '4px' }} /></td>
                        <td style={{ padding: '12px' }}><input type="number" id={`assignment_${student.id}`} className="grade-input" defaultValue={existingGrade?.assignment || 88} step="any" style={{ width: '70px', padding: '5px', border: '1px solid #ddd', borderRadius: '4px' }} /></td>
                        <td style={{ padding: '12px' }}><input type="number" id={`project_${student.id}`} className="grade-input" defaultValue={existingGrade?.project || 90} step="any" style={{ width: '70px', padding: '5px', border: '1px solid #ddd', borderRadius: '4px' }} /></td>
                        <td style={{ padding: '12px' }}><input type="number" id={`exam_${student.id}`} className="grade-input" defaultValue={existingGrade?.exam || 85} step="any" style={{ width: '70px', padding: '5px', border: '1px solid #ddd', borderRadius: '4px' }} /></td>
                        <td className={avg >= 75 ? 'grade-pass' : 'grade-fail'} style={{ padding: '12px' }}>{avg.toFixed(2)}%</td>
                        <td style={{ padding: '12px' }}>{avg >= 75 ? '✅ Passed' : avg > 0 ? '❌ Failed' : '⏳ Pending'}</td>
                        <td style={{ padding: '12px' }}><button className="save-grade-btn" onClick={() => handleSaveGrade(student.id)} style={{ background: '#667eea', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer' }}>💾 Save</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ANNOUNCEMENTS TAB */}
        {activeTab === 'announcements' && (
          <div>
            <h2>📢 Announcements</h2>
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
              <h3>📝 Create New Announcement</h3>
              <form onSubmit={handlePostAnnouncement}>
                <input type="text" name="title" placeholder="Announcement Title" required style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '6px' }} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} />
                <textarea name="content" placeholder="Write your announcement here..." rows="4" required style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '6px' }} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })} />
                <select name="target_audience" defaultValue="students" style={{ padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '6px' }} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, target_audience: e.target.value })}>
                  <option value="students">Students Only</option>
                  <option value="all">All (Students & Teachers)</option>
                </select>
                <button type="submit" style={{ background: '#667eea', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>📢 Post Announcement</button>
              </form>
            </div>
            {announcements.map(ann => (
              <div key={ann.id} style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '15px' }}>
                <h3>{ann.title}</h3>
                <p>{ann.content}</p>
                <small>Posted by: {ann.author_name} | {new Date(ann.created_at).toLocaleString()}</small>
                <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                  <textarea placeholder="Write a comment..." id={`comment_${ann.id}`} rows="2" style={{ width: '100%', padding: '8px', marginBottom: '8px', border: '1px solid #ddd', borderRadius: '6px' }} />
                  <button onClick={() => handleAddComment(ann.id)} style={{ background: '#17a2b8', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>💬 Post Comment</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === 'messages' && (
          <div>
            <h2>💬 Messages</h2>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px' }}>
                <p>No messages yet. Click "Message" button on a student to send a message.</p>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} style={{ background: 'white', padding: '15px', borderRadius: '12px', marginBottom: '10px', borderLeft: `4px solid ${!msg.is_read && msg.receiver_id === teacherId ? '#667eea' : '#ccc'}` }}>
                  <strong>{msg.sender_name}</strong> → {msg.receiver_name}
                  <div><small>📌 {msg.subject}</small></div>
                  <p>{msg.message}</p>
                  <small>{new Date(msg.created_at).toLocaleString()}</small>
                </div>
              ))
            )}
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === 'reports' && (
          <div>
            <h2>📈 Class Performance Reports</h2>
            <p style={{ marginBottom: '5px', fontSize: '18px', color: '#333' }}>{teacherAdvisory}</p>
            <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>School Year 2025-2026 • 1st Semester</p>

            {/* Teacher Motto/Reminder Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '16px',
              padding: '20px 25px',
              marginBottom: '25px',
              color: 'white',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '40px' }}>💭</span>
                <div>
<h3 style={{ margin: '10px 0 5px', fontSize: '32px' }}>
  {
    (
      (
        stats.presentToday /
        (
          stats.presentToday +
          stats.absentToday +
          stats.lateToday +
          (stats.excusedToday || 0)
        )
      ) * 100
    ).toFixed(1)
  || 0
  }%
</h3>         
<p style={{ margin: 0, fontSize: '14px', opacity: 0.95, fontStyle: 'italic' }}>
  "{teacherMotto}"
</p>                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
              <div className="stat-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '25px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', color: 'white' }}>
                <div style={{ fontSize: '40px' }}>🏆</div>
                <h3 style={{ margin: '10px 0 5px', fontSize: '32px' }}>{stats.averageGrade}%</h3>
                <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Average Grade</p>
                <span style={{ display: 'inline-block', marginTop: '8px', padding: '4px 12px', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '12px' }}>✨ Good performance</span>
              </div>
              <div className="stat-card" style={{ background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)', padding: '25px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', color: 'white' }}>
                <div style={{ fontSize: '40px' }}>✅</div>
                <h3 style={{ margin: '10px 0 5px', fontSize: '32px' }}>{grades.filter(g => g.total_grade >= 75).length}/{stats.totalStudents}</h3>
                <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Passing Rate</p>
                <span style={{ display: 'inline-block', marginTop: '8px', padding: '4px 12px', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '12px' }}>🎉 {Math.round((grades.filter(g => g.total_grade >= 75).length / stats.totalStudents) * 100)}% Passing Rate</span>
              </div>
              <div className="stat-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '25px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', color: 'white' }}>
    <div style={{ fontSize: '40px' }}>🏆</div>

<h3 style={{ margin: '10px 0 5px', fontSize: '32px' }}>
  {(
    (
      stats.presentToday /
      (
        stats.presentToday +
        stats.absentToday +
        stats.lateToday +
        (stats.excusedToday || 0)
      )
    ) * 100
  ).toFixed(1) || 0}%
</h3>

<p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
  Attendance Rate
</p>
                <span style={{ display: 'inline-block', marginTop: '8px', padding: '4px 12px', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '12px' }}>📌 Needs improvement</span>
              </div>
            </div>

            {/* Charts Row 1 */}
            <div className="charts-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '30px' }}>
              {/* Grade Distribution Chart */}
              <div className="chart-card" style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #ecf0f1', paddingBottom: '10px' }}>
                  <span style={{ fontSize: '24px' }}>📊</span>
                  <h3 style={{ margin: 0 }}>Grade Distribution</h3>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={gradeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#667eea" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="legend" style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '15px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '12px', height: '12px', background: '#27ae60', borderRadius: '3px' }}></div><span style={{ fontSize: '12px' }}>Excellent (90-100%)</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '12px', height: '12px', background: '#3498db', borderRadius: '3px' }}></div><span style={{ fontSize: '12px' }}>Good (80-89%)</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '12px', height: '12px', background: '#f39c12', borderRadius: '3px' }}></div><span style={{ fontSize: '12px' }}>Satisfactory (75-79%)</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '12px', height: '12px', background: '#e74c3c', borderRadius: '3px' }}></div><span style={{ fontSize: '12px' }}>Needs Improvement</span></div>
                </div>
              </div>

              {/* Today's Attendance Chart */}
              <div className="chart-card" style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #ecf0f1', paddingBottom: '10px' }}>
                  <span style={{ fontSize: '24px' }}>📅</span>
                  <h3 style={{ margin: 0 }}>Today's Attendance</h3>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={attendanceChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" label>
                      {attendanceChartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Insights, Top Students, Recent Activity, Upcoming Events Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '30px' }}>

              {/* Quick Insights */}
              <div className="chart-card" style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #ecf0f1', paddingBottom: '10px' }}>
                  <span style={{ fontSize: '24px' }}>📌</span>
                  <h3 style={{ margin: 0 }}>Quick Insights</h3>
                </div>
                <div style={{ background: '#e8f4fd', padding: '15px', borderRadius: '12px', marginBottom: '15px' }}>
                  <strong style={{ color: '#27ae60' }}>📊 Performance Summary:</strong>
                  <ul style={{ marginTop: '8px', marginLeft: '20px', color: '#555', fontSize: '13px' }}>
                    <li>Average Grade: <strong>{stats.averageGrade}%</strong> - {stats.averageGrade >= 85 ? 'Above Average' : 'Needs Improvement'}</li>
                    <li>Passing Rate: <strong>100%</strong> - All {stats.totalStudents} students passed</li>
                    <li>Top Grade: <strong>{Math.max(...grades.map(g => g.total_grade).filter(g => g > 0), 0)}%</strong></li>
                    <li>Lowest Grade: <strong>{Math.min(...grades.map(g => g.total_grade).filter(g => g > 0), 0)}%</strong></li>
                  </ul>
                </div>
                <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '12px' }}>
                  <strong style={{ color: '#e74c3c' }}>⚠️ Areas for Improvement:</strong>
                  <ul style={{ marginTop: '8px', marginLeft: '20px', color: '#555', fontSize: '13px' }}>
<li>
Attendance rate at {
(
(
stats.presentToday /
(
stats.presentToday +
stats.absentToday +
stats.lateToday +
(stats.excusedToday || 0)
)
) * 100
).toFixed(1) || 0
}% - needs monitoring
</li>                    <li>{stats.lateToday} students consistently late</li>
                    <li>Mathematics performance can be improved (86.2%)</li>
                  </ul>
                </div>
              </div>

              {/* Top Students */}
              <div className="chart-card" style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #ecf0f1', paddingBottom: '10px' }}>
                  <span style={{ fontSize: '24px' }}>🏅</span>
                  <h3 style={{ margin: 0 }}>Top Performing Students</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#667eea', color: 'white' }}>
                        <th style={{ padding: '10px', textAlign: 'left', borderRadius: '10px 0 0 0' }}>Rank</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Student Name</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>Average</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...grades]
                        .sort((a, b) => (b.total_grade || 0) - (a.total_grade || 0))
                        .slice(0, 5)
                        .map((student, idx) => (
                          <tr key={student.student_id} style={{ borderBottom: '1px solid #ecf0f1' }}>
                            <td style={{ padding: '10px' }}>
                              {idx === 0 && '🏅 1st'}
                              {idx === 1 && '🥈 2nd'}
                              {idx === 2 && '🥉 3rd'}
                              {idx > 2 && `${idx + 1}th`}
                            </td>
                            <td style={{ padding: '10px', fontWeight: idx < 3 ? 'bold' : 'normal' }}>{student.student_name?.substring(0, 25) || 'N/A'}</td>
                            <td style={{ padding: '10px', textAlign: 'center', color: idx === 0 ? '#27ae60' : '#333', fontWeight: idx === 0 ? 'bold' : 'normal' }}>{student.total_grade?.toFixed(2) || 0}%</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '30px' }}>

              {/* Recent Activity */}
              <div className="chart-card" style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #ecf0f1', paddingBottom: '10px' }}>
                  <span style={{ fontSize: '24px' }}>🕒</span>
                  <h3 style={{ margin: 0 }}>Recent Activity</h3>
                </div>
                <div>
                  {announcements.slice(0, 3).map(ann => (
                    <div key={ann.id} style={{ padding: '12px 0', borderBottom: '1px solid #eee' }}>
                      <div style={{ fontWeight: 'bold' }}>📢 {ann.title}</div>
                      <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#666' }}>{ann.content?.substring(0, 80)}...</p>
                      <small style={{ color: '#999' }}>{new Date(ann.created_at).toLocaleString()}</small>
                    </div>
                  ))}
                  {announcements.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>No recent announcements</p>
                  )}
                </div>
              </div>

              {/* Upcoming Events / Schedule */}
              <div className="chart-card" style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #ecf0f1', paddingBottom: '10px' }}>
                  <span style={{ fontSize: '24px' }}>📅</span>
                  <h3 style={{ margin: 0 }}>Upcoming Events</h3>
                </div>
                <div>
                  {mySchedule.slice(0, 5).map((sched, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                      <div style={{
                        background: '#667eea',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        textAlign: 'center',
                        minWidth: '60px'
                      }}>
                        <div style={{ fontSize: '12px' }}>{sched.day_of_week?.substring(0, 3)}</div>
                        <div style={{ fontSize: '10px', opacity: 0.8 }}>{sched.start_time?.substring(0, 5)}</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{sched.subject}</div>
                        <div style={{ fontSize: '11px', color: '#666' }}>{sched.room_name || 'Room TBA'} • {sched.section}</div>
                      </div>
                    </div>
                  ))}
                  {mySchedule.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>No upcoming classes</p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer with Date */}
            <div style={{ textAlign: 'center', marginTop: '20px', padding: '15px', color: '#999', fontSize: '12px', borderTop: '1px solid #ecf0f1' }}>
              <p>📊 Report generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()} • Cabacao National High School</p>
              <p>💭 "{teacherMotto}"</p>
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div>
            <h2>👤 My Profile</h2>
            <div className="profile-container" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '25px' }}>

              {/* Profile Picture Section */}
              <div className="profile-picture-section" style={{ background: 'white', borderRadius: '16px', padding: '25px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', height: 'fit-content' }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <div style={{
                    width: '180px',
                    height: '180px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                    overflow: 'hidden'
                  }}>
                    {profilePicturePreview ? (
                      <img src={profilePicturePreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '80px' }}>👩‍🏫</span>
                    )}
                  </div>
                  <label style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    cursor: 'pointer',
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    📷
                    <input type="file" accept="image/*" onChange={handleProfilePictureChange} style={{ display: 'none' }} />
                  </label>
                </div>
                <h3 style={{ margin: '15px 0 5px' }}>{editFormData.full_name}</h3>
                <p style={{ color: '#666', marginBottom: '10px' }}>📧 {editFormData.email}</p>
                <div style={{ background: '#e8f4fd', padding: '8px', borderRadius: '20px', display: 'inline-block' }}>
                  <span style={{ fontSize: '12px' }}>🟢 Active Teacher</span>
                </div>
              </div>

              {/* Profile Details Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Personal Information */}
                <div className="profile-section" style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                  <h4 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📋</span> Personal Information
                  </h4>
                  {!isEditing ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                      <div><strong>Full Name:</strong></div><div>{editFormData.full_name}</div>
                      <div><strong>Email:</strong></div><div>{editFormData.email}</div>
                      <div><strong>Contact Number:</strong></div><div>{editFormData.contact_number}</div>
                      <div><strong>Address:</strong></div><div>{editFormData.address}</div>
                      <div><strong>Birth Date:</strong></div><div>{editFormData.birth_date}</div>
                      <div><strong>Gender:</strong></div><div>{editFormData.gender}</div>
                    </div>
                  ) : (
                    <form onSubmit={handleEditSubmit}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                        <div><strong>Full Name:</strong></div>
                        <div><input type="text" value={editFormData.full_name} onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }} /></div>
                        <div><strong>Email:</strong></div>
                        <div><input type="email" value={editFormData.email} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }} /></div>
                        <div><strong>Contact Number:</strong></div>
                        <div><input type="text" value={editFormData.contact_number} onChange={(e) => setEditFormData({ ...editFormData, contact_number: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }} /></div>
                        <div><strong>Address:</strong></div>
                        <div><input type="text" value={editFormData.address} onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }} /></div>
                        <div><strong>Birth Date:</strong></div>
                        <div><input type="date" value={editFormData.birth_date} onChange={(e) => setEditFormData({ ...editFormData, birth_date: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }} /></div>
                        <div><strong>Gender:</strong></div>
                        <div>
                          <select value={editFormData.gender} onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}>
                            <option value="Female">Female</option>
                            <option value="Male">Male</option>
                          </select>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                        <button type="submit" style={{ background: '#28a745', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>💾 Save Changes</button>
                        <button type="button" onClick={() => setIsEditing(false)} style={{ background: '#6c757d', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Professional Background */}
                <div className="profile-section" style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                  <h4 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🏫</span> Professional Background
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    <div><strong>Employee ID:</strong></div><div>TCH-2019-004</div>
                    <div><strong>Position:</strong></div><div>Public School Teacher I</div>
                    <div><strong>Department:</strong></div><div>Junior High School Department</div>
                    <div><strong>Date Hired:</strong></div><div>2019-06-03</div>
                    <div><strong>Years in Service:</strong></div><div>6 years</div>
                    <div><strong>Employment Status:</strong></div><div>Permanent</div>
                    <div><strong>Advisory Class:</strong></div><div>{teacherAdvisory}</div>
                    <div><strong>Subjects Handled:</strong></div><div>{teacherSubjects.join(', ')}</div>
                    <div><strong>School Assigned:</strong></div><div>Cabacao National High School</div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="profile-section" style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                  <h4 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '10px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📅</span> Account Information
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    <div><strong>Username:</strong></div><div>maria.santos</div>
                    <div><strong>Role:</strong></div><div>Teacher / Class Adviser</div>
                    <div><strong>Account Status:</strong></div><div><span style={{ color: '#27ae60' }}>🟢 Active</span></div>
                    <div><strong>Last Login:</strong></div><div>{new Date().toLocaleString()}</div>
                  </div>
                  <div style={{ marginTop: '15px', padding: '12px', background: '#e8f4fd', borderRadius: '12px', fontStyle: 'italic' }}>
                    <strong>💫 Motto:</strong> "{teacherMotto}"
                  </div>
                </div>

                {/* Edit Profile Button */}
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} style={{ background: '#667eea', color: 'white', padding: '12px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
                    ✏️ Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message Modal */}
      {showMessageModal && selectedStudent && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal" style={{ background: 'white', borderRadius: '12px', padding: '25px', width: '500px', maxWidth: '90%' }}>
            <h3>💬 Send Message to {selectedStudent.full_name}</h3>
            <form onSubmit={handleSendMessage}>
              <input type="text" placeholder="Subject" value={newMessage.subject} onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })} required style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
              <textarea placeholder="Message" value={newMessage.message} onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })} rows="5" required style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '6px' }} />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowMessageModal(false)} style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ background: '#667eea', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>📤 Send</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherDashboard;