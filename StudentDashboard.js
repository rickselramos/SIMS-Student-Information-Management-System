import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

function StudentDashboard({ onLogout, userData }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [myGrades, setMyGrades] = useState([]);
  const [mySchedule, setMySchedule] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [profile, setProfile] = useState(userData);
  const [loading, setLoading] = useState(true);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [newMessage, setNewMessage] = useState({ subject: '', message: '' });
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [selectedGradingPeriod, setSelectedGradingPeriod] = useState('1st Quarter');
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState({});
  const printRef = useRef();

  const studentId = userData?.user_id || userData?.id || 1;
  const studentName = userData?.full_name || 'Student';
  const studentGrade = userData?.advisory_grade || '7';
  const studentSection = userData?.advisory_section || 'Sampaguita';

  const gradingPeriods = [
    { id: '1st Quarter', label: '1st Quarter', period: 'Q1' },
    { id: '2nd Quarter', label: '2nd Quarter', period: 'Q2' },
    { id: '3rd Quarter', label: '3rd Quarter', period: 'Q3' },
    { id: '4th Quarter', label: '4th Quarter', period: 'Q4' },
    { id: 'Final', label: 'Final Grade', period: 'Final' }
  ];

  const gradesByQuarter = {
    '1st Quarter': [
      { subject: "Mathematics 7", teacher: "Maria Santos", grade: 85.5, remarks: "✅ Passed" },
      { subject: "Science 7", teacher: "Maria Santos", grade: 86.2, remarks: "✅ Passed" },
      { subject: "English 7", teacher: "Juan Reyes", grade: 84.0, remarks: "✅ Passed" },
      { subject: "Filipino 7", teacher: "Juan Reyes", grade: 83.5, remarks: "✅ Passed" },
      { subject: "Araling Panlipunan 7", teacher: "Ana Cruz", grade: 87.0, remarks: "✅ Passed" },
      { subject: "MAPEH 7", teacher: "Pedro Gomez", grade: 89.0, remarks: "✅ Passed" },
      { subject: "TLE 7", teacher: "Rosa Fernandez", grade: 84.0, remarks: "✅ Passed" },
      { subject: "Values Education 7", teacher: "Carmen Flores", grade: 91.0, remarks: "🏅 Excellent" }
    ],
    '2nd Quarter': [
      { subject: "Mathematics 7", teacher: "Maria Santos", grade: 86.0, remarks: "✅ Passed" },
      { subject: "Science 7", teacher: "Maria Santos", grade: 87.5, remarks: "✅ Passed" },
      { subject: "English 7", teacher: "Juan Reyes", grade: 85.0, remarks: "✅ Passed" },
      { subject: "Filipino 7", teacher: "Juan Reyes", grade: 84.8, remarks: "✅ Passed" },
      { subject: "Araling Panlipunan 7", teacher: "Ana Cruz", grade: 88.0, remarks: "✅ Passed" },
      { subject: "MAPEH 7", teacher: "Pedro Gomez", grade: 90.0, remarks: "🏅 Excellent" },
      { subject: "TLE 7", teacher: "Rosa Fernandez", grade: 85.0, remarks: "✅ Passed" },
      { subject: "Values Education 7", teacher: "Carmen Flores", grade: 92.0, remarks: "🏅 Excellent" }
    ],
    '3rd Quarter': [
      { subject: "Mathematics 7", teacher: "Maria Santos", grade: 86.5, remarks: "✅ Passed" },
      { subject: "Science 7", teacher: "Maria Santos", grade: 87.8, remarks: "✅ Passed" },
      { subject: "English 7", teacher: "Juan Reyes", grade: 85.8, remarks: "✅ Passed" },
      { subject: "Filipino 7", teacher: "Juan Reyes", grade: 85.0, remarks: "✅ Passed" },
      { subject: "Araling Panlipunan 7", teacher: "Ana Cruz", grade: 88.2, remarks: "✅ Passed" },
      { subject: "MAPEH 7", teacher: "Pedro Gomez", grade: 90.5, remarks: "🏅 Excellent" },
      { subject: "TLE 7", teacher: "Rosa Fernandez", grade: 85.5, remarks: "✅ Passed" },
      { subject: "Values Education 7", teacher: "Carmen Flores", grade: 92.5, remarks: "🏅 Excellent" }
    ],
    '4th Quarter': [
      { subject: "Mathematics 7", teacher: "Maria Santos", grade: 87.0, remarks: "✅ Passed" },
      { subject: "Science 7", teacher: "Maria Santos", grade: 88.0, remarks: "✅ Passed" },
      { subject: "English 7", teacher: "Juan Reyes", grade: 86.0, remarks: "✅ Passed" },
      { subject: "Filipino 7", teacher: "Juan Reyes", grade: 85.5, remarks: "✅ Passed" },
      { subject: "Araling Panlipunan 7", teacher: "Ana Cruz", grade: 88.5, remarks: "✅ Passed" },
      { subject: "MAPEH 7", teacher: "Pedro Gomez", grade: 91.0, remarks: "🏅 Excellent" },
      { subject: "TLE 7", teacher: "Rosa Fernandez", grade: 86.0, remarks: "✅ Passed" },
      { subject: "Values Education 7", teacher: "Carmen Flores", grade: 93.0, remarks: "🏅 Excellent" }
    ],
    'Final': [
      { subject: "Mathematics 7", teacher: "Maria Santos", grade: 86.2, remarks: "✅ Passed" },
      { subject: "Science 7", teacher: "Maria Santos", grade: 87.3, remarks: "✅ Passed" },
      { subject: "English 7", teacher: "Juan Reyes", grade: 85.5, remarks: "✅ Passed" },
      { subject: "Filipino 7", teacher: "Juan Reyes", grade: 84.8, remarks: "✅ Passed" },
      { subject: "Araling Panlipunan 7", teacher: "Ana Cruz", grade: 88.0, remarks: "✅ Passed" },
      { subject: "MAPEH 7", teacher: "Pedro Gomez", grade: 90.2, remarks: "🏅 Excellent" },
      { subject: "TLE 7", teacher: "Rosa Fernandez", grade: 85.0, remarks: "✅ Passed" },
      { subject: "Values Education 7", teacher: "Carmen Flores", grade: 92.0, remarks: "🏅 Excellent" }
    ]
  };

  const currentGrades = gradesByQuarter[selectedGradingPeriod] || gradesByQuarter['1st Quarter'];
  const averageGrade = (currentGrades.reduce((sum, g) => sum + g.grade, 0) / currentGrades.length).toFixed(1);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('🌞 Good Morning');
    else if (hour < 18) setGreeting('🌤️ Good Afternoon');
    else setGreeting('🌙 Good Evening');
  }, []);

  const [stats, setStats] = useState({
    averageGrade: 0,
    attendanceRate: 0,
    totalSubjects: 0,
    progress: 0,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0,
    totalDays: 0
  });

  useEffect(() => {
    fetchAllData();
    fetchMessages();
    fetchNotifications();
    fetchComments();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [selectedGradingPeriod]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch schedule
let scheduleData = [];
try {
  const scheduleRes = await api.get(`/student-schedule.php?grade_level=${studentGrade}&section=${studentSection}`);
  scheduleData = Array.isArray(scheduleRes.data) ? scheduleRes.data : [];
} catch (err) {}

if (scheduleData.length === 0) {
  scheduleData = [
    // MONDAY
    { id: 1, day_of_week: "Monday", subject: "Mathematics 7", start_time: "07:30", end_time: "08:30", teacher: "Maria Santos", room: "Room 101" },
    { id: 2, day_of_week: "Monday", subject: "English 7", start_time: "08:30", end_time: "09:30", teacher: "Juan Reyes", room: "Room 102" },
    { id: 3, day_of_week: "Monday", subject: "Recess", start_time: "09:30", end_time: "09:45", isBreak: true, label: "🥪 Recess Break" },
    { id: 4, day_of_week: "Monday", subject: "Science 7", start_time: "09:45", end_time: "10:45", teacher: "Maria Santos", room: "Science Lab" },
    { id: 5, day_of_week: "Monday", subject: "Filipino 7", start_time: "10:45", end_time: "11:45", teacher: "Juan Reyes", room: "Room 102" },
    { id: 6, day_of_week: "Monday", subject: "Lunch", start_time: "11:45", end_time: "12:45", isBreak: true, label: "🍱 Lunch Break" },
    { id: 7, day_of_week: "Monday", subject: "Araling Panlipunan 7", start_time: "12:45", end_time: "13:45", teacher: "Ana Cruz", room: "Room 103" },
    { id: 8, day_of_week: "Monday", subject: "MAPEH 7", start_time: "13:45", end_time: "14:45", teacher: "Pedro Gomez", room: "Room 104" },
    { id: 9, day_of_week: "Monday", subject: "TLE 7", start_time: "14:45", end_time: "15:45", teacher: "Rosa Fernandez", room: "Room 201" },
    
    // TUESDAY
    { id: 10, day_of_week: "Tuesday", subject: "Mathematics 7", start_time: "07:30", end_time: "08:30", teacher: "Maria Santos", room: "Room 101" },
    { id: 11, day_of_week: "Tuesday", subject: "English 7", start_time: "08:30", end_time: "09:30", teacher: "Juan Reyes", room: "Room 102" },
    { id: 12, day_of_week: "Tuesday", subject: "Recess", start_time: "09:30", end_time: "09:45", isBreak: true, label: "🥪 Recess Break" },
    { id: 13, day_of_week: "Tuesday", subject: "Science 7", start_time: "09:45", end_time: "10:45", teacher: "Maria Santos", room: "Science Lab" },
    { id: 14, day_of_week: "Tuesday", subject: "Filipino 7", start_time: "10:45", end_time: "11:45", teacher: "Juan Reyes", room: "Room 102" },
    { id: 15, day_of_week: "Tuesday", subject: "Lunch", start_time: "11:45", end_time: "12:45", isBreak: true, label: "🍱 Lunch Break" },
    { id: 16, day_of_week: "Tuesday", subject: "Values Education 7", start_time: "12:45", end_time: "13:45", teacher: "Carmen Flores", room: "Room 301" },
    { id: 17, day_of_week: "Tuesday", subject: "MAPEH 7", start_time: "13:45", end_time: "14:45", teacher: "Pedro Gomez", room: "Room 104" },
    { id: 18, day_of_week: "Tuesday", subject: "TLE 7", start_time: "14:45", end_time: "15:45", teacher: "Rosa Fernandez", room: "Room 201" },
    
    // WEDNESDAY
    { id: 19, day_of_week: "Wednesday", subject: "Mathematics 7", start_time: "07:30", end_time: "08:30", teacher: "Maria Santos", room: "Room 101" },
    { id: 20, day_of_week: "Wednesday", subject: "Araling Panlipunan 7", start_time: "08:30", end_time: "09:30", teacher: "Ana Cruz", room: "Room 103" },
    { id: 21, day_of_week: "Wednesday", subject: "Recess", start_time: "09:30", end_time: "09:45", isBreak: true, label: "🥪 Recess Break" },
    { id: 22, day_of_week: "Wednesday", subject: "Science 7", start_time: "09:45", end_time: "10:45", teacher: "Maria Santos", room: "Science Lab" },
    { id: 23, day_of_week: "Wednesday", subject: "English 7", start_time: "10:45", end_time: "11:45", teacher: "Juan Reyes", room: "Room 102" },
    { id: 24, day_of_week: "Wednesday", subject: "Lunch", start_time: "11:45", end_time: "12:45", isBreak: true, label: "🍱 Lunch Break" },
    { id: 25, day_of_week: "Wednesday", subject: "Filipino 7", start_time: "12:45", end_time: "13:45", teacher: "Juan Reyes", room: "Room 102" },
    { id: 26, day_of_week: "Wednesday", subject: "Values Education 7", start_time: "13:45", end_time: "14:45", teacher: "Carmen Flores", room: "Room 301" },
    { id: 27, day_of_week: "Wednesday", subject: "MAPEH 7", start_time: "14:45", end_time: "15:45", teacher: "Pedro Gomez", room: "Room 104" },
    
    // THURSDAY
    { id: 28, day_of_week: "Thursday", subject: "Mathematics 7", start_time: "07:30", end_time: "08:30", teacher: "Maria Santos", room: "Room 101" },
    { id: 29, day_of_week: "Thursday", subject: "Science 7", start_time: "08:30", end_time: "09:30", teacher: "Maria Santos", room: "Science Lab" },
    { id: 30, day_of_week: "Thursday", subject: "Recess", start_time: "09:30", end_time: "09:45", isBreak: true, label: "🥪 Recess Break" },
    { id: 31, day_of_week: "Thursday", subject: "English 7", start_time: "09:45", end_time: "10:45", teacher: "Juan Reyes", room: "Room 102" },
    { id: 32, day_of_week: "Thursday", subject: "Filipino 7", start_time: "10:45", end_time: "11:45", teacher: "Juan Reyes", room: "Room 102" },
    { id: 33, day_of_week: "Thursday", subject: "Lunch", start_time: "11:45", end_time: "12:45", isBreak: true, label: "🍱 Lunch Break" },
    { id: 34, day_of_week: "Thursday", subject: "Araling Panlipunan 7", start_time: "12:45", end_time: "13:45", teacher: "Ana Cruz", room: "Room 103" },
    { id: 35, day_of_week: "Thursday", subject: "TLE 7", start_time: "13:45", end_time: "14:45", teacher: "Rosa Fernandez", room: "Room 201" },
    { id: 36, day_of_week: "Thursday", subject: "Values Education 7", start_time: "14:45", end_time: "15:45", teacher: "Carmen Flores", room: "Room 301" },
    
    // FRIDAY
    { id: 37, day_of_week: "Friday", subject: "Mathematics 7", start_time: "07:30", end_time: "08:30", teacher: "Maria Santos", room: "Room 101" },
    { id: 38, day_of_week: "Friday", subject: "Science 7", start_time: "08:30", end_time: "09:30", teacher: "Maria Santos", room: "Science Lab" },
    { id: 39, day_of_week: "Friday", subject: "Recess", start_time: "09:30", end_time: "09:45", isBreak: true, label: "🥪 Recess Break" },
    { id: 40, day_of_week: "Friday", subject: "Araling Panlipunan 7", start_time: "09:45", end_time: "10:45", teacher: "Ana Cruz", room: "Room 103" },
    { id: 41, day_of_week: "Friday", subject: "MAPEH 7", start_time: "10:45", end_time: "11:45", teacher: "Pedro Gomez", room: "Room 104" },
    { id: 42, day_of_week: "Friday", subject: "Lunch", start_time: "11:45", end_time: "12:45", isBreak: true, label: "🍱 Lunch Break" },
    { id: 43, day_of_week: "Friday", subject: "TLE 7", start_time: "12:45", end_time: "13:45", teacher: "Rosa Fernandez", room: "Room 201" },
    { id: 44, day_of_week: "Friday", subject: "Values Education 7", start_time: "13:45", end_time: "14:45", teacher: "Carmen Flores", room: "Room 301" },
    { id: 45, day_of_week: "Friday", subject: "Filipino 7", start_time: "14:45", end_time: "15:45", teacher: "Juan Reyes", room: "Room 102" }
  ];
}
setMySchedule(scheduleData);
      
      try {
        const annRes = await api.get('/announcements.php');
        setAnnouncements(Array.isArray(annRes.data) ? annRes.data : []);
      } catch (err) {
        setAnnouncements([
          { id: 1, title: "Welcome to School Year 2025-2026!", content: "We are excited to welcome all students back to school!", author_name: "Principal", created_at: new Date().toISOString() },
          { id: 2, title: "Class Schedule Update", content: "Please check your updated class schedule.", author_name: "Admin", created_at: new Date().toISOString() },
          { id: 3, title: "School Events", content: "Upcoming events this month.", author_name: "Guidance Office", created_at: new Date().toISOString() }
        ]);
      }
      
      let attendanceData = [];
      try {
        const attendanceRes = await api.get(`/student-attendance.php?student_id=${studentId}`);
        attendanceData = Array.isArray(attendanceRes.data) ? attendanceRes.data : [];
      } catch (err) {}
      
      if (attendanceData.length === 0) {
        attendanceData = [
          { date: "2026-05-01", status: "Present" },
          { date: "2026-05-02", status: "Present" },
          { date: "2026-05-03", status: "Absent" },
          { date: "2026-05-04", status: "Present" },
          { date: "2026-05-05", status: "Late" },
          { date: "2026-05-06", status: "Present" },
          { date: "2026-05-07", status: "Present" },
          { date: "2026-05-08", status: "Present" },
          { date: "2026-05-09", status: "Late" },
          { date: "2026-05-10", status: "Present" }
        ];
      }
      setAttendance(attendanceData);
      
      const presentCount = attendanceData.filter(a => a.status === 'Present').length;
      const totalDays = attendanceData.length;
      const attendanceRate = totalDays > 0 ? ((presentCount / totalDays) * 100).toFixed(1) : 0;
      
      setStats({
        averageGrade: averageGrade,
        attendanceRate: attendanceRate,
        totalSubjects: currentGrades.length,
        progress: (averageGrade / 100) * 100,
        presentCount: presentCount,
        absentCount: attendanceData.filter(a => a.status === 'Absent').length,
        lateCount: attendanceData.filter(a => a.status === 'Late').length,
        totalDays: totalDays
      });
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/messages.php?receiver_id=${studentId}`);
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

  const fetchComments = async () => {
    try {
      const response = await api.get('/comments.php');
      const commentsData = Array.isArray(response.data) ? response.data : [];
      const commentsByAnnouncement = {};
      commentsData.forEach(comment => {
        if (!commentsByAnnouncement[comment.announcement_id]) {
          commentsByAnnouncement[comment.announcement_id] = [];
        }
        commentsByAnnouncement[comment.announcement_id].push(comment);
      });
      setComments(commentsByAnnouncement);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedTeacher) return;
    
    try {
      const response = await api.post('/messages.php', {
        receiver_id: selectedTeacher.id,
        receiver_name: selectedTeacher.name,
        receiver_role: 'teacher',
        subject: newMessage.subject,
        message: newMessage.message,
        sender_id: studentId,
        sender_name: studentName,
        sender_role: 'student'
      });
      
      if (response.data.success) {
        alert('✅ Message sent successfully to ' + selectedTeacher.name);
        setShowMessageModal(false);
        setNewMessage({ subject: '', message: '' });
        setSelectedTeacher(null);
        fetchMessages();
      } else {
        alert('Error sending message');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error sending message');
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      alert('Please enter a comment');
      return;
    }
    
    try {
      const response = await api.post('/comments.php', {
        announcement_id: selectedAnnouncement.id,
        comment: commentText,
        user_id: studentId,
        user_name: studentName
      });
      
      if (response.data.success) {
        alert('✅ Comment added successfully!');
        setCommentText('');
        setShowCommentModal(false);
        fetchComments();
      } else {
        alert('Error adding comment');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error adding comment');
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('printable-grades').innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = `
      <div style="padding: 20px; font-family: Arial;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2>Cabacao National High School</h2>
          <h3>Student Grade Report</h3>
          <p><strong>Student:</strong> ${studentName}</p>
          <p><strong>Grade & Section:</strong> ${studentGrade} - ${studentSection}</p>
          <p><strong>Grading Period:</strong> ${selectedGradingPeriod}</p>
        </div>
        ${printContent}
        <div style="margin-top: 30px; text-align: center;">
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const getUniqueTeachers = () => {
    const teachers = {};
    mySchedule.forEach(s => {
      if (s.teacher && !teachers[s.teacher]) {
        teachers[s.teacher] = { id: s.teacher_id || Math.random(), name: s.teacher };
      }
    });
    return Object.values(teachers);
  };

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

  const getClassAtTime = (day, timeStart, timeEnd) => {
  const convertToMinutes = (time) => {
    const [hours, minutes] = time.split(':');
    return parseInt(hours) * 60 + parseInt(minutes);
  };
  const slotStartMinutes = convertToMinutes(timeStart);
  const slotEndMinutes = convertToMinutes(timeEnd);
  
  const found = mySchedule.find(s => {
    if (s.isBreak) return false;
    if (s.day_of_week !== day) return false;
    const classStartMinutes = convertToMinutes(s.start_time);
    const classEndMinutes = convertToMinutes(s.end_time);
    // Check if the time slot is within the class period
    return slotStartMinutes >= classStartMinutes && slotEndMinutes <= classEndMinutes;
  });
  
  return found;
};

  const gradeDistribution = [
    { range: '90-100%', count: currentGrades.filter(g => g.grade >= 90).length },
    { range: '80-89%', count: currentGrades.filter(g => g.grade >= 80 && g.grade < 90).length },
    { range: '75-79%', count: currentGrades.filter(g => g.grade >= 75 && g.grade < 80).length },
    { range: 'Below 75%', count: currentGrades.filter(g => g.grade > 0 && g.grade < 75).length }
  ];

  const attendanceChartData = [
    { name: 'Present', value: stats.presentCount, color: '#28a745' },
    { name: 'Absent', value: stats.absentCount, color: '#dc3545' },
    { name: 'Late', value: stats.lateCount, color: '#ffc107' }
  ];

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'profile', label: 'My Profile', icon: '👤' },
    { id: 'grades', label: 'My Grade', icon: '📝' },
    { id: 'schedule', label: 'My Schedule', icon: '📅' },
    { id: 'announcements', label: 'Announcements', icon: '📢' },
    { id: 'messages', label: 'Messages', icon: '💬' },
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
  const unreadMessagesCount = messages.filter(m => !m.is_read && m.receiver_id === studentId).length;

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px', fontSize: '20px' }}>Loading student dashboard...</div>;
  }

  return (
    <div className="dashboard student-dashboard">
      {/* Navbar */}
      <nav className="navbar" style={{ background: '#2c3e50', color: 'white', padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginLeft: '260px' }}>
        <div>
          <h2 style={{ margin: 0 }}>🎓 Student Portal - Cabacao NHS</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="notification-bell" onClick={() => setShowNotifications(!showNotifications)} style={{ position: 'relative', cursor: 'pointer' }}>
            🔔 {unreadCount > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#e74c3c', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '10px' }}>{unreadCount}</span>}
          </div>
          <div className="message-icon" onClick={() => handleMenuClick('messages')} style={{ position: 'relative', cursor: 'pointer' }}>
            💬 {unreadMessagesCount > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#e74c3c', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '10px' }}>{unreadMessagesCount}</span>}
          </div>
          <span>👋 Welcome, {studentName.split(',')[0] || 'Student'}</span>
          <button onClick={onLogout} style={{ background: '#e74c3c', padding: '8px 16px', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer' }}>🚪 Logout</button>
        </div>
        {showNotifications && (
          <div style={{ position: 'absolute', top: '70px', right: '20px', background: 'white', color: '#333', borderRadius: '8px', width: '300px', maxHeight: '400px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 100 }}>
            <h4 style={{ padding: '12px', margin: 0, borderBottom: '1px solid #eee' }}>🔔 Notifications</h4>
            {notifications.map(notif => (
              <div key={notif.id} onClick={() => markNotificationRead(notif.id)} style={{ padding: '12px', borderBottom: '1px solid #eee', cursor: 'pointer', background: !notif.is_read ? '#e8f4fd' : 'white' }}>
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
                  <h1 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>{greeting}, {studentName.split(',')[0]}!</h1>
                  <p style={{ margin: '0', fontSize: '16px', opacity: 0.95 }}>Track your grades, attendance, and academic progress.</p>
                </div>
                <div style={{ fontSize: '60px' }}>🎓</div>
              </div>
            </div>

            <h2>📋 Dashboard Overview</h2>
            <p style={{ marginBottom: '20px', color: '#666' }}>Quick summary of your school performance.</p>

            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
              <div className="stat-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '40px' }}>📊</div>
                <h3 style={{ margin: '10px 0 5px', fontSize: '28px', color: '#667eea' }}>{averageGrade}%</h3>
                <p>Average Grade</p>
              </div>
              <div className="stat-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '40px' }}>📅</div>
                <h3 style={{ margin: '10px 0 5px', fontSize: '28px', color: '#28a745' }}>{stats.attendanceRate}%</h3>
                <p>Attendance Rate</p>
              </div>
              <div className="stat-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '40px' }}>📚</div>
                <h3 style={{ margin: '10px 0 5px', fontSize: '28px', color: '#f39c12' }}>{stats.totalSubjects}</h3>
                <p>Subjects</p>
              </div>
              <div className="stat-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '40px' }}>⭐</div>
                <h3 style={{ margin: '10px 0 5px', fontSize: '28px', color: '#e74c3c' }}>{((averageGrade / 100) * 100).toFixed(1)}%</h3>
                <p>Progress</p>
              </div>
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
                    <Bar dataKey="count" fill="#667eea" radius={[8,8,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <h3>📅 Attendance Summary</h3>
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

            <div className="student-info" style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              <h3>📋 Student Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '15px' }}>
                <div><strong>Name:</strong> {studentName}</div>
                <div><strong>Student ID:</strong> {userData?.student_id_number || 'N/A'}</div>
                <div><strong>Grade & Section:</strong> {studentGrade} - {studentSection}</div>
                <div><strong>Adviser:</strong> Maria Santos</div>
              </div>
            </div>

            <div className="motivation-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              <div className="motivation-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px', borderRadius: '12px', color: 'white' }}>
                <h3>💡 Motivation</h3>
                <p style={{ fontStyle: 'italic' }}>"Keep pushing yourself—every lesson brings you closer to success."</p>
                <div style={{ marginTop: '15px' }}>
                  <p>🎯 Your goal: Maintain grade above 85%</p>
                  <p>📅 Attendance target: 90% or higher</p>
                </div>
              </div>
              <div className="announcements-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <h3>📢 Announcements</h3>
                {announcements.slice(0, 3).map(ann => (
                  <div key={ann.id} style={{ padding: '10px 0', borderBottom: '1px solid #eee', cursor: 'pointer' }} onClick={() => { setSelectedAnnouncement(ann); setShowCommentModal(true); }}>
                    <strong>{ann.title}</strong>
                    <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#666' }}>{ann.content?.substring(0, 80)}...</p>
                    <small style={{ color: '#999' }}>{new Date(ann.created_at).toLocaleDateString()}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div>
            <h2>👤 My Profile</h2>
            <div className="profile-container" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '25px' }}>
              <div className="profile-picture-section" style={{ background: 'white', borderRadius: '16px', padding: '25px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <div style={{ width: '150px', height: '150px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                  <span style={{ fontSize: '70px' }}>👨‍🎓</span>
                </div>
                <h3 style={{ margin: '15px 0 5px' }}>{studentName}</h3>
                <p>{userData?.student_id_number || 'N/A'}</p>
                <div style={{ background: '#e8f4fd', padding: '8px', borderRadius: '20px', display: 'inline-block' }}>
                  <span>🟢 Active Student</span>
                </div>
              </div>
              <div>
                <div className="profile-section" style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                  <h4>📋 Personal Information</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '15px' }}>
                    <div><strong>Full Name:</strong></div><div>{studentName}</div>
                    <div><strong>Student ID:</strong></div><div>{userData?.student_id_number || 'N/A'}</div>
                    <div><strong>Grade Level:</strong></div><div>{studentGrade}</div>
                    <div><strong>Section:</strong></div><div>{studentSection}</div>
                    <div><strong>Adviser:</strong></div><div>Maria Santos</div>
                    <div><strong>School Year:</strong></div><div>2025-2026</div>
                  </div>
                </div>
                <div className="profile-section" style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                  <h4>📅 Account Information</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '15px' }}>
                    <div><strong>Username:</strong></div><div>{userData?.username || studentName.toLowerCase().replace(' ', '.')}</div>
                    <div><strong>Role:</strong></div><div>Student</div>
                    <div><strong>Account Status:</strong></div><div><span style={{ color: '#27ae60' }}>🟢 Active</span></div>
                    <div><strong>Last Login:</strong></div><div>{new Date().toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GRADES TAB */}
        {activeTab === 'grades' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ margin: 0 }}>📝 My Grades - Grade {studentGrade} - {studentSection}</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select 
                  value={selectedGradingPeriod} 
                  onChange={(e) => setSelectedGradingPeriod(e.target.value)}
                  style={{ padding: '8px 15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
                >
                  {gradingPeriods.map(period => (
                    <option key={period.id} value={period.id}>{period.label}</option>
                  ))}
                </select>
                <button onClick={handlePrint} style={{ background: '#27ae60', color: 'white', padding: '8px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  🖨️ Print Grades
                </button>
              </div>
            </div>
            
            <div id="printable-grades" ref={printRef}>
              <div className="data-table" style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', padding: '20px', marginTop: '10px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#667eea', color: 'white' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Subject</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Teacher</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Grade</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentGrades.map((grade, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px' }}>{grade.subject}</td>
                        <td style={{ padding: '12px' }}>{grade.teacher}</td>
                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: grade.grade >= 75 ? '#28a745' : '#dc3545' }}>{grade.grade}%</td>
                        <td style={{ padding: '12px' }}>{grade.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#f8f9fa', fontWeight: 'bold' }}>
                      <td colSpan="2" style={{ padding: '12px' }}>Average</td>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#667eea' }}>{averageGrade}%</td>
                      <td style={{ padding: '12px' }}>{averageGrade >= 75 ? '✅ Passed' : '❌ Failed'}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

      {/* SCHEDULE TAB */}
{activeTab === 'schedule' && (
  <div>
    <h2>📅 My Class Schedule - Grade {studentGrade} - {studentSection}</h2>
    <p style={{ marginBottom: '20px' }}>👨‍🎓 Student: {studentName}</p>
    <div className="schedule-week-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginTop: '15px' }}>
      {days.map(day => (
        <div key={day} className="schedule-day" style={{ background: '#f8f9fa', borderRadius: '10px', padding: '12px', minHeight: '500px' }}>
          <div className="day-header" style={{ fontWeight: 'bold', textAlign: 'center', padding: '8px', background: '#667eea', color: 'white', borderRadius: '8px', marginBottom: '10px' }}>{day}</div>
          {timeSlots.map((slot, idx) => {
            const classAtTime = getClassAtTime(day, slot.start, slot.end);
            if (slot.isBreak) {
              return <div key={idx} className="break-slot" style={{ background: '#fff3cd', borderRadius: '6px', padding: '8px', marginBottom: '6px', borderLeft: '4px solid #ffc107', textAlign: 'center', fontWeight: 'bold' }}>{slot.label}<br/><small>{slot.start} - {slot.end}</small></div>;
            }
            if (classAtTime && !classAtTime.isBreak) {
              return (
                <div key={idx} className="class-slot" style={{ background: 'white', borderRadius: '6px', padding: '10px', marginBottom: '6px', borderLeft: '4px solid #667eea', fontSize: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div>⏰ <strong>{slot.start} - {slot.end}</strong></div>
                  <div style={{ marginTop: '5px' }}>📖 <strong>{classAtTime.subject}</strong></div>
                  <div style={{ marginTop: '3px', color: '#555' }}>👨‍🏫 {classAtTime.teacher || 'Teacher'}</div>
                  <div style={{ marginTop: '3px', color: '#888', fontSize: '11px' }}>📍 {classAtTime.room || 'Room'}</div>
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
        {/* ANNOUNCEMENTS TAB */}
        {activeTab === 'announcements' && (
          <div>
            <h2>📢 Announcements</h2>
            {announcements.map(ann => (
              <div key={ann.id} style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <h3>{ann.title}</h3>
                <p>{ann.content}</p>
                <small>Posted by: {ann.author_name} | {new Date(ann.created_at).toLocaleString()}</small>
                <button 
                  onClick={() => { setSelectedAnnouncement(ann); setShowCommentModal(true); }}
                  style={{ background: '#17a2b8', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '10px' }}
                >
                  💬 Add Comment
                </button>
                {comments[ann.id] && comments[ann.id].length > 0 && (
                  <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                    <strong>Comments ({comments[ann.id].length})</strong>
                    {comments[ann.id].map((comment, idx) => (
                      <div key={idx} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                        <strong>{comment.user_name}</strong>
                        <p style={{ margin: '5px 0 0', fontSize: '13px' }}>{comment.comment}</p>
                        <small style={{ color: '#999' }}>{new Date(comment.created_at).toLocaleString()}</small>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === 'messages' && (
          <div>
            <h2>💬 Messages</h2>
            <div style={{ marginBottom: '20px' }}>
              <button onClick={() => setShowMessageModal(true)} style={{ background: '#667eea', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                ✏️ New Message
              </button>
            </div>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px' }}>
                <p>No messages yet.</p>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} style={{ background: 'white', padding: '15px', borderRadius: '12px', marginBottom: '10px', borderLeft: `4px solid ${!msg.is_read && msg.receiver_id === studentId ? '#667eea' : '#ccc'}`, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                  <strong>{msg.sender_name}</strong>
                  <div><small>📌 {msg.subject}</small></div>
                  <p>{msg.message}</p>
                  <small>{new Date(msg.created_at).toLocaleString()}</small>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal" style={{ background: 'white', borderRadius: '12px', padding: '25px', width: '500px', maxWidth: '90%' }}>
            <h3>💬 Send Message to Teacher</h3>
            <form onSubmit={handleSendMessage}>
              <select 
                required 
                style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                onChange={(e) => {
                  const teacher = getUniqueTeachers().find(t => t.name === e.target.value);
                  setSelectedTeacher(teacher);
                }}
              >
                <option value="">Select Teacher</option>
                {getUniqueTeachers().map(teacher => (
                  <option key={teacher.id} value={teacher.name}>{teacher.name}</option>
                ))}
              </select>
              <input 
                type="text" 
                placeholder="Subject" 
                value={newMessage.subject} 
                onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})} 
                required 
                style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '6px' }} 
              />
              <textarea 
                placeholder="Message" 
                value={newMessage.message} 
                onChange={(e) => setNewMessage({...newMessage, message: e.target.value})} 
                rows="5" 
                required 
                style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '6px' }} 
              />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowMessageModal(false)} style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ background: '#667eea', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>📤 Send</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {showCommentModal && selectedAnnouncement && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal" style={{ background: 'white', borderRadius: '12px', padding: '25px', width: '500px', maxWidth: '90%' }}>
            <h3>💬 Add Comment</h3>
            <p><strong>{selectedAnnouncement.title}</strong></p>
            <textarea 
              value={commentText} 
              onChange={(e) => setCommentText(e.target.value)} 
              rows="4" 
              placeholder="Write your comment here..." 
              style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '6px' }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCommentModal(false)} style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleAddComment} style={{ background: '#17a2b8', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>💬 Post Comment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;