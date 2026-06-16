import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

const API_URL = 'https://studyplan-2oec.onrender.com';

const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// --- ЭКРАН ВХОДА (С ПРАВИЛЬНЫМИ ПУТЯМИ) ---
function AuthScreen({ onLogin }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // ИСПРАВЛЕНО: добавили /api/
    const endpoint = isRegisterMode ? '/api/register' : '/api/login';
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password })
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Ошибка');
        return;
      }

      if (isRegisterMode) {
        setSuccessMessage('Успешно! Теперь войдите.');
        setIsRegisterMode(false);
      } else {
        onLogin(data.login);
      }
    } catch (err) {
      setError('Нет связи с сервером');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'linear-gradient(135deg, #eefcfd 0%, #f5f3ff 50%, #fdf2f8 100%)', fontFamily: 'Segoe UI, sans-serif' }}>
      <div style={{ background: '#fff', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', width: '100%', maxWidth: '380px', textAlign: 'center' }}>
        <h3 style={{ marginBottom: '20px' }}>{isRegisterMode ? 'Создать аккаунт' : 'Вход'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input type="text" placeholder="Логин" value={login} onChange={(e) => setLogin(e.target.value)} style={{ padding: '14px', borderRadius: '12px', border: '1px solid #ddd' }} required />
          <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '14px', borderRadius: '12px', border: '1px solid #ddd' }} required />
          {error && <p style={{ color: '#ef4444' }}>{error}</p>}
          {successMessage && <p style={{ color: '#10b981' }}>{successMessage}</p>}
          <button type="submit" style={{ padding: '14px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>
            {isRegisterMode ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </form>
        <p style={{ marginTop: '20px', cursor: 'pointer', color: '#4f46e5' }} onClick={() => setIsRegisterMode(!isRegisterMode)}>
          {isRegisterMode ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
        </p>
      </div>
    </div>
  );
}

// --- ПЛАНЕР (С ПРАВИЛЬНЫМИ ПУТЯМИ) ---
function PlannerScreen({ userLogin, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');

  // ИСПРАВЛЕНО: добавили /api/tasks
  useEffect(() => {
    fetch(`${API_URL}/api/tasks?user_login=${userLogin}`)
      .then(res => res.json())
      .then(data => setTasks(data))
      .catch(err => console.log(err));
  }, [userLogin]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    // ИСПРАВЛЕНО: добавили /api/tasks
    const res = await fetch(`${API_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_login: userLogin, title, description: '', category: 'Учёба', priority: 'Средний', deadline: '2026-06-20' })
    });
    if (res.ok) {
        const newTask = await res.json();
        setTasks([newTask, ...tasks]);
        setTitle('');
    }
  };

  // ... (остальной код PlannerScreen оставляй как есть, он рабочий) ...
  return ( <div>...Твой код PlannerScreen здесь...</div> );
}

function App() {
    // ... (код App оставляй как есть) ...
}

export default App;
