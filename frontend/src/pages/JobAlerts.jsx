import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MapPin, Briefcase, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { fetchUserAlerts, deleteAlert } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function JobAlerts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadAlerts();
  }, [user]);

  const loadAlerts = () => {
    setLoading(true);
    fetchUserAlerts(user.id)
      .then(setAlerts)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu iş alarmını silmek istediğinize emin misiniz?')) return;
    try {
      await deleteAlert(id);
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('Alarm silinirken bir hata oluştu.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Geri
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>İş Alarmlarım</h1>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Kurduğunuz alarmlara uygun yeni ilanlar e-posta ile size bildirilir.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader2 size={40} color="var(--brand-primary)" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : alerts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          <Bell size={56} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Hiç iş alarmınız yok</h3>
          <p style={{ margin: '0 0 1.5rem 0' }}>Arama sonuçlarında veya ilan detaylarında alarm kurarak yeni ilanlardan anında haberdar olabilirsiniz.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            İş Ara ve Alarm Kur
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {alerts.map((alert) => (
            <div key={alert.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Bell size={18} color="var(--brand-primary)" />
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                    {alert.keyword ? `"${alert.keyword}" kelimesini içeren ilanlar` : 'Tüm İlanlar'}
                  </h3>
                </div>
                
                <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {alert.city && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={14} /> {alert.city}
                    </span>
                  )}
                  {alert.work_type && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Briefcase size={14} /> {alert.work_type}
                    </span>
                  )}
                  <span style={{ color: 'var(--text-muted)' }}>
                    Oluşturulma: {formatDate(alert.created_at)}
                  </span>
                </div>
              </div>

              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.5rem', color: '#ef4444', borderColor: 'transparent', background: 'rgba(239,68,68,0.1)' }}
                onClick={() => handleDelete(alert.id)}
                title="Alarmı Sil"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
