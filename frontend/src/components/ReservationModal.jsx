import React, { useState } from 'react';
import { fetchApi } from '../api';

export default function ReservationModal({ court, onClose }) {
  const [formData, setFormData] = useState({
    date: '',
    start_time: '',
    end_time: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Add seconds for backend TimeField (HH:MM:SS)
    const payload = {
      court_id: court.id,
      date: formData.date,
      start_time: formData.start_time + ':00',
      end_time: formData.end_time + ':00'
    };

    try {
      await fetchApi('/reservations/', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setSuccess(true);
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel">
        <div className="modal-header">
          <h2>Бронирование: {court.name}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        {success ? (
          <div style={{ color: 'var(--success)', textAlign: 'center', padding: '2rem' }}>
            <h3>Успешно забронировано!</h3>
            <p>Ожидайте подтверждения от администратора.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label>Дата</label>
              <input 
                type="date" 
                required 
                value={formData.date}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Время начала</label>
                <input 
                  type="time" 
                  required 
                  value={formData.start_time}
                  onChange={e => setFormData({...formData, start_time: e.target.value})}
                />
              </div>
              
              <div className="form-group" style={{ flex: 1 }}>
                <label>Время окончания</label>
                <input 
                  type="time" 
                  required 
                  value={formData.end_time}
                  onChange={e => setFormData({...formData, end_time: e.target.value})}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary full-width">Забронировать</button>
          </form>
        )}
      </div>
    </div>
  );
}
