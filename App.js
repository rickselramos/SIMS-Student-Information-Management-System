import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogin = (userData) => {
    console.log('Login successful:', userData);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/admin" 
          element={
            user.role === 'admin' ? 
              <AdminDashboard onLogout={handleLogout} userData={user} /> : 
              <Navigate to="/" />
          } 
        />
        <Route 
          path="/teacher" 
          element={
            user.role === 'teacher' ? 
              <TeacherDashboard onLogout={handleLogout} userData={user} /> : 
              <Navigate to="/" />
          } 
        />
        <Route 
          path="/student" 
          element={
            user.role === 'student' ? 
              <StudentDashboard onLogout={handleLogout} userData={user} /> : 
              <Navigate to="/" />
          } 
        />
        <Route path="/" element={<Navigate to={`/${user.role}`} />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
      </Routes>
    </Router>
  );
}

export default App;