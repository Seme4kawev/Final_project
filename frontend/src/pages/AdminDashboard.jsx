import React, { useEffect, useState } from 'react';
import { fetchApi } from '../api';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard({ user }) {
  const [reservations, setReservations] = useState([]);
  const navigate = useNavigate();

  const loadReservations = () => {
    fetchApi('/reservations/')
      .then(data => setReservations(data))
      .catch(console.error);
  };

  useEffect(() => {
    if (user && !user.is_staff) {
      navigate('/');
    } else if (user) {
      loadReservations();
    }
  }, [user, navigate]);

  const handleStatusChange = async (id, status) => {
    try {
      await fetchApi(`/reservations/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      loadReservations();
    } catch (err) {
      alert(err.message);
    }
  };

  if (!user || !user.is_staff) return null;

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>Панель администратора</h2>

      <div className="glass-panel table-container">
        <h3>Управление бронированиями</h3>
        {reservations.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Нет активных бронирований.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Пользователь</th>
                <th>Корт</th>
                <th>Дата</th>
                <th>Время</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map(res => (
                <tr key={res.id}>
                  <td>#{res.id}</td>
                  <td>{res.user.username}</td>
                  <td>{res.court.name}</td>
                  <td>{res.date}</td>
                  <td>{res.start_time.substring(0, 5)} - {res.end_time.substring(0, 5)}</td>
                  <td>
                    <span className={`status-badge status-${res.status}`}>
                      {res.status === 'pending' && 'Ожидает'}
                      {res.status === 'confirmed' && 'Подтверждено'}
                      {res.status === 'cancelled' && 'Отменено'}
                    </span>
                  </td>
                  <td style={{ display: 'flex', gap: '0.5rem' }}>
                    {res.status === 'pending' && (
                      <>
                        <button 
                          className="btn-primary" 
                          onClick={() => handleStatusChange(res.id, 'confirmed')}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                        >
                          Подтвердить
                        </button>
                        <button 
                          className="nav-btn danger" 
                          onClick={() => handleStatusChange(res.id, 'cancelled')}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                        >
                          Отклонить
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
