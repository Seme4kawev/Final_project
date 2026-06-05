import React, { useEffect, useState } from 'react';
import { fetchApi } from '../api';

export default function ProfilePage({ user }) {
  const [reservations, setReservations] = useState([]);

  const loadReservations = () => {
    fetchApi('/reservations/')
      .then(data => setReservations(data))
      .catch(console.error);
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Вы уверены, что хотите отменить бронирование?')) return;
    try {
      await fetchApi(`/reservations/${id}`, { method: 'DELETE' });
      loadReservations();
    } catch (err) {
      alert(err.message);
    }
  };

  if (!user) return <div style={{textAlign: 'center'}}>Пожалуйста, войдите в систему</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>Мои бронирования</h2>

      <div className="glass-panel table-container">
        {reservations.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>У вас пока нет бронирований.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Корт</th>
                <th>Спорт</th>
                <th>Дата</th>
                <th>Время</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map(res => (
                <tr key={res.id}>
                  <td>{res.court.name}</td>
                  <td>{res.court.sport_type}</td>
                  <td>{res.date}</td>
                  <td>{res.start_time.substring(0, 5)} - {res.end_time.substring(0, 5)}</td>
                  <td>
                    <span className={`status-badge status-${res.status}`}>
                      {res.status === 'pending' && 'Ожидает'}
                      {res.status === 'confirmed' && 'Подтверждено'}
                      {res.status === 'cancelled' && 'Отменено'}
                    </span>
                  </td>
                  <td>
                    {res.status !== 'cancelled' && (
                      <button 
                        className="nav-btn danger" 
                        onClick={() => handleCancel(res.id)}
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        Отменить
                      </button>
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
