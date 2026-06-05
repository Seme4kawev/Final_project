import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import { getToken, removeToken } from './api'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import ProfilePage from './pages/ProfilePage'
import AdminDashboard from './pages/AdminDashboard'

function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    removeToken();
    setUser(null);
    navigate('/');
  };

  return (
    <header className="navbar">
      <Link to="/" style={{ textDecoration: 'none' }}>
        <h1>Sports Booking</h1>
      </Link>
      <nav className="nav-links">
        {user ? (
          <>
            {user.is_staff && <Link to="/admin" className="nav-btn">Админ Панель</Link>}
            <Link to="/profile" className="nav-btn">Мои брони</Link>
            <button onClick={handleLogout} className="nav-btn danger">Выйти</button>
          </>
        ) : (
          <Link to="/login" className="nav-btn primary">Войти</Link>
        )}
      </nav>
    </header>
  );
}

function App() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // We fetch /auth/me or just use token data. 
        // We'll trust the decoded token for basic UI routing, but API is secure anyway.
        // For accurate is_staff, let's fetch from backend.
        fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } })
          .then(res => res.json())
          .then(data => {
            if(data && !data.detail) setUser(data);
          })
          .catch(() => removeToken());
      } catch {
        removeToken();
      }
    }
  }, []);

  return (
    <Router>
      <div className="app-container">
        <Navbar user={user} setUser={setUser} />
        <main className="content">
          <Routes>
            <Route path="/" element={<HomePage user={user} />} />
            <Route path="/login" element={<AuthPage setUser={setUser} />} />
            <Route path="/profile" element={<ProfilePage user={user} />} />
            <Route path="/admin" element={<AdminDashboard user={user} />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
