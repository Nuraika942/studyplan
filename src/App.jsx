import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

const API_URL = 'https://studyplan-2oec.onrender.com';

const ProtectedRoute = ({ isAuthenticated, children }) => {
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function AuthScreen({ onLogin }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ИСПРАВЛЕНО: пути с /api/
    const endpoint = isRegisterMode ? '/api/register' : '/api/login';
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Ошибка');
      if (isRegisterMode) alert('Успешно! Теперь войдите.');
      else onLogin(data.login);
    } catch (err) { setError(err.message); }
  };

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h3>{isRegisterMode ? 'Регистрация' : 'Вход'}</h3>
      <form onSubmit={handleSubmit}>
        <input placeholder="Логин" onChange={(e) => setLogin(e.target.value)} required />
        <input type="password" placeholder="Пароль" onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">{isRegisterMode ? 'Зарегистрироваться' : 'Войти'}</button>
      </form>
      <button onClick={() => setIsRegisterMode(!isRegisterMode)}>
        {isRegisterMode ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Регистрация'}
      </button>
      {error && <p style={{color: 'red'}}>{error}</p>}
    </div>
  );
}

function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);
  return (
    <div>
      <h3>Таймер: {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2, '0')}</h3>
      <button onClick={() => setIsRunning(!isRunning)}>{isRunning ? 'Пауза' : 'Старт'}</button>
    </div>
  );
}

function PlannerScreen({ userLogin, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');

  useEffect(() => {
    // ИСПРАВЛЕНО: добавлено /api/
    fetch(`${API_URL}/api/tasks?user_login=${userLogin}`)
      .then(res => res.json())
      .then(data => setTasks(data));
  }, [userLogin]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    // ИСПРАВЛЕНО: добавлено /api/
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

  return (
    <div>
      <h2>Ваши задачи, {userLogin}</h2>
      <button onClick={onLogout}>Выйти</button>
      <PomodoroTimer />
      <form onSubmit={handleAddTask}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Задача" />
        <button type="submit">Добавить</button>
      </form>
      <ul>{tasks.map(t => <li key={t.id}>{t.title}</li>)}</ul>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('studyplan_is_auth') === 'true');
  const [userLogin, setUserLogin] = useState(localStorage.getItem('studyplan_user_login') || '');

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/planner" /> : <AuthScreen onLogin={(l) => {setIsAuthenticated(true); setUserLogin(l); localStorage.setItem('studyplan_is_auth', 'true'); localStorage.setItem('studyplan_user_login', l);}} />} />
        <Route path="/planner" element={isAuthenticated ? <PlannerScreen userLogin={userLogin} onLogout={() => {setIsAuthenticated(false); localStorage.clear();}} /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
