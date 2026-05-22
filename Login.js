import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');  // Siguradong empty string sa simula
  const [password, setPassword] = useState('');  // Siguradong empty string sa simula
  const [role, setRole] = useState(''); // Walang default role para walang kulay ang buttons sa simula
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!role) {
      setError('Please select your login role (Admin, Teacher, or Student) first.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your username/ID');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }
    
    setLoading(true);
    setError('');

    let loginValue = email.trim();
    
    try {
      const response = await api.post('/login.php', { 
        email: loginValue, 
        password, 
        role 
      });
      
      if (response.data.success) {
        const userData = response.data.user;
        onLogin(userData);
        
        if (role === 'admin') {
          navigate('/admin');
        } else if (role === 'teacher') {
          navigate('/teacher');
        } else {
          navigate('/student');
        }
      } else {
        setError(response.data.message || 'Invalid username or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setEmail('');
    setPassword('');
    setError('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <div style={styles.header}>
          <div style={styles.logo}>🏫</div>
          <h1 style={styles.title}>Student Information Management System</h1>
          <p style={styles.subtitle}>Cabacao National High School</p>
        </div>
        
        {error && <div style={styles.error}>{error}</div>}
        
        {/* Idinagdag ang autoComplete="off" dito sa form level */}
        <form onSubmit={handleSubmit} style={styles.form} autoComplete="off">
          <div style={styles.inputGroup}>
            <label style={styles.label}>Login as</label>
            <div style={styles.roleContainer}>
              <button 
                type="button"
                onClick={() => handleRoleChange('admin')}
                style={{...styles.roleBtn, ...(role === 'admin' ? styles.roleBtnActive : {})}}
              >
                👨‍💼 Admin
              </button>
              <button 
                type="button"
                onClick={() => handleRoleChange('teacher')}
                style={{...styles.roleBtn, ...(role === 'teacher' ? styles.roleBtnActive : {})}}
              >
                👨‍🏫 Teacher
              </button>
              <button 
                type="button"
                onClick={() => handleRoleChange('student')}
                style={{...styles.roleBtn, ...(role === 'student' ? styles.roleBtnActive : {})}}
              >
                🎓 Student
              </button>
            </div>
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              {!role ? 'Username / ID' : role === 'student' ? 'Student ID / Username' : role === 'teacher' ? 'Username / ID' : 'Email Address'}
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              autoComplete="one-time-code" // Trick para harangan ang browser autofill ng "jayriel"
              placeholder={
                role === 'student' ? 'Enter Student ID (e.g., STU1883, 2024-7001)' : 
                role === 'teacher' ? 'Enter Username (e.g., maria.santos, 101)' : 
                role === 'admin' ? 'Enter email address' : 'Choose a role above first'
              }
              disabled={!role} 
            />
            {role && role !== 'admin' && (
              <small style={{ color: '#666', fontSize: '11px', marginTop: '4px' }}>
                ℹ️ You can use your {role === 'student' ? 'Student ID Number' : 'Username or ID'} (no @ needed)
              </small>
            )}
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              autoComplete="new-password" // Trick para hindi lagyan ng browser ng saved password dots
              placeholder="Enter your password"
              disabled={!role} 
            />
            {role === 'student' && (
              <small style={{ color: '#666', fontSize: '11px', marginTop: '4px' }}>
                ℹ️ Default password for all students: <strong>password</strong>
              </small>
            )}
            {role === 'teacher' && (
              <small style={{ color: '#666', fontSize: '11px', marginTop: '4px' }}>
                ℹ️ Default password for teachers: <strong>password</strong>
              </small>
            )}
          </div>
          
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Logging in...' : '🔐 Login'}
          </button>
        </form>
        
        <div style={styles.registerLink}>
          <p>Don't have an account? <button onClick={() => setShowRegister(true)} style={styles.linkBtn}>🎓 Create Student Account</button></p>
        </div>
        
        <div style={styles.demoCredentials}>
          <p style={styles.demoTitle}>📋 Demo Credentials:</p>
          <div style={styles.demoGrid}>
            <div style={styles.demoCard}>
              <strong>👨‍💼 Admin</strong>
              <p>admin</p>
              <code>admin123</code>
            </div>
            <div style={styles.demoCard}>
              <strong>👨‍🏫 Teacher</strong>
              <p>maria.santos</p>
              <code>password</code>
            </div>
            <div style={styles.demoCard}>
              <strong>🎓 Student</strong>
              <p>STU1883</p>
              <code>password</code>
            </div>
          </div>
        </div>
      </div>

      {showRegister && (
        <RegisterModal onClose={() => setShowRegister(false)} />
      )}
    </div>
  );
}

// Register Modal Component (Mananatiling parehas ang logic nito)
function RegisterModal({ onClose }) {
  const [formData, setFormData] = useState({
    fullName: '', studentId: '', lrn: '', email: '', username: '', password: '', confirmPassword: '',
    gradeLevel: '', section: '', schoolYear: '', recoveryEmail: '', securityQuestion: '', securityAnswer: '', termsAccepted: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const sectionsByGrade = {
    '7': ['Sampaguita', 'Rose', 'Sunflower', 'Orchid'],
    '8': ['Narra', 'Molave', 'Acacia', 'Mahogany'],
    '9': ['Jasmine', 'Rosal'],
    '10': ['Everlasting', 'Daisy']
  };

  const securityQuestions = [
    'What is your mother\'s maiden name?',
    'What was your first pet\'s name?',
    'What was the name of your first school?',
    'What is your favorite book?',
    'What is your favorite color?'
  ];

  const schoolYears = ['2023-2024', '2024-2025', '2025-2026'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (!formData.fullName || !formData.studentId || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!formData.termsAccepted) {
      setError('Please accept the terms and conditions');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/register.php', {
        full_name: formData.fullName,
        student_id_number: formData.studentId,
        lrn: formData.lrn,
        email: formData.email,
        username: formData.username || formData.studentId,
        password: formData.password,
        grade_level: formData.gradeLevel,
        section: formData.section,
        school_year: formData.schoolYear,
        recovery_email: formData.recoveryEmail,
        security_question: formData.securityQuestion,
        security_answer: formData.securityAnswer
      });

      if (response.data.success) {
        setSuccess('✅ Account created successfully! You can now login.');
        setTimeout(() => { onClose(); }, 3000);
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (error) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <div style={modalStyles.header}>
          <h2 style={modalStyles.title}>🎓 Create Student Account</h2>
          <button onClick={onClose} style={modalStyles.closeBtn}>✕</button>
        </div>
        <div style={modalStyles.welcomeMsg}>
          <p>👋 Welcome to Cabacao NHS Student Portal</p>
          <small>Create your account to access grades, attendance, announcements, and academic records.</small>
        </div>
        <form onSubmit={handleSubmit} style={modalStyles.form}>
          <div style={modalStyles.section}>
            <h3 style={modalStyles.sectionTitle}>📋 Account Information</h3>
            <div style={modalStyles.formRow}>
              <div style={modalStyles.formGroup}>
                <label>Full Name:*</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="Last Name, First Name Middle Name" />
              </div>
              <div style={modalStyles.formGroup}>
                <label>Student ID Number:*</label>
                <input type="text" name="studentId" value={formData.studentId} onChange={handleChange} required placeholder="e.g., 2024-10001" />
              </div>
            </div>
            <div style={modalStyles.formRow}>
              <div style={modalStyles.formGroup}>
                <label>LRN (Learner Reference Number):</label>
                <input type="text" name="lrn" value={formData.lrn} onChange={handleChange} placeholder="12-digit LRN" />
              </div>
              <div style={modalStyles.formGroup}>
                <label>Email Address:</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" />
              </div>
            </div>
            <div style={modalStyles.formRow}>
              <div style={modalStyles.formGroup}>
                <label>Username:</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Choose a username" />
              </div>
              <div style={modalStyles.formGroup}>
                <label>Password:*</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Create a password" />
              </div>
            </div>
            <div style={modalStyles.formRow}>
              <div style={modalStyles.formGroup}>
                <label>Confirm Password:*</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required placeholder="Confirm your password" />
              </div>
            </div>
          </div>

          <div style={modalStyles.section}>
            <h3 style={modalStyles.sectionTitle}>📚 Academic Information</h3>
            <div style={modalStyles.formRow}>
              <div style={modalStyles.formGroup}>
                <label>Grade Level:*</label>
                <select name="gradeLevel" value={formData.gradeLevel} onChange={handleChange} required>
                  <option value="">Select Grade Level</option>
                  <option value="7">Grade 7</option>
                  <option value="8">Grade 8</option>
                  <option value="9">Grade 9</option>
                  <option value="10">Grade 10</option>
                </select>
              </div>
              <div style={modalStyles.formGroup}>
                <label>Section:*</label>
                <select name="section" value={formData.section} onChange={handleChange} required disabled={!formData.gradeLevel}>
                  <option value="">Select Section</option>
                  {formData.gradeLevel && sectionsByGrade[formData.gradeLevel]?.map(sec => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={modalStyles.formRow}>
              <div style={modalStyles.formGroup}>
                <label>School Year:*</label>
                <select name="schoolYear" value={formData.schoolYear} onChange={handleChange} required>
                  <option value="">Select School Year</option>
                  {schoolYears.map(sy => (
                    <option key={sy} value={sy}>{sy}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div style={modalStyles.section}>
            <h3 style={modalStyles.sectionTitle}>🔐 Security Information</h3>
            <div style={modalStyles.formRow}>
              <div style={modalStyles.formGroup}>
                <label>Recovery Email (Optional):</label>
                <input type="email" name="recoveryEmail" value={formData.recoveryEmail} onChange={handleChange} placeholder="Recovery email address" />
              </div>
            </div>
            <div style={modalStyles.formRow}>
              <div style={modalStyles.formGroup}>
                <label>Security Question:</label>
                <select name="securityQuestion" value={formData.securityQuestion} onChange={handleChange}>
                  <option value="">Select Security Question</option>
                  {securityQuestions.map(q => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              </div>
              <div style={modalStyles.formGroup}>
                <label>Answer:</label>
                <input type="text" name="securityAnswer" value={formData.securityAnswer} onChange={handleChange} placeholder="Your answer" />
              </div>
            </div>
          </div>

          <div style={modalStyles.section}>
            <h3 style={modalStyles.sectionTitle}>📌 Terms & Verification</h3>
            <div style={modalStyles.checkboxGroup}>
              <label>
                <input type="checkbox" name="termsAccepted" checked={formData.termsAccepted} onChange={(e) => setFormData({...formData, termsAccepted: e.target.checked})} />
                <span>I confirm that the information provided is accurate.*</span>
              </label>
            </div>
            <div style={modalStyles.statusBadge}>
              🟢 Account Status: <strong>Pending Verification</strong>
            </div>
          </div>

          {error && <div style={modalStyles.error}>{error}</div>}
          {success && <div style={modalStyles.success}>{success}</div>}

          <div style={modalStyles.buttonGroup}>
            <button type="button" onClick={onClose} style={modalStyles.cancelBtn}>Cancel</button>
            <button type="submit" style={modalStyles.submitBtn} disabled={loading}>
              {loading ? 'Creating Account...' : '📝 Create Account'}
            </button>
          </div>
          
          <div style={modalStyles.resetLink}>
            <button type="button" onClick={() => setFormData({
              fullName: '', studentId: '', lrn: '', email: '', username: '', password: '', confirmPassword: '',
              gradeLevel: '', section: '', schoolYear: '', recoveryEmail: '', securityQuestion: '', securityAnswer: '', termsAccepted: false
            })} style={modalStyles.resetBtn}>🔄 Reset Form</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Ganoon pa rin ang styles block mo sa dulo...
const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #1565c0 100%)', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', padding: '20px' },
  loginBox: { background: 'white', borderRadius: '24px', padding: '40px', width: '480px', maxWidth: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' },
  header: { textAlign: 'center', marginBottom: '30px' },
  logo: { fontSize: '56px', marginBottom: '10px' },
  title: { margin: 0, color: '#1565c0', fontSize: '28px', fontWeight: 'bold' },
  subtitle: { margin: '8px 0 0', color: '#666', fontSize: '14px' },
  error: { background: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontWeight: '600', color: '#333', fontSize: '14px' },
  roleContainer: { display: 'flex', gap: '12px' },
  roleBtn: { flex: 1, padding: '10px', border: '2px solid #e0e0e0', borderRadius: '10px', background: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.3s' },
  roleBtnActive: { borderColor: '#1565c0', background: '#1565c0', color: 'white' },
  input: { padding: '14px', border: '1px solid #ddd', borderRadius: '10px', fontSize: '15px', outline: 'none', transition: 'border-color 0.3s' },
  button: { background: '#1565c0', color: 'white', padding: '14px', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.3s', marginTop: '10px' },
  registerLink: { textAlign: 'center', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #eee' },
  linkBtn: { background: 'none', border: 'none', color: '#1565c0', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' },
  demoCredentials: { marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #eee' },
  demoTitle: { fontSize: '12px', color: '#999', marginBottom: '12px', textAlign: 'center' },
  demoGrid: { display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' },
  demoCard: { background: '#f5f5f5', padding: '10px', borderRadius: '10px', fontSize: '11px', textAlign: 'center', flex: 1, minWidth: '120px' }
};

const modalStyles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', overflowY: 'auto' },
  modal: { background: 'white', borderRadius: '24px', width: '700px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' },
  header: { display: 'flex', justifyConten: 'space-between', alignItems: 'center', padding: '20px 25px', borderBottom: '1px solid #eee', background: '#1565c0', color: 'white', borderRadius: '24px 24px 0 0' },
  title: { margin: 0, fontSize: '20px' },
  closeBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'white' },
  welcomeMsg: { background: '#e3f2fd', padding: '15px 25px', textAlign: 'center' },
  form: { padding: '25px' },
  section: { marginBottom: '25px', paddingBottom: '20px', borderBottom: '1px solid #eee' },
  sectionTitle: { color: '#1565c0', fontSize: '16px', marginBottom: '15px', paddingLeft: '10px', borderLeft: '4px solid #1565c0' },
  formRow: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '15px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  checkboxGroup: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' },
  statusBadge: { background: '#fff3e0', padding: '10px 15px', borderRadius: '8px', fontSize: '14px' },
  error: { background: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '8px', marginBottom: '15px', fontSize: '14px' },
  success: { background: '#e8f5e9', color: '#2e7d32', padding: '12px', borderRadius: '8px', marginBottom: '15px', fontSize: '14px' },
  buttonGroup: { display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '20px' },
  cancelBtn: { background: '#9e9e9e', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },
  submitBtn: { background: '#1565c0', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },
  resetLink: { textAlign: 'center', marginTop: '15px' },
  resetBtn: { background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }
};

export default Login;