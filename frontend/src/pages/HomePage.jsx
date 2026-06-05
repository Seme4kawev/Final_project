import React, { useEffect, useState } from 'react';
import { fetchApi } from '../api';
import ReservationModal from '../components/ReservationModal';

export default function HomePage({ user }) {
  const [courts, setCourts] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState(null);

  useEffect(() => {
    fetchApi('/courts/')
      .then(data => setCourts(data))
      .catch(console.error);
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Доступные корты</h2>
      </div>

      <div className="courts-grid">
        {courts.filter(c => c.is_active).map(court => (
          <div key={court.id} className="court-card glass-panel">
            <h3>{court.name}</h3>
            <span className="court-type">{court.sport_type}</span>
            <p className="court-desc">{court.description}</p>
            
            {user ? (
              <button 
                className="btn-primary" 
                onClick={() => setSelectedCourt(court)}
              >
                Забронировать
              </button>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>
                Войдите для бронирования
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedCourt && (
        <ReservationModal 
          court={selectedCourt} 
          onClose={() => setSelectedCourt(null)} 
        />
      )}
    </div>
  );
}
