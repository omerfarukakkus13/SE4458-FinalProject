import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Briefcase, Calendar, Users, ArrowLeft, Bell, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { fetchJobById, fetchRelatedJobs, applyToJob } from '../services/api';
import { useAuth } from '../context/AuthContext';
import JobAlertModal from '../components/JobAlertModal';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applyStatus, setApplyStatus] = useState(null); // 'success' | 'error' | 'already'
  const [showAlertModal, setShowAlertModal] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setJob(null);
    setRelatedJobs([]);
    setApplyStatus(null);
    setLoading(true);

    Promise.all([fetchJobById(id), fetchRelatedJobs(id)])
      .then(([jobData, related]) => {
        setJob(jobData);
        setRelatedJobs(related || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setApplying(true);
    setApplyStatus(null);
    try {
      await applyToJob(id, user.id, user.email);
      setApplyStatus('success');
    } catch (err) {
      if (err.message.includes('Already')) {
        setApplyStatus('already');
      } else {
        setApplyStatus('error');
      }
    } finally {
      setApplying(false);
    }
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const utcStr = dateStr.endsWith('Z') ? dateStr : `${dateStr}Z`;
    const diff = Date.now() - new Date(utcStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return m < 1 ? 'Az önce güncellendi' : `${m} dakika önce güncellendi`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} saat önce güncellendi`;
    return `${Math.floor(h / 24)} gün önce güncellendi`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Loader2 size={48} color="var(--brand-primary)" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!job) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
        <h2>İlan bulunamadı.</h2>
        <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate(-1)}>Geri Dön</button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <button className="btn btn-secondary" style={{ marginBottom: '1.5rem', padding: '0.5rem 1rem' }} onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Geri
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>

        {/* ── Main Detail ───────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Header Card */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', gap: '1rem' }}>
              <div>
                <h1 style={{ margin: '0 0 0.4rem 0', fontSize: '1.8rem', color: 'var(--text-primary)' }}>{job.title}</h1>
                <h2 style={{ margin: 0, fontWeight: 500, fontSize: '1.15rem', color: 'var(--text-secondary)' }}>{job.company_name}</h2>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
                <button className="btn btn-secondary" style={{ padding: '0.6rem 1rem', fontSize: '0.9rem' }}
                  onClick={() => setShowAlertModal(true)}>
                  <Bell size={16} /> Kaydet
                </button>
                {user?.user_metadata?.role === 'employer' ? (
                  <button className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '1rem', opacity: 0.5, cursor: 'not-allowed' }} disabled>
                    İşverenler Başvuramaz
                  </button>
                ) : (
                  <button className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '1rem' }}
                    onClick={handleApply} disabled={applying}>
                    {applying ? 'Başvuruluyor...' : 'Başvur'}
                  </button>
                )}
              </div>
            </div>

            {/* Apply Status Messages */}
            {applyStatus === 'success' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 'var(--radius-md)', color: '#4ade80', marginBottom: '1rem' }}>
                <CheckCircle size={18} /> Başvurunuz başarıyla alındı!
              </div>
            )}
            {applyStatus === 'already' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 'var(--radius-md)', color: '#fbbf24', marginBottom: '1rem' }}>
                <XCircle size={18} /> Bu ilana daha önce başvurdunuz.
              </div>
            )}
            {applyStatus === 'error' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', color: '#f87171', marginBottom: '1rem' }}>
                <XCircle size={18} /> Başvuru sırasında bir hata oluştu.
              </div>
            )}

            {/* Meta info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', padding: '1rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Çalışma Şekli</p>
                <p style={{ margin: '0.25rem 0 0 0', fontWeight: 600 }}>{job.work_type}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pozisyon</p>
                <p style={{ margin: '0.25rem 0 0 0', fontWeight: 600 }}>{job.position}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Başvuru Sayısı</p>
                <p style={{ margin: '0.25rem 0 0 0', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                  <Users size={14} style={{ verticalAlign: 'middle' }} /> {job.applications_count} başvuru
                </p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Son Güncelleme</p>
                <p style={{ margin: '0.25rem 0 0 0', fontWeight: 600, fontSize: '0.9rem' }}>{timeAgo(job.updated_at)}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={16} /> {job.city} • {job.country}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={16} /> {new Date(job.created_at).toLocaleDateString('tr-TR')}</span>
            </div>
          </div>

          {/* Description */}
          <div className="card">
            <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              İş Tanımı
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.9', whiteSpace: 'pre-wrap' }}>{job.description}</p>

            {job.requirements && (
              <>
                <h3 style={{ margin: '2rem 0 1rem 0', fontSize: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  Aday Kriterleri
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.9' }}>{job.requirements}</p>
              </>
            )}
          </div>
        </div>

        {/* ── Related Jobs (at least 3) ──────────────────── */}
        <aside className="card" style={{ position: 'sticky', top: '90px', padding: '1.25rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            İlgini Çekebilecek İlanlar
          </h3>
          {relatedJobs.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Benzer ilan bulunamadı.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {relatedJobs.map(rj => (
                <div key={rj.id} style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-primary)', cursor: 'pointer', transition: 'var(--transition)' }}
                  onClick={() => navigate(`/job/${rj.id}`)}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                  onMouseOut={e => e.currentTarget.style.background = 'var(--bg-primary)'}>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', color: 'var(--brand-primary)' }}>{rj.title}</h4>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{rj.company_name}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.4rem' }}>
                    <MapPin size={11} /> {rj.city} • {rj.work_type}
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>

      {showAlertModal && <JobAlertModal onClose={() => setShowAlertModal(false)} defaultKeyword={job?.position} />}
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
