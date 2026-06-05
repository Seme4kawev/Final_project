import React, { useState } from 'react';
import { fetchApi, setToken } from '../api';
import { useNavigate } from 'react-router-dom';

export default function AuthPage({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '', email: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const data = await fetchApi(endpoint, {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setToken(data.token);
      setUser(data.user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel">
        <h2>{isLogin ? 'Вход' : 'Регистрация'}</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Имя пользователя</label>
            <input 
              type="text" 
              required 
              value={formData.username}
              onChange={e => setFormData({...formData, username: e.target.value})}
            />
          </div>
          
          {!isLogin && (
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                required 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          )}

          <div className="form-group">
            <label>Пароль</label>
            <input 
              type="password" 
              required 
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button type="submit" className="btn-primary full-width">
            {isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className="auth-toggle">
          {isLogin ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Создать' : 'Войти'}
          </span>
        </p>
      </div>
    </div>
  );
}
