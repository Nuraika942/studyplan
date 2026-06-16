import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000';

const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// ЭКРАН ВХОДА И РЕГИСТРАЦИИ (СВЯЗАН С FLASK)
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

    const endpoint = isRegisterMode ? '/register' : '/login';
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password })
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Произошла ошибка');
        return;
      }

      if (isRegisterMode) {
        setSuccessMessage('Регистрация успешна! Теперь войдите.');
        setIsRegisterMode(false);
        setPassword('');
      } else {
        onLogin(data.login);
      }
    } catch (err) {
      setError('Нет связи с сервером Flask! Проверь терминал.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'linear-gradient(135deg, #eefcfd 0%, #f5f3ff 50%, #fdf2f8 100%)', fontFamily: 'Segoe UI, sans-serif' }}>
      <div style={{ background: '#fff', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', width: '100%', maxWidth: '380px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '22px', fontWeight: 'bold', color: '#111827', marginBottom: '30px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></div>
          study.planner
        </div>
        
        <h3 style={{ marginBottom: '20px', color: '#374151', fontSize: '18px' }}>
          {isRegisterMode ? 'Создать аккаунт' : 'Вход в систему'}
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input type="text" placeholder={isRegisterMode ? "Придумайте логин" : "Логин"} value={login} onChange={(e) => setLogin(e.target.value)} style={{ width: '100%', padding: '14px', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '15px', boxSizing: 'border-box', outline: 'none' }} required />
          <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '14px', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '15px', boxSizing: 'border-box', outline: 'none' }} required />
          
          {error && <p style={{ color: '#ef4444', fontSize: '13px', margin: '0', textAlign: 'left' }}>{error}</p>}
          {successMessage && <p style={{ color: '#10b981', fontSize: '13px', margin: '0', textAlign: 'left' }}>{successMessage}</p>}
          
          <button type="submit" style={{ width: '100%', padding: '14px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
            {isRegisterMode ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </form>

        <p style={{ marginTop: '20px', fontSize: '14px', color: '#6b7280' }}>
          {isRegisterMode ? 'Уже есть аккаунт?' : 'Ещё нет аккаунта?'} {' '}
          <span onClick={() => { setIsRegisterMode(!isRegisterMode); setError(''); setSuccessMessage(''); }} style={{ color: '#4f46e5', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }}>
            {isRegisterMode ? 'Войти' : 'Зарегистрироваться'}
          </span>
        </p>
      </div>
    </div>
  );
}

function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.03)', textAlign: 'center', marginBottom: '20px' }}>
      <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', textAlign: 'left' }}>Pomodoro таймер</div>
      <div style={{ fontSize: '54px', fontWeight: 'bold', color: '#4f46e5', margin: '10px 0' }}>{formatTime(timeLeft)}</div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button onClick={() => setIsRunning(!isRunning)} style={{ background: '#4f46e5', color: '#fff', border: 'none', padding: '10px 35px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', flex: '1' }}>
          {isRunning ? 'Пауза' : 'Фокус'}
        </button>
        <button onClick={() => { setIsRunning(false); setTimeLeft(25 * 60); }} style={{ background: '#64748b', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>Сброс</button>
      </div>
    </div>
  );
}

function PlannerScreen({ userLogin, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('Все');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('Учёба');
  const [priority, setPriority] = useState('Средний приоритет');

  useEffect(() => {
    fetch(`${API_URL}/tasks?user_login=${userLogin}`)
      .then(res => res.json())
      .then(data => setTasks(data))
      .catch(err => console.log('Ошибка загрузки задач'));
  }, [userLogin]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskData = {
      user_login: userLogin, title, description: desc, category, priority,
      deadline: date || new Date().toISOString().split('T')[0]
    };

    try {
      const res = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      const data = await res.json();
      setTasks([{ id: data.id, ...taskData, completed: false }, ...tasks]);
      setTitle(''); setDesc(''); setDate('');
    } catch (err) {
      console.log(err);
    }
  };

  const handleToggleComplete = async (id) => {
    try {
      await fetch(`${API_URL}/tasks/${id}/toggle`, { method: 'POST' });
      setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' });
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  const filteredTasks = tasks.filter(t => activeTab === 'Все' || t.category === activeTab);
  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div style={{ background: 'linear-gradient(135deg, #eefcfd 0%, #f5f3ff 50%, #fdf2f8 100%)', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif', padding: '20px', boxSizing: 'border-box' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto 20px auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></div>
          study.planner
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#374151', fontWeight: '500' }}>
            <span>👤</span> {userLogin}
          </div>
          <button onClick={onLogout} style={{ border: '1px solid #d1d5db', background: '#fff', padding: '6px 16px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', color: '#4b5563' }}>Выйти</button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '30px', maxWidth: '1200px', margin: '0 auto' }}>
        <aside>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.03)', marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#111827', textTransform: 'uppercase', marginBottom: '8px' }}>Текущий прогресс</div>
            <div style={{ fontSize: '14px', color: '#4b5563', marginBottom: '12px' }}>Выполнено: <strong>{completedCount} из {tasks.length} задач</strong></div>
            <div style={{ width: '100%', background: '#e5e7eb', height: '6px', borderRadius: '3px', overflow: 'hidden' }}><div style={{ width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%`, background: '#10b981', height: '100%' }}></div></div>
          </div>
          <PomodoroTimer />
          <div style={{ background: '#fff', padding: '24px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#4f46e5', marginBottom: '16px' }}>+ Добавить задачу</div>
            <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="text" placeholder="Название темы..." value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '14px' }} required />
              <textarea placeholder="Краткое описание..." value={desc} onChange={(e) => setDesc(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '14px', height: '60px', resize: 'none' }} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ flex: '1', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '12px' }}>
                  <option value="Учёба">Учёба</option><option value="Экзамены">Экзамены</option><option value="Проекты">Проекты</option><option value="Личное">Личное</option>
                </select>
                <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ flex: '1', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '12px' }}>
                  <option value="Высокий приоритет">Высокий</option><option value="Средний приоритет">Средний</option><option value="Низкий приоритет">Низкий</option>
                </select>
              </div>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '12px' }} />
              <button type="submit" style={{ width: '100%', padding: '12px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold' }}>Добавить</button>
            </form>
          </div>
        </aside>

        <main>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>
            {['Все', 'Учёба', 'Экзамены', 'Проекты', 'Личное'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', background: activeTab === tab ? '#fff' : 'transparent', color: activeTab === tab ? '#4f46e5' : '#6b7280', fontWeight: activeTab === tab ? 'bold' : '500', cursor: 'pointer' }}>{tab}</button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredTasks.map(task => (
              <div key={task.id} style={{ background: '#fff', padding: '24px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: '1' }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', background: '#f3f4f6', padding: '3px 10px', borderRadius: '6px' }}>{task.category}</span>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: task.priority === 'Высокий приоритет' ? '#ef4444' : '#10b981', background: task.priority === 'Высокий приоритет' ? '#fef2f2' : '#f0fdf4', padding: '3px 10px', borderRadius: '6px' }}>{task.priority}</span>
                  </div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 'bold', textDecoration: task.completed ? 'line-through' : 'none', opacity: task.completed ? 0.5 : 1 }}>{task.title}</h3>
                  <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#6b7280' }}>{task.description}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '13px', color: '#9ca3af' }}>📅 До: {task.deadline}</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleDeleteTask(task.id)} style={{ border: 'none', background: '#fef2f2', color: '#ef4444', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Удалить</button>
                    </div>
                  </div>
                </div>
                <input type="checkbox" checked={task.completed} onChange={() => handleToggleComplete(task.id)} style={{ marginLeft: '20px', width: '20px', height: '20px', accentColor: '#4f46e5', cursor: 'pointer' }} />
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('studyplan_is_auth') === 'true');
  const [userLogin, setUserLogin] = useState(() => localStorage.getItem('studyplan_user_login') || '');

  const handleLogin = (login) => {
    setIsAuthenticated(true);
    setUserLogin(login);
    localStorage.setItem('studyplan_is_auth', 'true');
    localStorage.setItem('studyplan_user_login', login);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserLogin('');
    localStorage.removeItem('studyplan_is_auth');
    localStorage.removeItem('studyplan_user_login');
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/planner" replace /> : <AuthScreen onLogin={handleLogin} />} />
        <Route path="/planner" element={<ProtectedRoute isAuthenticated={isAuthenticated}><PlannerScreen userLogin={userLogin} onLogout={handleLogout} /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
