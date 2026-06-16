import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>Система восстановлена</h1>
        <p>Проект запущен. Теперь можно добавлять обратно логику страниц.</p>
      </div>
    </Router>
  );
}

export default App;
