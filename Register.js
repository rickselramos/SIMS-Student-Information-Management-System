import React, { useState } from 'react';
import api from '../services/api';

function Register({ onClose, onLoginClick }) {
  // Lahat ng states para sa Account, Academic, at Security Information
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [lrn, setLrn] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gradeLevel, setGradeLevel] = useState('7');
  const [section, setSection] = useState('Sampaguita'); 
  const [schoolYear, setSchoolYear] = useState('2025-2026');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('What is your favorite color?');
  const [securityAnswer, setSecurityAnswer] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation bago mag-send sa database
    if (!password || !confirmPassword) {
      setError('Please fill in both password fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }
    
    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }
    
    setLoading(true);
    
    // Pagsasama-sama ng lahat ng data para i-save sa database
    const postData = {
      full_name: fullName,
      student_id_number: studentId,
      lrn: lrn,
      email: email,
      username: username || studentId, // Kung walang username, student ID ang gagamitin
      password: password,
      grade_level: gradeLevel,
      section: section,
      school_year: schoolYear,
      recovery_email: recoveryEmail,
      security_question: securityQuestion,
      security_answer: securityAnswer
    };
    
    try {
      // Dito ipapadala ang data sa PHP para pumasok sa MySQL
      const response = await api.post('/register.php', postData);
      
      if (response.data.success) {
        setSuccess(response.data.message);
        setTimeout(() => {
          onClose();
          onLoginClick();
        }, 3000);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-2xl font-bold">🎓 Create Student Account</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            ❌ {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            ✅ {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 📋 ACCOUNT INFORMATION */}
          <div>
            <h3 className="font-semibold text-lg mb-2 text-blue-700">📋 Account Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Full Name:*</label>
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2" placeholder="e.g., Rhea Jane Cama" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Student ID Number:*</label>
                <input type="text" required value={studentId} onChange={(e) => setStudentId(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2" placeholder="e.g., 2045-2045" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">LRN:</label>
                <input type="text" value={lrn} onChange={(e) => setLrn(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2" placeholder="12-digit LRN" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email Address:</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2" placeholder="rhea@gmail.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Username:</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2" placeholder="Rhea" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password:*</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2" placeholder="•••••" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Confirm Password:*</label>
                <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2" placeholder="•••••" />
              </div>
            </div>
          </div>

          {/* 📚 ACADEMIC INFORMATION */}
          <div>
            <h3 className="font-semibold text-lg mb-2 text-blue-700">📚 Academic Information</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Grade Level:*</label>
                <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} required className="w-full border rounded-lg px-3 py-2">
                  <option value="7">Grade 7</option>
                  <option value="8">Grade 8</option>
                  <option value="9">Grade 9</option>
                  <option value="10">Grade 10</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Section:*</label>
                <select value={section} onChange={(e) => setSection(e.target.value)} required className="w-full border rounded-lg px-3 py-2">
                  <option value="Sampaguita">Sampaguita</option>
                  <option value="Rose">Rose</option>
                  <option value="Sunflower">Sunflower</option>
                  <option value="Orchid">Orchid</option>
                  <option value="Acacia">Acacia</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">School Year:*</label>
                <select value={schoolYear} onChange={(e) => setSchoolYear(e.target.value)} required className="w-full border rounded-lg px-3 py-2">
                  <option value="2024-2025">2024-2025</option>
                  <option value="2025-2026">2025-2026</option>
                </select>
              </div>
            </div>
          </div>

          {/* 🔐 SECURITY INFORMATION */}
          <div>
            <h3 className="font-semibold text-lg mb-2 text-blue-700">🔐 Security Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Recovery Email (Optional):</label>
                <input type="email" value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2" placeholder="Recovery email address" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Security Question:</label>
                <select value={securityQuestion} onChange={(e) => setSecurityQuestion(e.target.value)} className="w-full border rounded-lg px-3 py-2">
                  <option value="What is your favorite color?">What is your favorite color?</option>
                  <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
                  <option value="What was the name of your first pet?">What was the name of your first pet?</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Answer:</label>
                <input type="text" required value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2" placeholder="e.g., black" />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-lg">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50">
              {loading ? 'Saving to Database...' : '📝 Create Account'}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <button onClick={onLoginClick} className="text-blue-600 hover:underline">
            Already have an account? Login here
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;