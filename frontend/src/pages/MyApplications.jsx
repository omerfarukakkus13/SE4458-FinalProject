import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, Calendar, ArrowLeft, CheckCircle, Loader2, FileText } from 'lucide-react';
import { fetchMyApplications } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function MyApplications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchMyApplications(user.id)
      .then(setApplications)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Geri
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Başvurularım</h1>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Başvurduğunuz tüm iş ilanları
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader2 size={40} color="var(--brand-primary)" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : applications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          <FileText size={56} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Henüz başvuru yapmadınız</h3>
          <p style={{ margin: '0 0 1.5rem 0' }}>İlanlara göz atın ve kariyer yolculuğunuza başlayın.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            İlanları Keşfet
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Stats badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span style={{
              background: 'rgba(139,92,246,0.15)', color: 'var(--brand-secondary)',
              padding: '0.4rem 1rem', borderRadius: 'var(--radius-pill)', fontSize: '0.9rem', fontWeight: 600
            }}>
              Toplam {applications.length} başvuru
            </span>
          </div>

          {applications.map((app) => {
            const job = app.jobs;
            if (!job) return null;
            return (
              <div key={app.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  {/* Job Title */}
                  <h3
                    style={{ margin: '0 0 0.3rem 0', color: 'var(--brand-primary)', cursor: 'pointer', fontSize: '1.1rem' }}
                    onClick={() => navigate(`/job/${job.id}`)}
                  >
                    {job.title}
                  </h3>
                  <p style={{ margin: '0 0 0.6rem 0', fontWeight: 500, color: 'var(--text-primary)' }}>{job.company_name}</p>

                  <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={14} /> {job.city}{job.country ? ` • ${job.country}` : ''}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Briefcase size={14} /> {job.work_type}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={14} /> {formatDate(app.applied_at)} tarihinde başvuruldu
                    </span>
                  </div>
                </div>

                {/* Status + Action */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                    padding: '0.3rem 0.85rem', borderRadius: 'var(--radius-pill)', fontSize: '0.8rem', fontWeight: 600,
                    background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)'
                  }}>
                    <CheckCircle size={13} /> Başvuruldu
                  </span>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '0.35rem 0.9rem', fontSize: '0.85rem' }}
                    onClick={() => navigate(`/job/${job.id}`)}
                  >
                    İlanı Gör
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
