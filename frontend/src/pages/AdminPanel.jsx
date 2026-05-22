import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Edit2, Briefcase, MapPin, FileText, Loader2,
  CheckCircle, Users, X, Mail, Calendar, ArrowLeft
} from 'lucide-react';
import { createJob, fetchJobs, updateJob } from '../services/api';
import { useAuth } from '../context/AuthContext';

const WORK_TYPES = ['Tam Zamanlı', 'Yarı Zamanlı', 'Uzaktan', 'Hibrit'];
const emptyForm = {
  title: '', company_name: '', city: '', country: 'Türkiye',
  position: '', work_type: 'Tam Zamanlı', description: '', requirements: ''
};

const API_BASE = 'http://localhost:3001/api/v1';

export default function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myJobs, setMyJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Applicants modal state
  const [applicantsModal, setApplicantsModal] = useState(null); // { jobTitle, applicants[] }
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  if (!user || user.user_metadata?.role !== 'employer') {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-secondary)' }}>
        <h2>Bu sayfayı görüntüleme yetkiniz bulunmamaktadır. Sadece işverenler ilan ekleyebilir.</h2>
        <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => navigate('/')}>Anasayfaya Dön</button>
      </div>
    );
  }

  const loadMyJobs = async () => {
    setLoadingJobs(true);
    try {
      // Fetch all jobs then filter by created_by (kendi ilanları)
      const result = await fetchJobs({ limit: 100 });
      const allJobs = result.data || [];
      const mine = allJobs.filter(j => j.created_by === user.id);
      setMyJobs(mine);
    } catch { } finally { setLoadingJobs(false); }
  };

  useEffect(() => { loadMyJobs(); }, []);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      if (editingId) {
        await updateJob(editingId, { ...form });
        setSuccessMsg('İlan başarıyla güncellendi!');
        setEditingId(null);
      } else {
        // Pass current user id as created_by
        await createJob({ ...form, created_by: user.id });
        setSuccessMsg('Yeni ilan başarıyla yayınlandı!');
      }
      setForm(emptyForm);
      loadMyJobs();
    } catch (err) {
      setErrorMsg(err.message || 'Bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (job) => {
    setEditingId(job.id);
    setForm({
      title: job.title, company_name: job.company_name, city: job.city,
      country: job.country || 'Türkiye', position: job.position,
      work_type: job.work_type, description: job.description,
      requirements: job.requirements || ''
    });
    window.scrollTo(0, 0);
  };

  const handleViewApplicants = async (job) => {
    setLoadingApplicants(true);
    setApplicantsModal({ jobTitle: job.title, jobId: job.id, applicants: [] });
    try {
      const res = await fetch(`${API_BASE}/jobs/${job.id}/applicants`);
      const data = await res.json();
      setApplicantsModal({ jobTitle: job.title, jobId: job.id, applicants: data });
    } catch {
      setApplicantsModal(prev => ({ ...prev, applicants: [] }));
    } finally {
      setLoadingApplicants(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Geri
          </button>
          <div>
            <h1 style={{ margin: 0 }}>İşveren Paneli</h1>
            <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              İlanlarınızı yönetin ve başvuruları takip edin
            </p>
          </div>
        </div>
        <span className="badge" style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--brand-primary)', padding: '0.4rem 1rem' }}>
          {user.email}
        </span>
      </div>

      {/* ── Add / Edit Form ─────────────────────────── */}
      <div className="card">
        <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {editingId ? <><Edit2 size={20} /> İlanı Düzenle</> : <><Plus size={20} /> Yeni İlan Ekle</>}
        </h2>

        {successMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 'var(--radius-md)', color: '#4ade80', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            <CheckCircle size={18} /> {successMsg}
          </div>
        )}
        {errorMsg && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', color: '#f87171', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          {[
            ['title', 'İlan Başlığı *', 'text', 'Örn: Frontend Developer'],
            ['company_name', 'Şirket Adı *', 'text', 'Örn: Trendyol'],
            ['city', 'Şehir *', 'text', 'Örn: İstanbul'],
            ['country', 'Ülke', 'text', 'Örn: Türkiye'],
            ['position', 'Pozisyon Seviyesi *', 'text', 'Örn: Uzman'],
          ].map(([field, label, type, placeholder]) => (
            <div key={field}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>{label}</label>
              <input type={type} className="input" placeholder={placeholder} value={form[field]}
                onChange={e => handleChange(field, e.target.value)} required={label.endsWith('*')} />
            </div>
          ))}

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Çalışma Tercihi</label>
            <select className="input" value={form.work_type} onChange={e => handleChange('work_type', e.target.value)}>
              {WORK_TYPES.map(wt => <option key={wt} value={wt}>{wt}</option>)}
            </select>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>İş Tanımı *</label>
            <textarea className="input" rows={5} placeholder="Detaylı iş tanımı..." value={form.description}
              onChange={e => handleChange('description', e.target.value)} required style={{ resize: 'vertical' }} />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Aday Kriterleri</label>
            <textarea className="input" rows={3} placeholder="Gerekli beceriler ve deneyimler..." value={form.requirements}
              onChange={e => handleChange('requirements', e.target.value)} style={{ resize: 'vertical' }} />
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }} disabled={submitting}>
              {submitting ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : editingId ? 'Güncelle' : 'İlanı Yayınla'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
                İptal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── My Job Listings ──────────────────────────────── */}
      <div>
        <h2 style={{ margin: '0 0 1.25rem 0', fontSize: '1.2rem' }}>
          İlanlarım ({myJobs.length})
        </h2>

        {loadingJobs ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <Loader2 size={36} color="var(--brand-primary)" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : myJobs.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            <FileText size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p>Henüz ilan eklemediniz. Yukarıdan ilk ilanınızı yayınlayın!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {myJobs.map(job => (
              <div key={job.id} className="card" style={{ padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.3rem 0', color: 'var(--brand-primary)', fontSize: '1.05rem' }}>{job.title}</h4>
                    <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                      <span><Briefcase size={13} style={{ verticalAlign: 'middle' }} /> {job.company_name}</span>
                      <span><MapPin size={13} style={{ verticalAlign: 'middle' }} /> {job.city}</span>
                      <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
                        <Users size={13} style={{ verticalAlign: 'middle' }} /> {job.applications_count} başvuru
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      onClick={() => handleViewApplicants(job)}
                    >
                      <Users size={14} /> Başvuranlar ({job.applications_count})
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      onClick={() => handleEdit(job)}
                    >
                      <Edit2 size={14} /> Düzenle
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Applicants Modal ─────────────────────────────── */}
      {applicantsModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}
          onClick={(e) => { if (e.target === e.currentTarget) setApplicantsModal(null); }}
        >
          <div className="card" style={{ width: '100%', maxWidth: 560, maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexShrink: 0 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Başvuranlar</h3>
                <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {applicantsModal.jobTitle}
                </p>
              </div>
              <button onClick={() => setApplicantsModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem' }}>
                <X size={22} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {loadingApplicants ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                  <Loader2 size={32} color="var(--brand-primary)" style={{ animation: 'spin 1s linear infinite' }} />
                </div>
              ) : applicantsModal.applicants.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  <Users size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                  <p>Bu ilana henüz başvuru yapılmadı.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div style={{ padding: '0.5rem 0', color: 'var(--text-muted)', fontSize: '0.85rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.25rem' }}>
                    Toplam {applicantsModal.applicants.length} başvuran
                  </div>
                  {applicantsModal.applicants.map((app, i) => (
                    <div key={app.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.85rem 1rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)',
                      flexWrap: 'wrap', gap: '0.5rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%', background: 'var(--brand-gradient)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.85rem', fontWeight: 700, color: 'white', flexShrink: 0
                        }}>
                          {i + 1}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 500, fontSize: '0.9rem' }}>
                            {app.user_email || `Kullanıcı ${app.user_id?.slice(0, 8)}...`}
                          </p>
                          <p style={{ margin: '0.1rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Calendar size={11} /> {formatDate(app.applied_at)}
                          </p>
                        </div>
                      </div>
                      {app.user_email && (
                        <a
                          href={`mailto:${app.user_email}`}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--brand-primary)', fontSize: '0.82rem', textDecoration: 'none' }}
                        >
                          <Mail size={13} /> İletişime Geç
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
