import React, { useState } from 'react';
import { X, Bell, Loader2 } from 'lucide-react';
import { createAlert } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CITIES = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin', 'Aydın', 'Balıkesir',
  'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli',
  'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari',
  'Hatay', 'Isparta', 'Mersin', 'İstanbul', 'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir',
  'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla', 'Muş', 'Nevşehir',
  'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Tekirdağ', 'Tokat',
  'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak', 'Van', 'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman',
  'Kırıkkale', 'Batman', 'Şırnak', 'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye', 'Düzce'
];
const WORK_TYPES = ['', 'Tam Zamanlı', 'Yarı Zamanlı', 'Uzaktan', 'Hibrit'];

export default function JobAlertModal({ onClose, defaultKeyword = '' }) {
  const { user } = useAuth();
  const [keyword, setKeyword] = useState(defaultKeyword);
  const [city, setCity] = useState('');
  const [workType, setWorkType] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!keyword.trim()) { setError('Anahtar kelime zorunludur.'); return; }
    setError('');
    setLoading(true);
    try {
      await createAlert({
        user_id: user.id,
        user_email: user.email,
        keyword,
        city: city || null,
        work_type: workType || null,
      });
      setSuccess(true);
    } catch (err) {
      setError('Alarm oluşturulurken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: 440, padding: '2rem', position: 'relative' }}>
        {/* Close */}
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <X size={20} />
        </button>

        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell size={22} color="var(--brand-primary)" /> İş Alarmı Oluştur
        </h2>
        <p style={{ color: 'var(--text-secondary)', margin: '0 0 1.5rem 0', fontSize: '0.9rem' }}>
          Kriterlere uyan yeni ilanlar olduğunda e-posta ile bildirim alacaksınız.
        </p>

        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              <Bell size={28} color="#4ade80" />
            </div>
            <h3 style={{ color: '#4ade80', marginBottom: '0.5rem' }}>Alarm Oluşturuldu!</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>"{keyword}" için alarm aktif.</p>
            <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={onClose}>Tamam</button>
          </div>
        ) : (
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && <p style={{ color: '#f87171', fontSize: '0.9rem', margin: 0 }}>{error}</p>}

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                Anahtar Kelime *
              </label>
              <input type="text" className="input" placeholder="Örn: Frontend Developer" value={keyword} onChange={e => setKeyword(e.target.value)} required />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Şehir</label>
              <select className="input" value={city} onChange={e => setCity(e.target.value)}>
                <option value="">Tüm Türkiye</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Çalışma Tercihi</label>
              <select className="input" value={workType} onChange={e => setWorkType(e.target.value)}>
                <option value="">Tümü</option>
                {WORK_TYPES.filter(Boolean).map(wt => <option key={wt} value={wt}>{wt}</option>)}
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <><Bell size={16} /> Alarmı Oluştur</>}
            </button>
          </form>
        )}
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
}
