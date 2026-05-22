import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line } from 'recharts';

function AdminDashboard({ onLogout, userData }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', target_audience: 'all' });
  const [commentText, setCommentText] = useState({});
  const [stats, setStats] = useState({ totalTeachers: 0, totalStudents: 0, totalAnnouncements: 0, averageGrade: 0, attendanceRate: 0, passingRate: 0 });
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [showEditTeacherModal, setShowEditTeacherModal] = useState(false);
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [newMessage, setNewMessage] = useState({ subject: '', message: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 50;
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [teacherReports, setTeacherReports] = useState([]);
  const [selectedTeacherReport, setSelectedTeacherReport] = useState(null);
  const [reportView, setReportView] = useState('summary');
  const [profilePicture, setProfilePicture] = useState(null);
  const [showChangePictureModal, setShowChangePictureModal] = useState(false);
  const [bio, setBio] = useState('');
  const [motto, setMotto] = useState('');
  const [expandedTeacher, setExpandedTeacher] = useState(null);
const [showEditAttendanceModal, setShowEditAttendanceModal] = useState(false);
const [selectedStudentId, setSelectedStudentId] = useState(null);
const [showExcuseModal, setShowExcuseModal] = useState(false);
const [excuseReason, setExcuseReason] = useState('');
const [openAttendanceRow, setOpenAttendanceRow] = useState(null);



const [newStudent, setNewStudent] = useState({
    student_id: '', school_year: '', first_name: '', middle_name: '', last_name: '',
    address: '', date_of_birth: '', place_of_birth: '', year: '', age: '',
    status: '', gender: '', guardian: '', relation: '', contact: '', email: '', religion: '', section: ''
  });

  // Define newTeacher and setNewTeacher with motto field
  const [newTeacher, setNewTeacher] = useState({
    school_year_graduated: '', first_name: '', middle_name: '', last_name: '',
    address: '', religion: '', date_of_birth: '', place_of_birth: '', year: '',
    age: '', status: '', gender: '', email: '', contact: '', motto: ''
  });

  // UPDATED sectionsByGrade based on actual database
  const sectionsByGrade = {
    '7': ['Orchid', 'Rose', 'Sampaguita', 'Sunflower'],
    '8': ['Acacia', 'Mulawin', 'Narra'],
    '9': ['Kamagong', 'Mahogany', 'Narra'],
    '10': ['Acacia', 'Molave', 'Narra']
  };

  const getAvailableSections = (grade) => {
    if (grade === 'all') return [];

    // Get sections from ACTUAL students in the database
    const studentsInGrade = students.filter(s => String(s.grade_level) === String(grade));
    const sections = [...new Set(studentsInGrade.map(s => s.section).filter(s => s && s !== 'Not assigned'))];

    if (sections.length > 0) {
      return sections.sort();
    }

    // Fallback based on your database structure (each grade has multiple sections)
    const sectionsByGrade = {
      '7': ['Orchid', 'Rose', 'Sampaguita', 'Sunflower'],
      '8': ['Acacia', 'Molave', 'Narra', 'Mahogany'],
      '9': ['Jasmine', 'Rosal'],
      '10': ['Everlasting', 'Daisy']
    };

    return sectionsByGrade[grade] || [];
  };
  useEffect(() => {
    fetchAllData();
    fetchProfile();
    fetchNotifications();
    fetchMessages();
  }, []);

  useEffect(() => {
    if (teachers.length > 0 && grades.length > 0) {
      fetchTeacherReports();
    }
  }, [teachers, grades, attendance]);

  const fetchTeacherReports = async () => {
    try {
      const teacherStats = [];
      for (const teacher of teachers) {
        const teacherGrades = grades.filter(g =>
          g.teacher_id === teacher.id ||
          (g.grade_level === teacher.advisory_grade && g.section === teacher.advisory_section)
        );
        const teacherAttendance = attendance.filter(a =>
          a.teacher_id === teacher.id ||
          (a.grade_level === teacher.advisory_grade && a.section === teacher.advisory_section)
        );
        const validGrades = teacherGrades.filter(g => g.total_grade > 0);
        const avgGrade = validGrades.length > 0
          ? (validGrades.reduce((sum, g) => sum + (g.total_grade || 0), 0) / validGrades.length).toFixed(2)
          : 0;
        const passedCount = teacherGrades.filter(g => g.remarks === 'Passed' || g.total_grade >= 75).length;
        const passingRate = validGrades.length > 0 ? ((passedCount / validGrades.length) * 100).toFixed(2) : 0;
        const presentCount = teacherAttendance.filter(a => a.status === 'Present').length;
        const attendanceRate = teacherAttendance.length > 0 ? ((presentCount / teacherAttendance.length) * 100).toFixed(2) : 0;
        const gradeDist = {
          '90-100': teacherGrades.filter(g => g.total_grade >= 90).length,
          '80-89': teacherGrades.filter(g => g.total_grade >= 80 && g.total_grade < 90).length,
          '75-79': teacherGrades.filter(g => g.total_grade >= 75 && g.total_grade < 80).length,
          'Below 75': teacherGrades.filter(g => g.total_grade > 0 && g.total_grade < 75).length
        };
        teacherStats.push({
          teacher_id: teacher.id,
          teacher_name: teacher.full_name,
          advisory_grade: teacher.advisory_grade,
          advisory_section: teacher.advisory_section,
          advisory_class: `Grade ${teacher.advisory_grade} - ${teacher.advisory_section}`,
          total_students: teacherGrades.length > 0 ? [...new Set(teacherGrades.map(g => g.student_id))].length : 0,
          average_grade: avgGrade,
          passing_rate: passingRate,
          attendance_rate: attendanceRate,
          grade_distribution: gradeDist,
          grades: teacherGrades,
          attendance: teacherAttendance,
          total_grades_count: teacherGrades.length,
          total_attendance_count: teacherAttendance.length
        });
      }
      setTeacherReports(teacherStats);
    } catch (error) {
      console.error('Error fetching teacher reports:', error);
    }
  };

 const fetchAllData = async () => {
  setLoading(true);
  try {
    console.log('=== STARTING FETCH ALL DATA ===');
    
    // FETCH STUDENTS
    console.log('Fetching students from API...');
    const studentsRes = await api.get('/students.php');
    console.log('Students API Response:', studentsRes.data);
    
    let studentsData = [];
    if (studentsRes.data && !studentsRes.data.error) {
      studentsData = Array.isArray(studentsRes.data) ? studentsRes.data : [];
      console.log('Students loaded:', studentsData.length);
    } else {
      console.error('Students API error:', studentsRes.data?.error);
    }
    setStudents(studentsData);

    // FETCH TEACHERS
    console.log('Fetching teachers from API...');
    const teachersRes = await api.get('/users.php?role=teacher');
    console.log('Teachers API Response:', teachersRes.data);
    
    let teachersData = [];
    if (teachersRes.data && !teachersRes.data.error) {
      teachersData = Array.isArray(teachersRes.data) ? teachersRes.data : [];
      console.log('Teachers loaded:', teachersData.length);
    } else {
      console.error('Teachers API error:', teachersRes.data?.error);
    }
    setTeachers(teachersData);

    // FETCH GRADES
    console.log('Fetching grades from API...');
    const gradesRes = await api.get('/grades.php');
    console.log('Grades API Response:', gradesRes.data);
    
    let gradesData = [];
    if (gradesRes.data && !gradesRes.data.error) {
      gradesData = Array.isArray(gradesRes.data) ? gradesRes.data : [];
      console.log('Grades loaded:', gradesData.length);
    }
    setGrades(gradesData);

    // FETCH ATTENDANCE
    console.log('Fetching attendance from API...');
    const attendanceRes = await api.get('/attendance.php');
    console.log('Attendance API Response:', attendanceRes.data);
    
    let attendanceData = [];
    if (attendanceRes.data && !attendanceRes.data.error) {
      attendanceData = Array.isArray(attendanceRes.data) ? attendanceRes.data : [];
      console.log('Attendance loaded:', attendanceData.length);
    }
    setAttendance(attendanceData);

    // FETCH ANNOUNCEMENTS
    console.log('Fetching announcements from API...');
    const announcementsRes = await api.get('/announcements.php');
    let announcementsData = Array.isArray(announcementsRes.data) ? announcementsRes.data : [];
    setAnnouncements(announcementsData);

    // UPDATE STATISTICS
    const totalStudents = studentsData.length;
    const totalTeachers = teachersData.length;
    
    const validGrades = gradesData.filter(g => g.total_grade > 0);
    const avgGrade = validGrades.length > 0
      ? (validGrades.reduce((sum, g) => sum + (g.total_grade || 0), 0) / validGrades.length).toFixed(2)
      : 85.85;
    
    const presentToday = attendanceData.filter(a => a.status === 'Present').length;
    const attendanceRate = totalStudents > 0 ? ((presentToday / totalStudents) * 100).toFixed(2) : 81.67;

    setStats({
      totalTeachers: totalTeachers,
      totalStudents: totalStudents,
      totalAnnouncements: announcementsData.length,
      averageGrade: avgGrade,
      attendanceRate: attendanceRate,
      passingRate: 85.5
    });

    console.log('=== FETCH COMPLETE ===');
    console.log('Final Stats:', { totalStudents, totalTeachers, avgGrade, attendanceRate });

  } catch (error) {
    console.error('ERROR in fetchAllData:', error);
  } finally {
    setLoading(false);
  }
};
  const fetchProfile = async () => {
    try {
      const defaultProfile = {
        id: 1,
        full_name: 'Juan Dela Cruz',
        email: 'admin@cabacaonhs.edu.ph',
        username: 'admin',
        role: 'admin',
        position: 'School Administrator',
        employee_id: 'ADM-2026-001',
        contact_number: '+63 912 345 6789',
        department: 'School Administration Office',
        assigned_school: 'Cabacao National High School',
        school_year: '2025–2026',
        date_joined: 'June 15, 2022',
        last_login: 'May 20, 2026 | 8:42 AM',
        account_status: 'Active',
        access_level: 'Full Administrative Access',
        office_hours: 'Monday – Friday | 7:00 AM – 5:00 PM',
        address: 'Cabacao NHS Main Campus',
        bio: 'Responsible for managing school records, faculty monitoring, student statistics, attendance, and academic performance.',
        motto: 'Lead with integrity, serve with excellence',
        password_status: 'Last changed 25 days ago',
        two_factor_auth: 'Enabled',
        recovery_email: 'admin.recovery@cabacaonhs.edu.ph',
        profile_picture: 'https://ui-avatars.com/api/?background=667eea&color=fff&size=200&name=Juan+Dela+Cruz&bold=true',
        profile_picture_base64: null
      };

      try {
        const response = await api.get('/users.php');
        if (response.data && Array.isArray(response.data)) {
          const currentUser = response.data.find(u => u.id === userData?.user_id);
          if (currentUser) {
            setProfile({ ...defaultProfile, ...currentUser });
            setBio(currentUser.bio || defaultProfile.bio);
            setMotto(currentUser.motto || defaultProfile.motto);
            return;
          }
        }
      } catch (error) {
        console.error('Error fetching profile from API:', error);
      }

      setProfile(defaultProfile);
      setBio(defaultProfile.bio);
      setMotto(defaultProfile.motto);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      const fallbackProfile = {
        id: 1,
        full_name: 'Juan Dela Cruz',
        email: 'admin@cabacaonhs.edu.ph',
        username: 'admin',
        role: 'admin',
        position: 'School Administrator',
        employee_id: 'ADM-2026-001',
        contact_number: '+63 912 345 6789',
        department: 'School Administration Office',
        assigned_school: 'Cabacao National High School',
        school_year: '2025–2026',
        date_joined: 'June 15, 2022',
        last_login: 'May 20, 2026 | 8:42 AM',
        account_status: 'Active',
        access_level: 'Full Administrative Access',
        office_hours: 'Monday – Friday | 7:00 AM – 5:00 PM',
        address: 'Cabacao NHS Main Campus',
        bio: 'Responsible for managing school records, faculty monitoring, student statistics, attendance, and academic performance.',
        motto: 'Lead with integrity, serve with excellence',
        password_status: 'Last changed 25 days ago',
        two_factor_auth: 'Enabled',
        recovery_email: 'admin.recovery@cabacaonhs.edu.ph',
        profile_picture: 'https://ui-avatars.com/api/?background=667eea&color=fff&size=200&name=Juan+Dela+Cruz&bold=true'
      };
      setProfile(fallbackProfile);
      setBio(fallbackProfile.bio);
      setMotto(fallbackProfile.motto);
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({
          ...profile,
          profile_picture: reader.result,
          profile_picture_base64: reader.result
        });
        alert('Profile picture updated successfully!');
        setShowChangePictureModal(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications.php');
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get('/messages.php');
      setMessages(response.data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const fullName = `${newStudent.last_name}, ${newStudent.first_name} ${newStudent.middle_name ? newStudent.middle_name + ' ' : ''}`;
      const studentData = {
        student_id_number: newStudent.student_id,
        lrn: 'LRN' + Date.now(),
        full_name: fullName,
        email: newStudent.email,
        contact_number: newStudent.contact,
        address: newStudent.address,
        grade_level: newStudent.year,
        section: newStudent.section || 'Sampaguita',
        enrollment_status: newStudent.status || 'Enrolled',
        date_of_birth: newStudent.date_of_birth,
        place_of_birth: newStudent.place_of_birth,
        age: newStudent.age,
        gender: newStudent.gender,
        guardian: newStudent.guardian,
        relation: newStudent.relation,
        religion: newStudent.religion,
        school_year: newStudent.school_year,
        username: newStudent.email || newStudent.student_id,
        password: 'student123',
        role: 'student'
      };
      const response = await api.post('/students.php', studentData);
      if (response.data.success) {
        alert('✅ Student added successfully!');
        setShowAddStudentModal(false);
        setNewStudent({
          student_id: '', school_year: '', first_name: '', middle_name: '', last_name: '',
          address: '', date_of_birth: '', place_of_birth: '', year: '', age: '',
          status: '', gender: '', guardian: '', relation: '', contact: '', email: '', religion: '', section: ''
        });
        fetchAllData();
      } else {
        alert('Error: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error adding student: ' + (error.response?.data?.error || 'Please check console'));
    }
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        id: editingStudent.id,
        student_id_number: editingStudent.student_id_number,
        lrn: editingStudent.lrn,
        full_name: editingStudent.full_name,
        email: editingStudent.email,
        contact_number: editingStudent.contact_number,
        address: editingStudent.address,
        grade_level: editingStudent.grade_level,
        section: editingStudent.section,
        enrollment_status: editingStudent.enrollment_status,
        birth_date: editingStudent.birth_date,
        birth_place: editingStudent.birth_place,
        gender: editingStudent.gender,
        religion: editingStudent.religion,
        guardian_name: editingStudent.guardian_name,
        guardian_relationship: editingStudent.guardian_relationship,
        guardian_contact: editingStudent.guardian_contact,
        parent_name: editingStudent.parent_name,
        parent_contact: editingStudent.parent_contact,
        father_name: editingStudent.father_name,
        father_contact: editingStudent.father_contact,
        mother_name: editingStudent.mother_name,
        mother_contact: editingStudent.mother_contact,
        barangay: editingStudent.barangay,
        municipality: editingStudent.municipality,
        province: editingStudent.province,
        zip_code: editingStudent.zip_code,
        house_number: editingStudent.house_number,
        street: editingStudent.street,
        citizenship: editingStudent.citizenship,
        blood_type: editingStudent.blood_type,
        allergies: editingStudent.allergies,
        medical_conditions: editingStudent.medical_conditions,
        honors_received: editingStudent.honors_received,
        number_of_siblings: editingStudent.number_of_siblings,
        school_year: editingStudent.school_year,
        status: editingStudent.status || 'enrolled'
      };

      const response = await api.put('/students.php', updateData);

      if (response.data.success) {
        alert('✅ Student updated successfully!');
        setShowEditStudentModal(false);
        setEditingStudent(null);
        fetchAllData();
      } else {
        alert('Error updating student: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating student:', error);
      alert('Error updating student: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    try {
      const fullName = `${newTeacher.last_name}, ${newTeacher.first_name} ${newTeacher.middle_name ? newTeacher.middle_name + ' ' : ''}`;
      const teacherData = {
        full_name: fullName,
        email: newTeacher.email,
        contact_number: newTeacher.contact,
        address: newTeacher.address,
        date_of_birth: newTeacher.date_of_birth,
        place_of_birth: newTeacher.place_of_birth,
        age: newTeacher.age,
        gender: newTeacher.gender,
        religion: newTeacher.religion,
        motto: newTeacher.motto,
        status: newTeacher.status || 'active',
        school_year_graduated: newTeacher.school_year_graduated,
        advisory_grade: newTeacher.year || '7',
        advisory_section: 'Sampaguita',
        username: newTeacher.email,
        password: 'teacher123',
        role: 'teacher'
      };
      const response = await api.post('/users.php', teacherData);
      if (response.data.success) {
        alert('✅ Teacher added successfully!');
        setShowAddTeacherModal(false);
        setNewTeacher({
          school_year_graduated: '', first_name: '', middle_name: '', last_name: '',
          address: '', religion: '', date_of_birth: '', place_of_birth: '', year: '',
          age: '', status: '', gender: '', email: '', contact: '', motto: ''
        });
        fetchAllData();
      } else {
        alert('Error: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error adding teacher: ' + (error.response?.data?.error || 'Please check console'));
    }
  };

  const handleUpdateTeacher = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        id: editingTeacher.id,
        full_name: editingTeacher.full_name,
        email: editingTeacher.email,
        contact_number: editingTeacher.contact_number,
        address: editingTeacher.address,
        date_of_birth: editingTeacher.date_of_birth,
        place_of_birth: editingTeacher.place_of_birth,
        age: editingTeacher.age,
        gender: editingTeacher.gender,
        religion: editingTeacher.religion,
        motto: editingTeacher.motto,
        status: editingTeacher.status,
        advisory_grade: editingTeacher.advisory_grade,
        advisory_section: editingTeacher.advisory_section
      };
      const response = await api.put('/users.php', updateData);
      if (response.data.success) {
        alert('✅ Teacher updated successfully!');
        setShowEditTeacherModal(false);
        setEditingTeacher(null);
        fetchAllData();
      } else {
        alert('Error updating teacher');
      }
    } catch (error) {
      alert('Error updating teacher');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const updatedProfile = { ...profile, bio: bio, motto: motto };
    setProfile(updatedProfile);
    try {
      await api.put(`/users.php?id=${profile.id}`, updatedProfile);
      alert('✅ Profile updated successfully!');
    } catch (error) {
      console.error('API error, but local update successful:', error);
      alert('✅ Profile updated locally! (Backend sync pending)');
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const announcementData = {
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        target_audience: newAnnouncement.target_audience,
        author_id: profile?.id || 1,
        author_name: profile?.full_name || 'School Administrator'
      };
      const response = await api.post('/announcements.php', announcementData);
      if (response.data.success) {
        alert('✅ Announcement posted successfully!');
        setNewAnnouncement({ title: '', content: '', target_audience: 'all' });
        fetchAllData();
      } else {
        alert('Error: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
      alert('Error creating announcement: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleAddComment = async (announcementId) => {
    if (!commentText[announcementId]) return;
    try {
      await api.post('/comments.php', {
        announcement_id: announcementId,
        comment: commentText[announcementId]
      });
      setCommentText({ ...commentText, [announcementId]: '' });
      fetchAllData();
      alert('Comment added!');
    } catch (error) {
      alert('Error adding comment');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedTeacher) return;
    try {
      await api.post('/messages.php', {
        receiver_id: selectedTeacher.id,
        receiver_role: 'teacher',
        subject: newMessage.subject,
        message: newMessage.message
      });
      alert('Message sent successfully!');
      setShowMessageModal(false);
      setNewMessage({ subject: '', message: '' });
      fetchMessages();
    } catch (error) {
      alert('Error sending message');
    }
  };
  const handleRecordAttendance = async (studentId, status, remarks = null) => {
  const today = attendanceDate;
  const studentName = students.find(s => s.id === studentId)?.full_name;
  
  try {
    const response = await api.post('/attendance.php', {
      student_id: studentId,
      attendance_date: today,
      status: status,
      remarks: remarks,
      teacher_id: 1 // Admin ID
    });
    
    if (response.data.success) {
      // Refresh attendance data
      const attendanceRes = await api.get('/attendance.php');
      setAttendance(attendanceRes.data || []);
      alert(`✅ Attendance recorded: ${status} for ${studentName}`);
      fetchAllData();
    } else {
      alert('Error recording attendance');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error recording attendance');
  }
  
  setExcuseReason('');
  setShowExcuseModal(false);
  setOpenAttendanceRow(null);
  setShowEditAttendanceModal(false);
};

  const getFilteredStudents = () => {
    return students.filter(student => {
      const studentGrade = String(student.grade_level || '');
      const selectedGradeValue = String(selectedGrade);

      const matchesGrade = selectedGrade === 'all' || studentGrade === selectedGradeValue;

      let studentSection = student.section || '';
      studentSection = studentSection.trim();

      const matchesSection = selectedSection === 'all' || studentSection === selectedSection;

      const matchesSearch = searchTerm === '' ||
        (student.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.student_id_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.student_id || '').toLowerCase().includes(searchTerm.toLowerCase());

      return matchesGrade && matchesSection && matchesSearch;
    });
  };

  const filteredStudents = getFilteredStudents();
  const filteredGrades = grades.filter(grade => {
    const matchesGrade = selectedGrade === 'all' || grade.grade_level === selectedGrade;
    const matchesSection = selectedSection === 'all' || grade.section === selectedSection;
    return matchesGrade && matchesSection;
  });

  const filteredAttendance = attendance.filter(att => {
    const matchesGrade = selectedGrade === 'all' || att.grade_level === selectedGrade;
    const matchesSection = selectedSection === 'all' || att.section === selectedSection;
    const matchesDate = attendanceDate === '' || att.attendance_date === attendanceDate;
    return matchesGrade && matchesSection && matchesDate;
  });

  const getGradeStats = () => {
    const passed = grades.filter(g => g.remarks === 'Passed' || g.total_grade >= 75).length;
    const failed = grades.filter(g => g.remarks === 'Failed' || (g.total_grade > 0 && g.total_grade < 75)).length;
    const totalValid = grades.filter(g => g.total_grade > 0).length;
    const average = totalValid > 0
      ? (grades.filter(g => g.total_grade > 0).reduce((sum, g) => sum + (g.total_grade || 0), 0) / totalValid).toFixed(2)
      : 0;
    return { passed, failed, average };
  };

  const attendanceStats = {
    present: filteredAttendance.filter(a => a.status === 'Present').length,
    absent: filteredAttendance.filter(a => a.status === 'Absent').length,
    late: filteredAttendance.filter(a => a.status === 'Late').length,
    excused: filteredAttendance.filter(a => a.status === 'Excused').length,
    total: filteredAttendance.length,
    rate: filteredAttendance.length > 0
      ? ((filteredAttendance.filter(a => a.status === 'Present').length / filteredAttendance.length) * 100).toFixed(2)
      : 0
  };

  const gradeDistribution = {
    '90-100': filteredGrades.filter(g => g.total_grade >= 90).length,
    '80-89': filteredGrades.filter(g => g.total_grade >= 80 && g.total_grade < 90).length,
    '75-79': filteredGrades.filter(g => g.total_grade >= 75 && g.total_grade < 80).length,
    'Below 75': filteredGrades.filter(g => g.total_grade > 0 && g.total_grade < 75).length
  };

  const studentsPerGrade = {
    'Grade 7': students.filter(s => s.grade_level === '7').length,
    'Grade 8': students.filter(s => s.grade_level === '8').length,
    'Grade 9': students.filter(s => s.grade_level === '9').length,
    'Grade 10': students.filter(s => s.grade_level === '10').length
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'profile', label: 'My Profile', icon: '👤' },
    { id: 'teachers', label: 'Manage Teachers', icon: '👨‍🏫' },
    { id: 'students', label: 'Manage Students', icon: '🎓' },
    { id: 'student_details', label: 'Student Details', icon: '📋' },
    { id: 'grade_management', label: 'Grade Management', icon: '📝' },
    { id: 'attendance', label: 'Attendance', icon: '📅' },
    { id: 'announcements', label: 'Announcements', icon: '📢' },
    { id: 'reports', label: 'Reports', icon: '📊' },
    { id: 'teacher_reports', label: 'Teacher Reports', icon: '👨‍🏫📊' },
    { id: 'logout', label: 'Log-out', icon: '🚪' }
  ];

  const handleMenuClick = (itemId) => {
    if (itemId === 'logout') {
      onLogout();
    } else {
      setActiveTab(itemId);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px' }}>
        Loading dashboard data...
      </div>
    );
  }

  return (
    <div className="dashboard" style={{ display: 'flex', minHeight: '100vh', background: '#f0f2f5' }}>
      {/* SIDEBAR */}
      <div className="sidebar" style={{ width: '260px', background: '#2c3e50', color: 'white', position: 'fixed', height: '100vh', overflowY: 'auto' }}>
        <div style={{ padding: '20px', textAlign: 'center', borderBottom: '1px solid #34495e' }}>
          <h3 style={{ margin: 0 }}>📋 MENU</h3>
        </div>
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => handleMenuClick(item.id)}
            style={{
              width: '100%',
              padding: '14px 20px',
              textAlign: 'left',
              background: activeTab === item.id ? '#1abc9c' : 'transparent',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => { if (activeTab !== item.id) e.target.style.background = '#34495e'; }}
            onMouseLeave={(e) => { if (activeTab !== item.id) e.target.style.background = 'transparent'; }}
          >
            <span style={{ marginRight: '10px' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div style={{ marginLeft: '260px', flex: 1 }}>
        {/* NAVBAR */}
        <nav style={{ background: '#2c3e50', color: 'white', padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
          <div>
            <h2 style={{ margin: 0 }}>🏫 Admin Dashboard - Cabacao NHS</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span>👋 Welcome, {profile?.full_name || 'School Administrator'}</span>
            <button onClick={onLogout} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>🚪 Logout</button>
          </div>
        </nav>

        {/* CONTENT AREA */}
        <div style={{ padding: '25px' }}>

          {/* ========== DASHBOARD TAB ========== */}
          {activeTab === 'dashboard' && (
            <div>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '20px',
                padding: '30px',
                marginBottom: '25px',
                color: 'white'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div>
                    <h1 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>🏫 Cabacao NHS Admin Dashboard</h1>
                    <p style={{ margin: '0', fontSize: '16px', opacity: 0.95 }}>
                      👋 Welcome back, {profile?.full_name || 'School Administrator'}
                    </p>
                    <p style={{ margin: '5px 0 0 0', fontSize: '14px', opacity: 0.85 }}>
                      Monitor attendance, academic progress, and school performance in real time.
                    </p>
                    {profile?.motto && (
                      <p style={{ margin: '10px 0 0 0', fontSize: '14px', fontStyle: 'italic', opacity: 0.9 }}>
                        "{profile.motto}"
                      </p>
                    )}
                  </div>
                  <div style={{ fontSize: '60px' }}>📊</div>
                </div>
              </div>

              <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>📋 Dashboard Overview</h2>
              <p style={{ marginBottom: '20px', color: '#666' }}>Quick summary of school statistics and student records.</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>👨‍🏫</div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>Total Teachers</h3>
                  <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea', margin: 0 }}>{teachers.length}/12</p>
                  <small style={{ color: '#999' }}>Active registered teaching staff</small>
                </div>

                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎓</div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>Total Students</h3>
                  <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745', margin: 0 }}>{students.length}</p>
                  <small style={{ color: '#999' }}>Currently enrolled students (Grades 7–10)</small>
                </div>

                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>📊</div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>Average Grade</h3>
                  <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffc107', margin: 0 }}>{stats.averageGrade || '0'}%</p>
                  <small style={{ color: '#999' }}>Overall academic performance of enrolled students</small>
                </div>

                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>📅</div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>Attendance Rate</h3>
                  <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#17a2b8', margin: 0 }}>{attendanceStats.rate || '0'}%</p>
                  <small style={{ color: '#999' }}>School-wide attendance monitoring</small>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ marginBottom: '15px', color: '#2c3e50' }}>📊 Grade Distribution</h3>
                  <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>Student performance by grade bracket</p>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { range: '90-100%', count: gradeDistribution['90-100'] || 0 },
                      { range: '80-89%', count: gradeDistribution['80-89'] || 0 },
                      { range: '75-79%', count: gradeDistribution['75-79'] || 0 },
                      { range: 'Below 75%', count: gradeDistribution['Below 75'] || 0 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#667eea" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ marginBottom: '15px', color: '#2c3e50' }}>📅 Today's Attendance</h3>
                  <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>Daily attendance summary and student status</p>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Present', value: attendanceStats.present || 0, color: '#28a745' },
                          { name: 'Absent', value: attendanceStats.absent || 0, color: '#dc3545' },
                          { name: 'Late', value: attendanceStats.late || 0, color: '#ffc107' },
                          { name: 'Excused', value: attendanceStats.excused || 0, color: '#17a2b8' }
                        ]}
                        cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" label
                      >
                        {[
                          { name: 'Present', value: attendanceStats.present || 0, color: '#28a745' },
                          { name: 'Absent', value: attendanceStats.absent || 0, color: '#dc3545' },
                          { name: 'Late', value: attendanceStats.late || 0, color: '#ffc107' },
                          { name: 'Excused', value: attendanceStats.excused || 0, color: '#17a2b8' }
                        ].map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                borderRadius: '20px',
                padding: '25px',
                marginTop: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '32px' }}>💡</span>
                  <h3 style={{ margin: 0, color: '#e94560' }}>School Insights</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '15px', borderLeft: '4px solid #ffc107' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <span style={{ fontSize: '24px' }}>⚠️</span>
                      <strong style={{ color: '#ffc107' }}>Needs Improvement</strong>
                    </div>
                    <p style={{ margin: 0, color: '#ddd', fontSize: '14px' }}>
                      Attendance rate is below target. Consider implementing attendance incentives.
                    </p>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '15px', borderLeft: '4px solid #dc3545' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <span style={{ fontSize: '24px' }}>📉</span>
                      <strong style={{ color: '#dc3545' }}>Academic Performance</strong>
                    </div>
                    <p style={{ margin: 0, color: '#ddd', fontSize: '14px' }}>
                      Average grade is {stats.averageGrade}%. Target is 85%. Additional remedial classes may help.
                    </p>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '15px', borderLeft: '4px solid #28a745' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <span style={{ fontSize: '24px' }}>👥</span>
                      <strong style={{ color: '#28a745' }}>Enrollment Status</strong>
                    </div>
                    <p style={{ margin: 0, color: '#ddd', fontSize: '14px' }}>
                      Total enrollment: {students.length} students. Maintain this positive momentum.
                    </p>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '15px', borderLeft: '4px solid #17a2b8' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <span style={{ fontSize: '24px' }}>📋</span>
                      <strong style={{ color: '#17a2b8' }}>Teacher to Student Ratio</strong>
                    </div>
                    <p style={{ margin: 0, color: '#ddd', fontSize: '14px' }}>
                      {teachers.length} teachers managing {students.length} students. Ratio: {(students.length / teachers.length).toFixed(1)}:1
                    </p>
                  </div>
                </div>

                <div style={{ marginTop: '25px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  <button onClick={() => setActiveTab('attendance')} style={{ background: '#e94560', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>📅 View Attendance Details</button>
                  <button onClick={() => setActiveTab('grade_management')} style={{ background: '#667eea', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>📊 View Grade Reports</button>
                  <button onClick={() => setActiveTab('teacher_reports')} style={{ background: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>👨‍🏫 View Teacher Performance</button>
                </div>
              </div>
            </div>
          )}

          {/* ========== PROFILE TAB ========== - WITH BIO, MOTTO, AND PICTURE */}
          {activeTab === 'profile' && profile && (
            <div>
              <h2>👤 My Profile</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '25px' }}>
                {/* Profile Picture Section */}
                <div style={{ background: 'white', padding: '25px', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ marginBottom: '20px', position: 'relative' }}>
                    <img
                      src={profile.profile_picture || `https://ui-avatars.com/api/?background=667eea&color=fff&size=200&name=${encodeURIComponent(profile.full_name || 'Admin')}&bold=true`}
                      alt="Profile"
                      style={{ width: '180px', height: '180px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #667eea' }}
                    />
                    <button
                      onClick={() => setShowChangePictureModal(true)}
                      style={{ position: 'absolute', bottom: '10px', right: 'calc(50% - 90px)', background: '#667eea', color: 'white', border: 'none', borderRadius: '20px', padding: '5px 12px', fontSize: '12px', cursor: 'pointer' }}
                    >
                      📷 Change
                    </button>
                  </div>
                  <h3 style={{ margin: '10px 0 5px 0' }}>{profile.full_name}</h3>
                  <p style={{ color: '#667eea', fontWeight: 'bold', marginBottom: '15px' }}>{profile.position || 'School Administrator'}</p>
                  <p style={{ fontSize: '14px', color: '#666' }}>{profile.employee_id}</p>
                  {motto && (
                    <div style={{ marginTop: '15px', padding: '10px', background: '#f0f7ff', borderRadius: '8px', fontStyle: 'italic' }}>
                      <span style={{ color: '#667eea', fontWeight: 'bold' }}>💫 "{motto}"</span>
                    </div>
                  )}
                  <div style={{ marginTop: '15px', padding: '10px', background: '#e8f5e9', borderRadius: '8px' }}>
                    <span style={{ color: '#4caf50', fontWeight: 'bold' }}>🟢 Account Status: {profile.account_status || 'Active'}</span>
                  </div>
                </div>

                {/* Profile Information Section */}
                <div style={{ background: 'white', padding: '25px', borderRadius: '12px' }}>
                  <h3 style={{ marginBottom: '20px', color: '#2c3e50', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>🖼️ Profile Information</h3>
                  <form onSubmit={handleUpdateProfile}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                      <div><label style={{ fontWeight: 'bold', color: '#555' }}>Full Name:</label><p style={{ margin: '5px 0 0 0' }}>{profile.full_name}</p></div>
                      <div><label style={{ fontWeight: 'bold', color: '#555' }}>Position:</label><p style={{ margin: '5px 0 0 0' }}>{profile.position || 'School Administrator'}</p></div>
                      <div><label style={{ fontWeight: 'bold', color: '#555' }}>Employee ID:</label><p style={{ margin: '5px 0 0 0' }}>{profile.employee_id}</p></div>
                      <div><label style={{ fontWeight: 'bold', color: '#555' }}>Email:</label><p style={{ margin: '5px 0 0 0' }}>{profile.email}</p></div>
                      <div><label style={{ fontWeight: 'bold', color: '#555' }}>Contact Number:</label><p style={{ margin: '5px 0 0 0' }}>{profile.contact_number}</p></div>
                      <div><label style={{ fontWeight: 'bold', color: '#555' }}>Username:</label><p style={{ margin: '5px 0 0 0' }}>{profile.username}</p></div>
                      <div><label style={{ fontWeight: 'bold', color: '#555' }}>Role:</label><p style={{ margin: '5px 0 0 0' }}>System Administrator</p></div>
                      <div><label style={{ fontWeight: 'bold', color: '#555' }}>Department:</label><p style={{ margin: '5px 0 0 0' }}>{profile.department || 'School Administration Office'}</p></div>
                      <div><label style={{ fontWeight: 'bold', color: '#555' }}>Assigned School:</label><p style={{ margin: '5px 0 0 0' }}>{profile.assigned_school || 'Cabacao National High School'}</p></div>
                      <div><label style={{ fontWeight: 'bold', color: '#555' }}>School Year:</label><p style={{ margin: '5px 0 0 0' }}>{profile.school_year || '2025–2026'}</p></div>
                      <div><label style={{ fontWeight: 'bold', color: '#555' }}>Date Joined:</label><p style={{ margin: '5px 0 0 0' }}>{profile.date_joined}</p></div>
                      <div><label style={{ fontWeight: 'bold', color: '#555' }}>Last Login:</label><p style={{ margin: '5px 0 0 0' }}>{profile.last_login}</p></div>
                      <div><label style={{ fontWeight: 'bold', color: '#555' }}>Office Hours:</label><p style={{ margin: '5px 0 0 0' }}>{profile.office_hours}</p></div>
                      <div><label style={{ fontWeight: 'bold', color: '#555' }}>Address:</label><p style={{ margin: '5px 0 0 0' }}>{profile.address}</p></div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ fontWeight: 'bold', color: '#555' }}>📝 Bio:</label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '8px', minHeight: '80px' }}
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ fontWeight: 'bold', color: '#555' }}>💫 Personal / Professional Motto:</label>
                      <input
                        type="text"
                        value={motto}
                        onChange={(e) => setMotto(e.target.value)}
                        style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '8px' }}
                        placeholder="e.g., Lead with integrity, serve with excellence"
                      />
                    </div>

                    <h3 style={{ marginBottom: '15px', color: '#2c3e50', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>🔐 Account Settings</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                      <div><label style={{ fontWeight: 'bold', color: '#555' }}>Password Status:</label><p style={{ margin: '5px 0 0 0' }}>{profile.password_status}</p></div>
                      <div><label style={{ fontWeight: 'bold', color: '#555' }}>Two-Factor Authentication:</label><p style={{ margin: '5px 0 0 0', color: '#28a745' }}>✅ {profile.two_factor_auth}</p></div>
                      <div><label style={{ fontWeight: 'bold', color: '#555' }}>Recovery Email:</label><p style={{ margin: '5px 0 0 0' }}>{profile.recovery_email}</p></div>
                      <div><label style={{ fontWeight: 'bold', color: '#555' }}>Access Level:</label><p style={{ margin: '5px 0 0 0', color: '#667eea' }}>{profile.access_level}</p></div>
                    </div>

                    <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                      <button type="submit" style={{ background: '#28a745', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>💾 Update Profile</button>
                      <button type="button" style={{ background: '#ffc107', color: '#333', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>🔒 Change Password</button>
                    </div>

                    <h3 style={{ marginBottom: '15px', color: '#2c3e50', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>📌 Administrator Statistics</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                      <div style={{ textAlign: 'center', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                        <div style={{ fontSize: '28px' }}>👨‍🏫</div>
                        <div style={{ fontWeight: 'bold', fontSize: '20px' }}>{teachers.length}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Teachers Managed</div>
                      </div>
                      <div style={{ textAlign: 'center', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                        <div style={{ fontSize: '28px' }}>🎓</div>
                        <div style={{ fontWeight: 'bold', fontSize: '20px' }}>{students.length}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Students Monitored</div>
                      </div>
                      <div style={{ textAlign: 'center', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                        <div style={{ fontSize: '28px' }}>📅</div>
                        <div style={{ fontWeight: 'bold', fontSize: '20px' }}>{attendanceStats.present + attendanceStats.absent + attendanceStats.late}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Attendance Reports</div>
                      </div>
                      <div style={{ textAlign: 'center', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                        <div style={{ fontSize: '28px' }}>📊</div>
                        <div style={{ fontWeight: 'bold', fontSize: '20px' }}>{grades.length || 322}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Reports Generated</div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              {/* Change Picture Modal */}
              {showChangePictureModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                  <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '400px' }}>
                    <h3>Change Profile Picture</h3>
                    <input type="file" accept="image/*" onChange={handleProfilePictureChange} style={{ margin: '20px 0', display: 'block' }} />
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button onClick={() => setShowChangePictureModal(false)} style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========== MANAGE TEACHERS TAB ========== */}
          {activeTab === 'teachers' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>👨‍🏫 Manage Teachers</h2>
                <button onClick={() => setShowAddTeacherModal(true)} style={{ background: '#28a745', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>+ Add New Teacher</button>
              </div>
              <p><strong>Total Teachers:</strong> {teachers.length} out of 12 slots</p>
              {teachers.length > 0 ? (
                <div style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', padding: '20px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#667eea', color: 'white' }}>
                      <tr>
                        <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Teacher Name</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Advisory Class</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Motto</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teachers.map(teacher => (
                        <tr key={teacher.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '12px' }}>{teacher.id}</td>
                          <td style={{ padding: '12px' }}><strong>{teacher.full_name}</strong></td>
                          <td style={{ padding: '12px' }}>{teacher.email}</td>
                          <td style={{ padding: '12px' }}>{teacher.advisory_grade && teacher.advisory_section ? `Grade ${teacher.advisory_grade} - ${teacher.advisory_section}` : 'Not assigned'}</td>
                          <td style={{ padding: '12px', fontStyle: 'italic', color: '#666' }}>{teacher.motto || '—'}</td>
                          <td style={{ padding: '12px' }}><span style={{ background: '#d4edda', color: '#155724', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>Active</span></td>
                          <td style={{ padding: '12px' }}>
                            <button onClick={() => { setEditingTeacher(teacher); setShowEditTeacherModal(true); }} style={{ background: '#ffc107', color: '#333', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}>✏️ Edit</button>
                            <button onClick={() => { setSelectedTeacher(teacher); setShowMessageModal(true); }} style={{ background: '#17a2b8', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>💬 Message</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (<p>No teachers found. Click "Add New Teacher" to get started.</p>)}
            </div>
          )}

          {/* MANAGE STUDENTS TAB - Fixed View and Edit buttons */}
{activeTab === 'students' && (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
      <h2>🎓 Manage Students</h2>
      <button onClick={() => setShowAddStudentModal(true)} style={{ background: '#28a745', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
        + Add New Student
      </button>
    </div>

    {/* Filters */}
    <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', padding: '15px', background: 'white', borderRadius: '12px', flexWrap: 'wrap' }}>
      <input
        type="text"
        placeholder="🔍 Search by name or ID..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ flex: 2, padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
      />
      <select value={selectedGrade} onChange={(e) => { setSelectedGrade(e.target.value); setSelectedSection('all'); }} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', minWidth: '120px' }}>
        <option value="all">All Grades</option>
        <option value="7">Grade 7</option>
        <option value="8">Grade 8</option>
        <option value="9">Grade 9</option>
        <option value="10">Grade 10</option>
      </select>

      <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', minWidth: '140px' }}>
        <option value="all">All Sections</option>
        {getAvailableSections(selectedGrade).map(sec => (
          <option key={sec} value={sec}>{sec}</option>
        ))}
      </select>
    </div>

    <div style={{ background: 'white', borderRadius: '12px', padding: '20px', overflowX: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
        <h3 style={{ margin: 0 }}>Student List</h3>
        <span style={{ background: '#667eea', color: 'white', padding: '5px 12px', borderRadius: '20px', fontSize: '14px' }}>
          Total: {filteredStudents.length} students
        </span>
      </div>

      {filteredStudents.length > 0 ? (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#667eea', color: 'white' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Student ID</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Full Name</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Grade</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Section</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Gender</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Contact</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents
                .slice((currentPage - 1) * studentsPerPage, currentPage * studentsPerPage)
                .map(student => (
                  <tr key={student.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>
                      <code style={{ background: '#f5f5f5', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                        {student.student_id_number || student.student_id || 'N/A'}
                      </code>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <strong>{student.full_name || student.student_name}</strong>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ background: '#e3f2fd', color: '#1976d2', padding: '4px 10px', borderRadius: '20px', fontSize: '12px' }}>
                        Grade {student.grade_level}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ background: '#f3e5f5', color: '#7b1fa2', padding: '4px 10px', borderRadius: '20px', fontSize: '12px' }}>
                        {student.section || 'Not assigned'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>{student.gender || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>{student.contact_number || student.contact || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        background: student.enrollment_status === 'Enrolled' ? '#d4edda' : '#fff3cd',
                        color: student.enrollment_status === 'Enrolled' ? '#155724' : '#856404',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px'
                      }}>
                        {student.enrollment_status || 'Enrolled'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => { 
                          setEditingStudent(student); 
                          setShowEditStudentModal(true); 
                        }}
                        style={{ background: '#ffc107', color: '#333', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}
                        title="Edit Student"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => { 
                          setSelectedStudent(student); 
                          setShowStudentModal(true); 
                        }}
                        style={{ background: '#17a2b8', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        title="View Details"
                      >
                        👁️ View
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {/* Pagination */}
          {Math.ceil(filteredStudents.length / studentsPerPage) > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px', alignItems: 'center' }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{ padding: '8px 16px', background: currentPage === 1 ? '#ccc' : '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                ◀ Previous
              </button>
              <span style={{ padding: '8px 16px', background: '#f5f5f5', borderRadius: '6px' }}>
                Page {currentPage} of {Math.ceil(filteredStudents.length / studentsPerPage)}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredStudents.length / studentsPerPage), p + 1))}
                disabled={currentPage === Math.ceil(filteredStudents.length / studentsPerPage)}
                style={{ padding: '8px 16px', background: currentPage === Math.ceil(filteredStudents.length / studentsPerPage) ? '#ccc' : '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: currentPage === Math.ceil(filteredStudents.length / studentsPerPage) ? 'not-allowed' : 'pointer' }}
              >
                Next ▶
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>📭</div>
          <h4>No students found</h4>
          <p>Try adjusting your filters or click "Add New Student" to get started.</p>
        </div>
      )}
    </div>
  </div>
)}

          {/* ========== STUDENT DETAILS TAB ========== */}
          {activeTab === 'student_details' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>📋 Complete Student Information</h2>
                <button onClick={() => { setEditingStudent(null); setShowEditStudentModal(true); }} style={{ background: '#28a745', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>✏️ Edit Selected Student</button>
              </div>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', padding: '15px', background: 'white', borderRadius: '12px' }}>
                <input type="text" placeholder="Search student..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}>
                  <option value="all">All Grades</option><option value="7">Grade 7</option><option value="8">Grade 8</option><option value="9">Grade 9</option><option value="10">Grade 10</option>
                </select>
                <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}>
                  <option value="all">All Sections</option>
                  {getAvailableSections(selectedGrade).map(sec => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>
              </div>
              {filteredStudents.length > 0 ? (
                <div style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', padding: '20px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#667eea', color: 'white' }}>
                      <tr>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Student ID</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Full Name</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Grade</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Section</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Gender</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Contact</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Guardian</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Address</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map(student => (
                        <tr key={student.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '12px' }}>{student.student_id_number || student.student_id}</td>
                          <td style={{ padding: '12px' }}><strong>{student.full_name}</strong></td>
                          <td style={{ padding: '12px' }}>{student.grade_level}</td>
                          <td style={{ padding: '12px' }}>{student.section || 'Not assigned'}</td>
                          <td style={{ padding: '12px' }}>{student.gender || 'N/A'}</td>
                          <td style={{ padding: '12px' }}>{student.contact_number || student.contact || 'N/A'}</td>
                          <td style={{ padding: '12px' }}>{student.email || 'N/A'}</td>
                          <td style={{ padding: '12px' }}>{student.guardian || student.parent_name || 'N/A'}</td>
                          <td style={{ padding: '12px' }}>{student.address || 'N/A'}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <button onClick={() => { setEditingStudent(student); setShowEditStudentModal(true); }} style={{ background: '#ffc107', color: '#333', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>✏️ Edit</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (<p>No students found.</p>)}
            </div>
          )}

{/* ========== GRADE MANAGEMENT TAB - VIEW ONLY ========== */}
{activeTab === 'grade_management' && (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
      <h2>📝 Grade Management</h2>
      <div>
        <button 
          onClick={() => window.print()}
          style={{ background: '#17a2b8', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          🖨️ Print Report
        </button>
      </div>
    </div>
    
    {/* Admin Notice - View Only */}
    <div style={{ background: '#fff3cd', borderLeft: '4px solid #ffc107', padding: '12px 15px', marginBottom: '20px', borderRadius: '8px' }}>
      <strong>📌 Admin View Only:</strong> As an administrator, you can only VIEW grades. 
      Teachers are responsible for encoding and updating grades.
    </div>
    
    {/* Filters */}
    <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', padding: '15px', background: 'white', borderRadius: '12px', flexWrap: 'wrap' }}>
      <select value={selectedGrade} onChange={(e) => { setSelectedGrade(e.target.value); setSelectedSection('all'); }} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}>
        <option value="all">All Grades</option>
        <option value="7">Grade 7</option>
        <option value="8">Grade 8</option>
        <option value="9">Grade 9</option>
        <option value="10">Grade 10</option>
      </select>
      <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}>
        <option value="all">All Sections</option>
        {getAvailableSections(selectedGrade).map(sec => <option key={sec} value={sec}>{sec}</option>)}
      </select>
      <input type="text" placeholder="🔍 Search student..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 2, padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
    </div>
    
    {filteredStudents.length > 0 ? (
      <div style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', padding: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#667eea', color: 'white' }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left' }}>Student ID</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Student Name</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Grade & Section</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Subject</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Quiz</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Assignment</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Project</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Exam</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Total</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {filteredGrades.map((grade, index) => (
              <tr key={grade.id || index} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{grade.student_id_number || grade.student_id}</td>
                <td style={{ padding: '12px' }}><strong>{grade.student_name}</strong></td>
                <td style={{ padding: '12px' }}>Grade {grade.grade_level} - {grade.section}</td>
                <td style={{ padding: '12px' }}>{grade.subject_name}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>{grade.quiz_1 && grade.quiz_2 && grade.quiz_3 ? ((grade.quiz_1 + grade.quiz_2 + grade.quiz_3) / 3).toFixed(1) : grade.assignment || 0}%</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>{grade.assignment || 0}%</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>{grade.project || 0}%</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>{grade.exam || 0}%</td>
                <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: grade.total_grade >= 75 ? '#28a745' : '#dc3545' }}>{grade.total_grade || 0}%</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <span style={{ background: grade.remarks === 'Passed' ? '#d4edda' : '#f8d7da', color: grade.remarks === 'Passed' ? '#155724' : '#721c24', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>
                    {grade.remarks || (grade.total_grade >= 75 ? 'Passed' : 'Failed')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div style={{ textAlign: 'center', padding: '60px', color: '#999', background: 'white', borderRadius: '12px' }}>
        <div style={{ fontSize: '48px', marginBottom: '15px' }}>📭</div>
        <h4>No grade records found</h4>
        <p>Try adjusting your filters or wait for teachers to submit grades.</p>
      </div>
    )}
  </div>
)}
      {/* ========== ATTENDANCE TAB - VIEW ONLY ========== */}
{activeTab === 'attendance' && (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
      <h2>📅 Attendance Monitoring</h2>
      <div>
        <input 
          type="date" 
          value={attendanceDate} 
          onChange={(e) => setAttendanceDate(e.target.value)} 
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px' }} 
        />
        <button 
          onClick={() => fetchAllData()}
          style={{ marginLeft: '10px', background: '#17a2b8', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          🔄 Refresh
        </button>
      </div>
    </div>
    
    {/* Admin Notice - View Only */}
    <div style={{ background: '#fff3cd', borderLeft: '4px solid #ffc107', padding: '12px 15px', marginBottom: '20px', borderRadius: '8px' }}>
      <strong>📌 Admin View Only:</strong> As an administrator, you can only VIEW attendance records. 
      Teachers are responsible for marking attendance.
    </div>
    
    <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <tr>
            <th style={{ padding: '15px', textAlign: 'left' }}>Student Name</th>
            <th style={{ padding: '15px', textAlign: 'left' }}>Student ID</th>
            <th style={{ padding: '15px', textAlign: 'left' }}>Grade & Section</th>
            <th style={{ padding: '15px', textAlign: 'center' }}>Status</th>
            <th style={{ padding: '15px', textAlign: 'left' }}>Remarks</th>
            <th style={{ padding: '15px', textAlign: 'center' }}>Date</th>
          </tr>
        </thead>
        <tbody>
          {attendance.filter(a => a.attendance_date === attendanceDate).length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                📭 No attendance records found for {attendanceDate}
              </td>
            </tr>
          ) : (
            attendance.filter(a => a.attendance_date === attendanceDate).map((att, index) => (
              <tr key={att.id || index} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}><strong>{att.student_name || att.student?.full_name}</strong></td>
                <td style={{ padding: '12px' }}>{att.student_id_number || att.student_id}</td>
                <td style={{ padding: '12px' }}>Grade {att.grade_level} - {att.section}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <span style={{ 
                    background: att.status === 'Present' ? '#d4edda' : att.status === 'Absent' ? '#f8d7da' : att.status === 'Late' ? '#fff3cd' : '#e2e3e5',
                    color: att.status === 'Present' ? '#155724' : att.status === 'Absent' ? '#721c24' : att.status === 'Late' ? '#856404' : '#383d41',
                    padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold'
                  }}>
                    {att.status === 'Present' ? '✅ Present' : att.status === 'Absent' ? '❌ Absent' : att.status === 'Late' ? '⏰ Late' : '📝 ' + (att.status || 'Not Recorded')}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>{att.remarks || '—'}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>{att.attendance_date}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
)}
         {/* ========== ANNOUNCEMENTS TAB ========== */}
{activeTab === 'announcements' && (
  <div>
    <h2>📢 Announcements</h2>
    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
      <h3>Create New Announcement</h3>
      <form onSubmit={handleCreateAnnouncement}>
        <input 
          type="text" 
          placeholder="Announcement Title" 
          value={newAnnouncement.title} 
          onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} 
          required 
          style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '6px' }} 
        />
        <textarea 
          placeholder="Announcement Content" 
          value={newAnnouncement.content} 
          onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })} 
          required 
          rows="4" 
          style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '6px' }} 
        />
        
        {/* Target Audience Selection */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold', marginRight: '15px' }}>🎯 Target Audience:</label>
          <select 
            value={newAnnouncement.target_audience} 
            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, target_audience: e.target.value })}
            style={{ padding: '8px 15px', border: '1px solid #ddd', borderRadius: '6px' }}
          >
            <option value="all">👥 All (Teachers & Students)</option>
            <option value="teachers">👨‍🏫 Teachers Only</option>
            <option value="students">🎓 Students Only</option>
          </select>
          <small style={{ marginLeft: '10px', color: '#666' }}>
            {newAnnouncement.target_audience === 'all' && '📢 Visible to everyone'}
            {newAnnouncement.target_audience === 'teachers' && '👨‍🏫 Only teachers can see this'}
            {newAnnouncement.target_audience === 'students' && '🎓 Only students can see this'}
          </small>
        </div>
        
        <button type="submit" style={{ background: '#667eea', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          📢 Post Announcement
        </button>
      </form>
    </div>
    
    {/* Display announcements with target audience badge */}
    {announcements.length > 0 ? (
      announcements.map(ann => (
        <div key={ann.id} style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '10px' }}>
            <h3 style={{ margin: 0 }}>{ann.title}</h3>
            <span style={{ 
              background: ann.target_audience === 'all' ? '#667eea' : ann.target_audience === 'teachers' ? '#28a745' : '#17a2b8',
              color: 'white', 
              padding: '4px 12px', 
              borderRadius: '20px', 
              fontSize: '11px',
              fontWeight: 'bold'
            }}>
              {ann.target_audience === 'all' && '👥 All'}
              {ann.target_audience === 'teachers' && '👨‍🏫 Teachers Only'}
              {ann.target_audience === 'students' && '🎓 Students Only'}
            </span>
          </div>
          <p>{ann.content}</p>
          <small style={{ color: '#999' }}>Posted by: {ann.author_name} | {new Date(ann.created_at).toLocaleString()}</small>
        </div>
      ))
    ) : (
      <p>No announcements yet.</p>
    )}
  </div>
)}

          {/* ========== REPORTS TAB WITH MOTTO ========== */}
          {activeTab === 'reports' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2>📊 School Reports</h2>
                  <p style={{ color: '#666', marginTop: '5px' }}>
                    Academic Year: 2025–2026 | Last Updated: {new Date().toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => window.print()}
                  style={{ background: '#667eea', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  🖨️ Print Report
                </button>
              </div>

              {/* Stats Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎓</div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>Total Students</h3>
                  <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea', margin: 0 }}>{students.length}</p>
                  <small style={{ color: '#999' }}>Enrolled students (Grades 7–10)</small>
                </div>

                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>👨‍🏫</div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>Total Teachers</h3>
                  <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745', margin: 0 }}>{teachers.length}/12</p>
                  <small style={{ color: '#999' }}>Active teaching staff</small>
                </div>

                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>📊</div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>Overall Average</h3>
                  <p style={{ fontSize: '32px', fontWeight: 'bold', color: parseFloat(stats.averageGrade) < 75 ? '#dc3545' : '#28a745', margin: 0 }}>
                    {stats.averageGrade || '0'}%
                  </p>
                  <small style={{ color: '#999' }}>
                    {parseFloat(stats.averageGrade) < 75 ? '⚠️ Academic performance below benchmark' : '✅ Meeting academic standards'}
                  </small>
                </div>

                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>✅</div>        <h3 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>Passing Rate</h3>
                  <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#17a2b8', margin: 0 }}>{stats.passingRate || '0'}%</p>
                  <small style={{ color: '#999' }}>Students meeting passing criteria</small>
                </div>
              </div>

              {/* Charts Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ marginBottom: '15px', color: '#2c3e50' }}>📈 Student Population by Grade Level</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { grade: 'Grade 7', count: students.filter(s => s.grade_level === '7').length },
                      { grade: 'Grade 8', count: students.filter(s => s.grade_level === '8').length },
                      { grade: 'Grade 9', count: students.filter(s => s.grade_level === '9').length },
                      { grade: 'Grade 10', count: students.filter(s => s.grade_level === '10').length }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="grade" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#667eea" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ marginBottom: '15px', color: '#2c3e50' }}>📊 Academic Performance Distribution</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { range: '90-100%', count: gradeDistribution['90-100'] || 0 },
                      { range: '80-89%', count: gradeDistribution['80-89'] || 0 },
                      { range: '75-79%', count: gradeDistribution['75-79'] || 0 },
                      { range: 'Below 75%', count: gradeDistribution['Below 75'] || 0 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#28a745" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Executive Summary */}
              <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', borderRadius: '20px', padding: '25px', marginBottom: '30px' }}>
                <h3 style={{ color: 'white', marginBottom: '15px' }}>📌 Executive Summary</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                  <div><p style={{ color: '#ddd', fontSize: '14px' }}>Total Students</p><p style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>{students.length}</p></div>
                  <div><p style={{ color: '#ddd', fontSize: '14px' }}>Passing Rate</p><p style={{ color: stats.passingRate >= 75 ? '#28a745' : '#ffc107', fontSize: '24px', fontWeight: 'bold' }}>{stats.passingRate}%</p></div>
                  <div><p style={{ color: '#ddd', fontSize: '14px' }}>Attendance Rate</p><p style={{ color: attendanceStats.rate >= 90 ? '#28a745' : '#ffc107', fontSize: '24px', fontWeight: 'bold' }}>{attendanceStats.rate}%</p></div>
                  <div><p style={{ color: '#ddd', fontSize: '14px' }}>Teacher Ratio</p><p style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>{(students.length / teachers.length).toFixed(1)}:1</p></div>
                </div>
                <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <p style={{ color: '#ffc107', margin: 0, fontSize: '14px' }}>
                    {parseFloat(stats.averageGrade) < 75 ? '⚠️ Academic intervention recommended' : '✅ Academic performance is satisfactory'}
                  </p>
                </div>
              </div>

              {/* TOP PERFORMING SECTIONS WITH MOTTO */}
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>🏆 Top Performing Sections</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#667eea', color: 'white' }}>
                      <tr>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Rank</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Section</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Adviser</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>💫 Teacher's Motto</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Avg Grade</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Passing Rate</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Attendance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teacherReports
                        .sort((a, b) => parseFloat(b.average_grade) - parseFloat(a.average_grade))
                        .slice(0, 5)
                        .map((teacher, index) => (
                          <tr key={teacher.teacher_id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '12px' }}>
                              {index === 0 ? '🥇 1st' : index === 1 ? '🥈 2nd' : index === 2 ? '🥉 3rd' : `${index + 1}th`}
                            </td>
                            <td style={{ padding: '12px' }}>
                              <strong>Grade {teacher.advisory_grade} - {teacher.advisory_section}</strong>
                            </td>
                            <td style={{ padding: '12px' }}>{teacher.teacher_name}</td>
                            <td style={{ padding: '12px', fontStyle: 'italic', color: '#667eea', maxWidth: '250px' }}>
                              <span style={{ fontSize: '14px' }}>💬 "{teacher.motto || teacher.teacher_motto || 'Teaching with passion, leading with purpose'}"</span>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <strong style={{ color: teacher.average_grade >= 85 ? '#28a745' : teacher.average_grade >= 75 ? '#ffc107' : '#dc3545' }}>
                                {teacher.average_grade}%
                              </strong>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <span style={{ background: teacher.passing_rate >= 80 ? '#d4edda' : '#fff3cd', color: teacher.passing_rate >= 80 ? '#155724' : '#856404', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>
                                {teacher.passing_rate}%
                              </span>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <span style={{ background: teacher.attendance_rate >= 90 ? '#d4edda' : '#fff3cd', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>
                                {teacher.attendance_rate}%
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Attendance Summary */}
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>📅 Attendance Summary</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', textAlign: 'center' }}>
                  <div style={{ padding: '15px', background: '#d4edda', borderRadius: '10px' }}>
                    <div style={{ fontSize: '32px' }}>✅</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#155724' }}>{attendanceStats.present || 0}</div>
                    <div style={{ fontSize: '12px', color: '#155724' }}>Present</div>
                  </div>
                  <div style={{ padding: '15px', background: '#f8d7da', borderRadius: '10px' }}>
                    <div style={{ fontSize: '32px' }}>❌</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#721c24' }}>{attendanceStats.absent || 0}</div>
                    <div style={{ fontSize: '12px', color: '#721c24' }}>Absent</div>
                  </div>
                  <div style={{ padding: '15px', background: '#fff3cd', borderRadius: '10px' }}>
                    <div style={{ fontSize: '32px' }}>⏰</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#856404' }}>{attendanceStats.late || 0}</div>
                    <div style={{ fontSize: '12px', color: '#856404' }}>Late</div>
                  </div>
                  <div style={{ padding: '15px', background: '#d1ecf1', borderRadius: '10px' }}>
                    <div style={{ fontSize: '32px' }}>📝</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0c5460' }}>{attendanceStats.excused || 0}</div>
                    <div style={{ fontSize: '12px', color: '#0c5460' }}>Excused</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========== TEACHER REPORTS TAB ========== */}
          {activeTab === 'teacher_reports' && (
            <div>
              <h2>👨‍🏫 Teacher Performance Reports</h2>
              <p style={{ marginBottom: '20px', color: '#666' }}>Individual performance reports for all teachers. Click on any teacher card to view detailed report.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
                {teacherReports.map(teacher => (
                  <div key={teacher.teacher_id} style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', cursor: 'pointer', border: selectedTeacherReport?.teacher_id === teacher.teacher_id ? '3px solid #1abc9c' : '1px solid #e0e0e0' }} onClick={() => setSelectedTeacherReport(teacher)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <h3 style={{ margin: 0, fontSize: '18px', color: '#2c3e50' }}>{teacher.teacher_name}</h3>
                      <span style={{ background: '#667eea', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' }}>{teacher.advisory_class}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '15px' }}>
                      <div style={{ textAlign: 'center' }}><div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>{teacher.total_students}</div><div style={{ fontSize: '11px', color: '#999' }}>Students</div></div>
                      <div style={{ textAlign: 'center' }}><div style={{ fontSize: '24px', fontWeight: 'bold', color: teacher.average_grade >= 75 ? '#28a745' : '#dc3545' }}>{teacher.average_grade}%</div><div style={{ fontSize: '11px', color: '#999' }}>Average Grade</div></div>
                      <div style={{ textAlign: 'center' }}><div style={{ fontSize: '24px', fontWeight: 'bold', color: teacher.passing_rate >= 75 ? '#28a745' : '#dc3545' }}>{teacher.passing_rate}%</div><div style={{ fontSize: '11px', color: '#999' }}>Passing Rate</div></div>
                      <div style={{ textAlign: 'center' }}><div style={{ fontSize: '24px', fontWeight: 'bold', color: '#17a2b8' }}>{teacher.attendance_rate}%</div><div style={{ fontSize: '11px', color: '#999' }}>Attendance</div></div>
                    </div>
                    <div style={{ marginTop: '10px' }}>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Performance Score</div>
                      <div style={{ height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${(parseFloat(teacher.average_grade) + parseFloat(teacher.attendance_rate)) / 2}%`, height: '100%', background: 'linear-gradient(90deg, #667eea, #764ba2)', borderRadius: '4px' }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {selectedTeacherReport && (
                <div style={{ background: 'white', borderRadius: '12px', padding: '25px', marginTop: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                    <div><h3 style={{ margin: 0, color: '#2c3e50' }}>📋 Detailed Report: {selectedTeacherReport.teacher_name}</h3><p style={{ margin: '5px 0 0 0', color: '#666' }}>{selectedTeacherReport.advisory_class}</p></div>
                    <button onClick={() => setSelectedTeacherReport(null)} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Close Report</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '25px' }}>
                    <div style={{ textAlign: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}><div style={{ fontSize: '28px', fontWeight: 'bold', color: '#667eea' }}>{selectedTeacherReport.total_students}</div><div style={{ fontSize: '12px', color: '#666' }}>Total Students</div></div>
                    <div style={{ textAlign: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}><div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ffc107' }}>{selectedTeacherReport.average_grade}%</div><div style={{ fontSize: '12px', color: '#666' }}>Average Grade</div></div>
                    <div style={{ textAlign: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}><div style={{ fontSize: '28px', fontWeight: 'bold', color: '#28a745' }}>{selectedTeacherReport.passing_rate}%</div><div style={{ fontSize: '12px', color: '#666' }}>Passing Rate</div></div>
                    <div style={{ textAlign: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}><div style={{ fontSize: '28px', fontWeight: 'bold', color: '#17a2b8' }}>{selectedTeacherReport.attendance_rate}%</div><div style={{ fontSize: '12px', color: '#666' }}>Attendance Rate</div></div>
                  </div>
                  <div style={{ marginBottom: '25px' }}>
                    <h4>📊 Grade Distribution</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={[
                        { range: '90-100%', count: selectedTeacherReport.grade_distribution['90-100'] },
                        { range: '80-89%', count: selectedTeacherReport.grade_distribution['80-89'] },
                        { range: '75-79%', count: selectedTeacherReport.grade_distribution['75-79'] },
                        { range: 'Below 75%', count: selectedTeacherReport.grade_distribution['Below 75'] }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#667eea" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <h4>📝 Student Grades</h4>
                  <div style={{ overflowX: 'auto', maxHeight: '400px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ background: '#f8f9fa', position: 'sticky', top: 0 }}>
                        <tr>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Student Name</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Subject</th>
                          <th style={{ padding: '12px', textAlign: 'center' }}>Assignment</th>
                          <th style={{ padding: '12px', textAlign: 'center' }}>Project</th>
                          <th style={{ padding: '12px', textAlign: 'center' }}>Exam</th>
                          <th style={{ padding: '12px', textAlign: 'center' }}>Total</th>
                          <th style={{ padding: '12px', textAlign: 'center' }}>Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedTeacherReport.grades.map(grade => (
                          <tr key={grade.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '10px' }}>{grade.student_name}</td>
                            <td style={{ padding: '10px' }}>{grade.subject_name}</td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>{grade.assignment}%</td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>{grade.project}%</td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>{grade.exam}%</td>
                            <td style={{ padding: '10px', textAlign: 'center' }}><strong>{grade.total_grade}%</strong></td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>
                              <span style={{ background: grade.remarks === 'Passed' ? '#d4edda' : '#f8d7da', color: grade.remarks === 'Passed' ? '#155724' : '#721c24', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>{grade.remarks}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ADD TEACHER MODAL */}
      {showAddTeacherModal && (
        <div className="modal-overlay" onClick={() => setShowAddTeacherModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal large-modal-scroll" onClick={(e) => e.stopPropagation()} style={{ background: 'white', borderRadius: '12px', width: '90%', maxWidth: '800px', maxHeight: '85vh', overflowY: 'auto', padding: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
              <h3 style={{ margin: 0, color: '#1a1a2e' }}>➕ Add New Teacher</h3>
              <button onClick={() => setShowAddTeacherModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999' }}>✕</button>
            </div>
            <form onSubmit={handleAddTeacher}>
              <div className="form-section">
                <h4>📚 Academic Information</h4>
                <div className="form-row">
                  <div className="form-group"><label>School Year Graduated:</label><input type="text" value={newTeacher.school_year_graduated} onChange={(e) => setNewTeacher({ ...newTeacher, school_year_graduated: e.target.value })} placeholder="e.g., 2020-2021" /></div>
                  <div className="form-group"><label>Year/Level to Teach:</label><select value={newTeacher.year} onChange={(e) => setNewTeacher({ ...newTeacher, year: e.target.value })} required><option value="">Select Grade Level</option><option value="7">Grade 7</option><option value="8">Grade 8</option><option value="9">Grade 9</option><option value="10">Grade 10</option></select></div>
                </div>
              </div>
              <div className="form-section">
                <h4>👤 Personal Information</h4>
                <div className="form-row">
                  <div className="form-group"><label>First Name:</label><input type="text" value={newTeacher.first_name} onChange={(e) => setNewTeacher({ ...newTeacher, first_name: e.target.value })} required /></div>
                  <div className="form-group"><label>Middle Name:</label><input type="text" value={newTeacher.middle_name} onChange={(e) => setNewTeacher({ ...newTeacher, middle_name: e.target.value })} /></div>
                  <div className="form-group"><label>Last Name:</label><input type="text" value={newTeacher.last_name} onChange={(e) => setNewTeacher({ ...newTeacher, last_name: e.target.value })} required /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Date of Birth:</label><input type="date" value={newTeacher.date_of_birth} onChange={(e) => setNewTeacher({ ...newTeacher, date_of_birth: e.target.value })} /></div>
                  <div className="form-group"><label>Place of Birth:</label><input type="text" value={newTeacher.place_of_birth} onChange={(e) => setNewTeacher({ ...newTeacher, place_of_birth: e.target.value })} /></div>
                  <div className="form-group"><label>Age:</label><input type="number" value={newTeacher.age} onChange={(e) => setNewTeacher({ ...newTeacher, age: e.target.value })} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Gender:</label><select value={newTeacher.gender} onChange={(e) => setNewTeacher({ ...newTeacher, gender: e.target.value })}><option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option></select></div>
                  <div className="form-group"><label>Status:</label><select value={newTeacher.status} onChange={(e) => setNewTeacher({ ...newTeacher, status: e.target.value })}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
                  <div className="form-group"><label>Religion:</label><input type="text" value={newTeacher.religion} onChange={(e) => setNewTeacher({ ...newTeacher, religion: e.target.value })} /></div>
                </div>
                <div className="form-group"><label>Address:</label><textarea value={newTeacher.address} onChange={(e) => setNewTeacher({ ...newTeacher, address: e.target.value })} rows="2" /></div>
                <div className="form-group"><label>💫 Personal Motto:</label><input type="text" value={newTeacher.motto} onChange={(e) => setNewTeacher({ ...newTeacher, motto: e.target.value })} placeholder="e.g., Empowering minds, shaping futures" /></div>
              </div>
              <div className="form-section">
                <h4>📞 Contact Information</h4>
                <div className="form-row">
                  <div className="form-group"><label>Email:</label><input type="email" value={newTeacher.email} onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })} required /></div>
                  <div className="form-group"><label>Contact Number:</label><input type="text" value={newTeacher.contact} onChange={(e) => setNewTeacher({ ...newTeacher, contact: e.target.value })} /></div>
                </div>
              </div>
              <div className="modal-buttons">
                <button type="button" onClick={() => setShowAddTeacherModal(false)} className="cancel-btn">Cancel</button>
                <button type="submit" className="save-btn">💾 Save Teacher</button>
              </div>
            </form>
          </div>
        </div>
      )}
      

      {/* ADD STUDENT MODAL */}
      {showAddStudentModal && (
        <div className="modal-overlay" onClick={() => setShowAddStudentModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal large-modal-scroll" onClick={(e) => e.stopPropagation()} style={{ background: 'white', borderRadius: '12px', width: '90%', maxWidth: '900px', maxHeight: '85vh', overflowY: 'auto', padding: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
              <h3 style={{ margin: 0, color: '#1a1a2e' }}>🎓 Add New Student</h3>
              <button onClick={() => setShowAddStudentModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999' }}>✕</button>
            </div>
            <form onSubmit={handleAddStudent}>
              <div className="form-section">
                <h4>📋 School Information</h4>
                <div className="form-row">
                  <div className="form-group"><label>Student ID:</label><input type="text" value={newStudent.student_id} onChange={(e) => setNewStudent({ ...newStudent, student_id: e.target.value })} required placeholder="e.g., 2024-10001" /></div>
                  <div className="form-group"><label>School Year:</label><input type="text" value={newStudent.school_year} onChange={(e) => setNewStudent({ ...newStudent, school_year: e.target.value })} placeholder="e.g., 2024-2025" /></div>
                  <div className="form-group"><label>Year Level:</label><select value={newStudent.year} onChange={(e) => setNewStudent({ ...newStudent, year: e.target.value })} required><option value="">Select Grade</option><option value="7">Grade 7</option><option value="8">Grade 8</option><option value="9">Grade 9</option><option value="10">Grade 10</option></select></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Section:</label><select value={newStudent.section} onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value })} required><option value="">Select Section</option>{sectionsByGrade[newStudent.year]?.map(sec => <option key={sec} value={sec}>{sec}</option>)}</select></div>
                  <div className="form-group"><label>Status:</label><select value={newStudent.status} onChange={(e) => setNewStudent({ ...newStudent, status: e.target.value })}><option value="Enrolled">Enrolled</option><option value="Pending">Pending</option><option value="Dropped">Dropped</option></select></div>
                </div>
              </div>
              <div className="form-section">
                <h4>👤 Personal Information</h4>
                <div className="form-row">
                  <div className="form-group"><label>First Name:</label><input type="text" value={newStudent.first_name} onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })} required /></div>
                  <div className="form-group"><label>Middle Name:</label><input type="text" value={newStudent.middle_name} onChange={(e) => setNewStudent({ ...newStudent, middle_name: e.target.value })} /></div>
                  <div className="form-group"><label>Last Name:</label><input type="text" value={newStudent.last_name} onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })} required /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Date of Birth:</label><input type="date" value={newStudent.date_of_birth} onChange={(e) => setNewStudent({ ...newStudent, date_of_birth: e.target.value })} /></div>
                  <div className="form-group"><label>Place of Birth:</label><input type="text" value={newStudent.place_of_birth} onChange={(e) => setNewStudent({ ...newStudent, place_of_birth: e.target.value })} /></div>
                  <div className="form-group"><label>Age:</label><input type="number" value={newStudent.age} onChange={(e) => setNewStudent({ ...newStudent, age: e.target.value })} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Gender:</label><select value={newStudent.gender} onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value })}><option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option></select></div>
                  <div className="form-group"><label>Religion:</label><input type="text" value={newStudent.religion} onChange={(e) => setNewStudent({ ...newStudent, religion: e.target.value })} /></div>
                </div>
                <div className="form-group"><label>Address:</label><textarea value={newStudent.address} onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })} rows="2" /></div>
              </div>
              <div className="form-section">
                <h4>👪 Guardian Information</h4>
                <div className="form-row">
                  <div className="form-group"><label>Guardian Name:</label><input type="text" value={newStudent.guardian} onChange={(e) => setNewStudent({ ...newStudent, guardian: e.target.value })} /></div>
                  <div className="form-group"><label>Relation:</label><input type="text" value={newStudent.relation} onChange={(e) => setNewStudent({ ...newStudent, relation: e.target.value })} /></div>
                  <div className="form-group"><label>Contact:</label><input type="text" value={newStudent.contact} onChange={(e) => setNewStudent({ ...newStudent, contact: e.target.value })} /></div>
                </div>
                <div className="form-group"><label>Email:</label><input type="email" value={newStudent.email} onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })} /></div>
              </div>
              <div className="modal-buttons">
                <button type="button" onClick={() => setShowAddStudentModal(false)} className="cancel-btn">Cancel</button>
                <button type="submit" className="save-btn">💾 Save Student</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Student View Modal - Show full student details */}
{showStudentModal && selectedStudent && (
  <div className="modal-overlay" onClick={() => setShowStudentModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ background: 'white', borderRadius: '16px', width: '90%', maxWidth: '700px', maxHeight: '85vh', overflowY: 'auto', padding: '25px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
        <h2 style={{ margin: 0, color: '#2c3e50' }}>👤 Student Details</h2>
        <button onClick={() => setShowStudentModal(false)} style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#999' }}>✕</button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
        <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '10px' }}>
          <strong style={{ color: '#667eea' }}>📋 Student ID:</strong>
          <p style={{ margin: '5px 0 0' }}>{selectedStudent.student_id_number || 'N/A'}</p>
        </div>
        <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '10px' }}>
          <strong style={{ color: '#667eea' }}>🎓 LRN:</strong>
          <p style={{ margin: '5px 0 0' }}>{selectedStudent.lrn || 'N/A'}</p>
        </div>
        <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '10px' }}>
          <strong style={{ color: '#667eea' }}>📛 Full Name:</strong>
          <p style={{ margin: '5px 0 0', fontWeight: 'bold' }}>{selectedStudent.full_name}</p>
        </div>
        <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '10px' }}>
          <strong style={{ color: '#667eea' }}>📧 Email:</strong>
          <p style={{ margin: '5px 0 0' }}>{selectedStudent.email || 'N/A'}</p>
        </div>
        <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '10px' }}>
          <strong style={{ color: '#667eea' }}>📚 Grade Level:</strong>
          <p style={{ margin: '5px 0 0' }}>{selectedStudent.grade_level}</p>
        </div>
        <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '10px' }}>
          <strong style={{ color: '#667eea' }}>🏫 Section:</strong>
          <p style={{ margin: '5px 0 0' }}>{selectedStudent.section}</p>
        </div>
        <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '10px' }}>
          <strong style={{ color: '#667eea' }}>⚥ Gender:</strong>
          <p style={{ margin: '5px 0 0' }}>{selectedStudent.gender || 'N/A'}</p>
        </div>
        <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '10px' }}>
          <strong style={{ color: '#667eea' }}>📞 Contact Number:</strong>
          <p style={{ margin: '5px 0 0' }}>{selectedStudent.contact_number || 'N/A'}</p>
        </div>
        <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '10px' }}>
          <strong style={{ color: '#667eea' }}>👪 Guardian Name:</strong>
          <p style={{ margin: '5px 0 0' }}>{selectedStudent.guardian_name || selectedStudent.guardian || 'N/A'}</p>
        </div>
        <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '10px' }}>
          <strong style={{ color: '#667eea' }}>🏠 Address:</strong>
          <p style={{ margin: '5px 0 0' }}>{selectedStudent.address || 'N/A'}</p>
        </div>
        <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '10px' }}>
          <strong style={{ color: '#667eea' }}>📅 Birth Date:</strong>
          <p style={{ margin: '5px 0 0' }}>{selectedStudent.birth_date || 'N/A'}</p>
        </div>
        <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '10px' }}>
          <strong style={{ color: '#667eea' }}>📌 Status:</strong>
          <p style={{ margin: '5px 0 0' }}>
            <span style={{ background: selectedStudent.enrollment_status === 'Enrolled' ? '#d4edda' : '#fff3cd', color: selectedStudent.enrollment_status === 'Enrolled' ? '#155724' : '#856404', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>
              {selectedStudent.enrollment_status || 'Enrolled'}
            </span>
          </p>
        </div>
      </div>
      
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button onClick={() => setShowStudentModal(false)} style={{ background: '#6c757d', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Close</button>
        <button onClick={() => { setShowStudentModal(false); setEditingStudent(selectedStudent); setShowEditStudentModal(true); }} style={{ background: '#ffc107', color: '#333', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>✏️ Edit Student</button>
      </div>
    </div>
  </div>
)}

      {/* EDIT STUDENT MODAL */}
      {showEditStudentModal && editingStudent && (
        <div className="modal-overlay" onClick={() => setShowEditStudentModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal large-modal-scroll" onClick={(e) => e.stopPropagation()} style={{ background: 'white', borderRadius: '12px', width: '90%', maxWidth: '900px', maxHeight: '85vh', overflowY: 'auto', padding: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
              <h3 style={{ margin: 0, color: '#1a1a2e' }}>✏️ Edit Student</h3>
              <button onClick={() => setShowEditStudentModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999' }}>✕</button>
            </div>
            <form onSubmit={handleUpdateStudent}>
              <div className="form-section">
                <h4>📋 School Information</h4>
                <div className="form-row">
                  <div className="form-group"><label>Student ID:</label><input type="text" value={editingStudent.student_id_number || ''} onChange={(e) => setEditingStudent({ ...editingStudent, student_id_number: e.target.value })} required /></div>
                  <div className="form-group"><label>LRN:</label><input type="text" value={editingStudent.lrn || ''} onChange={(e) => setEditingStudent({ ...editingStudent, lrn: e.target.value })} /></div>
                  <div className="form-group"><label>School Year:</label><input type="text" value={editingStudent.school_year || ''} onChange={(e) => setEditingStudent({ ...editingStudent, school_year: e.target.value })} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Grade Level:</label><select value={editingStudent.grade_level || ''} onChange={(e) => setEditingStudent({ ...editingStudent, grade_level: e.target.value })} required><option value="">Select Grade</option><option value="7">Grade 7</option><option value="8">Grade 8</option><option value="9">Grade 9</option><option value="10">Grade 10</option></select></div>
                  <div className="form-group"><label>Section:</label><select value={editingStudent.section || ''} onChange={(e) => setEditingStudent({ ...editingStudent, section: e.target.value })} required><option value="">Select Section</option>{sectionsByGrade[editingStudent.grade_level]?.map(sec => <option key={sec} value={sec}>{sec}</option>)}</select></div>
                  <div className="form-group"><label>Enrollment Status:</label><select value={editingStudent.enrollment_status || 'Enrolled'} onChange={(e) => setEditingStudent({ ...editingStudent, enrollment_status: e.target.value })}><option value="Enrolled">Enrolled</option><option value="Pending">Pending</option><option value="Dropped">Dropped</option><option value="Graduated">Graduated</option></select></div>
                </div>
              </div>
              <div className="form-section">
                <h4>👤 Personal Information</h4>
                <div className="form-row">
                  <div className="form-group"><label>Full Name:</label><input type="text" value={editingStudent.full_name || ''} onChange={(e) => setEditingStudent({ ...editingStudent, full_name: e.target.value })} required /></div>
                  <div className="form-group"><label>Gender:</label><select value={editingStudent.gender || ''} onChange={(e) => setEditingStudent({ ...editingStudent, gender: e.target.value })}><option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option></select></div>
                  <div className="form-group"><label>Birth Date:</label><input type="date" value={editingStudent.birth_date || ''} onChange={(e) => setEditingStudent({ ...editingStudent, birth_date: e.target.value })} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Birth Place:</label><input type="text" value={editingStudent.birth_place || ''} onChange={(e) => setEditingStudent({ ...editingStudent, birth_place: e.target.value })} /></div>
                  <div className="form-group"><label>Religion:</label><input type="text" value={editingStudent.religion || ''} onChange={(e) => setEditingStudent({ ...editingStudent, religion: e.target.value })} /></div>
                  <div className="form-group"><label>Citizenship:</label><input type="text" value={editingStudent.citizenship || ''} onChange={(e) => setEditingStudent({ ...editingStudent, citizenship: e.target.value })} /></div>
                </div>
                <div className="form-group"><label>Address:</label><textarea value={editingStudent.address || ''} onChange={(e) => setEditingStudent({ ...editingStudent, address: e.target.value })} rows="2" /></div>
              </div>
              <div className="form-section">
                <h4>📞 Contact Information</h4>
                <div className="form-row">
                  <div className="form-group"><label>Email:</label><input type="email" value={editingStudent.email || ''} onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })} /></div>
                  <div className="form-group"><label>Contact Number:</label><input type="text" value={editingStudent.contact_number || ''} onChange={(e) => setEditingStudent({ ...editingStudent, contact_number: e.target.value })} /></div>
                </div>
              </div>
              <div className="form-section">
                <h4>👪 Guardian Information</h4>
                <div className="form-row">
                  <div className="form-group"><label>Guardian Name:</label><input type="text" value={editingStudent.guardian_name || ''} onChange={(e) => setEditingStudent({ ...editingStudent, guardian_name: e.target.value })} /></div>
                  <div className="form-group"><label>Relationship:</label><input type="text" value={editingStudent.guardian_relationship || ''} onChange={(e) => setEditingStudent({ ...editingStudent, guardian_relationship: e.target.value })} /></div>
                  <div className="form-group"><label>Guardian Contact:</label><input type="text" value={editingStudent.guardian_contact || ''} onChange={(e) => setEditingStudent({ ...editingStudent, guardian_contact: e.target.value })} /></div>
                </div>
              </div>
              <div className="modal-buttons">
                <button type="button" onClick={() => setShowEditStudentModal(false)} className="cancel-btn">Cancel</button>
                <button type="submit" className="save-btn">💾 Update Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TEACHER MODAL */}
      {showEditTeacherModal && editingTeacher && (
        <div className="modal-overlay" onClick={() => setShowEditTeacherModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ background: 'white', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '85vh', overflowY: 'auto', padding: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>✏️ Edit Teacher</h3>
              <button onClick={() => setShowEditTeacherModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleUpdateTeacher}>
              <div className="form-group"><label>Full Name:</label><input type="text" value={editingTeacher.full_name} onChange={(e) => setEditingTeacher({ ...editingTeacher, full_name: e.target.value })} required /></div>
              <div className="form-group"><label>Email:</label><input type="email" value={editingTeacher.email} onChange={(e) => setEditingTeacher({ ...editingTeacher, email: e.target.value })} required /></div>
              <div className="form-group"><label>Contact:</label><input type="text" value={editingTeacher.contact_number} onChange={(e) => setEditingTeacher({ ...editingTeacher, contact_number: e.target.value })} /></div>
              <div className="form-group"><label>Address:</label><textarea value={editingTeacher.address} onChange={(e) => setEditingTeacher({ ...editingTeacher, address: e.target.value })} rows="2" /></div>
              <div className="form-group"><label>💫 Motto:</label><input type="text" value={editingTeacher.motto || ''} onChange={(e) => setEditingTeacher({ ...editingTeacher, motto: e.target.value })} placeholder="Personal motto..." /></div>
              <div className="form-row">
                <div className="form-group"><label>Advisory Grade:</label><select value={editingTeacher.advisory_grade} onChange={(e) => setEditingTeacher({ ...editingTeacher, advisory_grade: e.target.value })}><option value="7">Grade 7</option><option value="8">Grade 8</option><option value="9">Grade 9</option><option value="10">Grade 10</option></select></div>
                <div className="form-group"><label>Advisory Section:</label><select value={editingTeacher.advisory_section} onChange={(e) => setEditingTeacher({ ...editingTeacher, advisory_section: e.target.value })}><option value="Orchid">Orchid</option><option value="Rose">Rose</option><option value="Sampaguita">Sampaguita</option><option value="Sunflower">Sunflower</option><option value="Acacia">Acacia</option><option value="Mulawin">Mulawin</option><option value="Narra">Narra</option><option value="Kamagong">Kamagong</option><option value="Mahogany">Mahogany</option><option value="Molave">Molave</option></select></div>
              </div>
              <div className="form-group"><label>Status:</label><select value={editingTeacher.status} onChange={(e) => setEditingTeacher({ ...editingTeacher, status: e.target.value })}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
              <div className="modal-buttons">
                <button type="button" onClick={() => setShowEditTeacherModal(false)} className="cancel-btn">Cancel</button>
                <button type="submit" className="save-btn">💾 Update Teacher</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MESSAGE MODAL */}
      {showMessageModal && selectedTeacher && (
        <div className="modal-overlay" onClick={() => setShowMessageModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ background: 'white', borderRadius: '12px', width: '90%', maxWidth: '500px', padding: '25px' }}>
            <h3>💬 Send Message to {selectedTeacher.full_name}</h3>
            <form onSubmit={handleSendMessage}>
              <div className="form-group"><label>Subject:</label><input type="text" value={newMessage.subject} onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })} required /></div>
              <div className="form-group"><label>Message:</label><textarea value={newMessage.message} onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })} rows="5" required /></div>
              <div className="modal-buttons">
                <button type="button" onClick={() => setShowMessageModal(false)} className="cancel-btn">Cancel</button>
                <button type="submit" className="save-btn">📤 Send Message</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Add styles to document
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  .form-section {
    margin-bottom: 25px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
  }
  .form-section h4 {
    margin: 0 0 15px 0;
    color: #2c3e50;
    border-left: 4px solid #667eea;
    padding-left: 10px;
  }
  .form-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 15px;
  }
  .form-group {
    display: flex;
    flex-direction: column;
  }
  .form-group label {
    margin-bottom: 5px;
    font-weight: 600;
    font-size: 13px;
    color: #555;
  }
  .form-group input, .form-group select, .form-group textarea {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
  }
  .modal-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid #eee;
  }
  .cancel-btn {
    background: #6c757d;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
  .save-btn {
    background: #28a745;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
  .large-modal-scroll::-webkit-scrollbar {
    width: 8px;
  }
  .large-modal-scroll::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  .large-modal-scroll::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
  }
`;
document.head.appendChild(styleSheet);

export default AdminDashboard;