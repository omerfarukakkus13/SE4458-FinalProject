import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Briefcase, ChevronRight, Bell, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchJobs, fetchAutocomplete, fetchRecentSearches } from '../services/api';
import { useAuth } from '../context/AuthContext';
import JobAlertModal from '../components/JobAlertModal';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [position, setPosition] = useState('');
  const [city, setCity] = useState('');
  const [positionSuggestions, setPositionSuggestions] = useState([]);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [detectedCity, setDetectedCity] = useState(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const positionRef = useRef(null);
  const cityRef = useRef(null);

  // Geolocation handler
  const fetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const cityName = data.address?.province || data.address?.city || 'İstanbul';
          setDetectedCity(cityName);
          setCity(cityName);
        } catch (err) {
          console.warn('Reverse geocoding failed:', err);
          setDetectedCity('İstanbul');
          setCity('İstanbul');
        }
      }, (error) => {
        console.warn('Geolocation permission denied or failed:', error.message);
        setDetectedCity('İstanbul');
        setCity('İstanbul');
      });
    } else {
      console.warn('Geolocation not supported by browser');
      setDetectedCity('İstanbul');
      setCity('İstanbul');
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  // Load jobs from current city
  useEffect(() => {
    const loadJobs = async () => {
      setLoadingJobs(true);
      try {
        const currentCity = detectedCity || 'İstanbul';
        let result = await fetchJobs({ city: currentCity, limit: 5 });
        // If < 5 jobs in city, show other postings
        if (!result.data || result.data.length < 5) {
          result = await fetchJobs({ limit: 5 });
        }
        setJobs(result.data || []);
      } catch (e) {
        console.error('Failed to load jobs', e);
      } finally {
        setLoadingJobs(false);
      }
    };
    if (detectedCity !== null) loadJobs();
  }, [detectedCity]);

  // Load recent searches from MongoDB for logged-in user
  useEffect(() => {
    if (user) {
      fetchRecentSearches(user.id).then(setRecentSearches).catch(() => {});
    }
  }, [user]);

  // Autocomplete handlers
  const handlePositionChange = async (val) => {
    setPosition(val);
    if (val.length >= 2) {
      const suggestions = await fetchAutocomplete(val, 'position');
      setPositionSuggestions(suggestions);
    } else {
      setPositionSuggestions([]);
    }
  };

  const handleCityChange = async (val) => {
    setCity(val);
    if (val.length >= 2) {
      const suggestions = await fetchAutocomplete(val, 'city');
      setCitySuggestions(suggestions);
    } else {
      setCitySuggestions([]);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPositionSuggestions([]);
    setCitySuggestions([]);
    const params = new URLSearchParams();
    if (position) params.set('position', position);
    if (city) params.set('city', city);
    navigate(`/search?${params.toString()}`);
  };

  const handleRecentSearch = (s) => {
    const params = new URLSearchParams();
    if (s.position) params.set('position', s.position);
    if (s.city) params.set('city', s.city);
    navigate(`/search?${params.toString()}`);
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const safeDate = dateStr.endsWith('Z') || dateStr.includes('+') ? dateStr : `${dateStr}Z`;
    const diff = Date.now() - new Date(safeDate).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return 'Az önce';
    if (h < 24) return `${h} saat önce`;
    const d = Math.floor(h / 24);
    return `${d} gün önce`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="card animate-fade-in" style={{ textAlign: 'center', padding: '3.5rem 2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: 350, height: 350, background: 'var(--brand-primary)', filter: 'blur(120px)', opacity: 0.12, borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-80px', right: '-80px', width: 350, height: 350, background: 'var(--brand-secondary)', filter: 'blur(120px)', opacity: 0.12, borderRadius: '50%', pointerEvents: 'none' }} />

        <h1 style={{ fontSize: '2.8rem', marginBottom: '0.5rem', position: 'relative' }}>
          Kariyer Fırsatlarını <span className="text-gradient">Keşfet</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', position: 'relative', fontSize: '1.1rem' }}>
          Binlerce güncel iş ilanı, onlarca şirket — hepsi bir arada.
        </p>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', maxWidth: '820px', margin: '0 auto', flexWrap: 'wrap', position: 'relative' }}>
          {/* Position Input + Autocomplete */}
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <Briefcase size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
            <input
              ref={positionRef}
              type="text"
              className="input"
              placeholder="Pozisyon veya yetenek ara..."
              style={{ paddingLeft: '2.75rem' }}
              value={position}
              onChange={e => handlePositionChange(e.target.value)}
              onBlur={() => setTimeout(() => setPositionSuggestions([]), 200)}
            />
            {positionSuggestions.length > 0 && (
              <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', zIndex: 100, listStyle: 'none', overflow: 'hidden', marginTop: 4 }}>
                {positionSuggestions.map((s, i) => (
                  <li key={i} onMouseDown={() => { setPosition(s); setPositionSuggestions([]); }}
                    style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', fontSize: '0.95rem' }}
                    onMouseOver={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* City Input + Autocomplete */}
          <div style={{ flex: '1 1 200px', position: 'relative' }}>
            <MapPin size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
            <input
              ref={cityRef}
              type="text"
              className="input"
              placeholder="Şehir veya ilçe ara"
              style={{ paddingLeft: '2.75rem' }}
              value={city}
              onChange={e => handleCityChange(e.target.value)}
              onBlur={() => setTimeout(() => setCitySuggestions([]), 200)}
            />
            {citySuggestions.length > 0 && (
              <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', zIndex: 100, listStyle: 'none', overflow: 'hidden', marginTop: 4 }}>
                {citySuggestions.map((s, i) => (
                  <li key={i} onMouseDown={() => { setCity(s); setCitySuggestions([]); }}
                    style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', fontSize: '0.95rem' }}
                    onMouseOver={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button type="submit" className="btn btn-primary" style={{ flex: '0 0 auto', padding: '0 2rem' }}>
            <Search size={18} /> İş Bul
          </button>
        </form>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>

        {/* ── Son Aramalarım ───────────────────────────── */}
        <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Search size={20} color="var(--brand-primary)" /> Son Aramalarım
            </h2>
            {user && (
              <button className="btn btn-secondary" style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={() => setShowAlertModal(true)}>
                <Bell size={15} /> İş Alarmı
              </button>
            )}
          </div>

          {!user ? (
            <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              Son aramalarınızı görmek için{' '}
              <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', cursor: 'pointer', fontWeight: 600, fontSize: 'inherit' }}>
                giriş yapın
              </button>
            </div>
          ) : recentSearches.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              Henüz arama yapmadınız.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentSearches.map((s, i) => (
                <div key={i} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  onClick={() => handleRecentSearch(s)}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600 }}>
                      {[s.position, s.city].filter(Boolean).join(' — ')}
                    </p>
                    <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {new Date(s.searchedAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <ChevronRight size={18} color="var(--text-muted)" />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Yakınımdaki İlanlar ───────────────────────── */}
        <section className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={20} color="var(--brand-primary)" />
              {detectedCity ? `${detectedCity} İlanları` : 'Öne Çıkan İlanlar'}
            </h2>
            <button className="btn btn-secondary" style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }} onClick={fetchLocation}>
              Konumumu Bul
            </button>
          </div>

          {loadingJobs ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <Loader2 size={36} color="var(--brand-primary)" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {jobs.map(job => (
                <div key={job.id} className="card" style={{ padding: '1.25rem', cursor: 'pointer' }} onClick={() => navigate(`/job/${job.id}`)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--brand-primary)' }}>{job.title}</h3>
                    <span className="badge" style={{ fontSize: '0.7rem' }}>{timeAgo(job.created_at)}</span>
                  </div>
                  <p style={{ margin: '0 0 0.5rem 0', fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{job.company_name}</p>
                  <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={13} /> {job.city}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Briefcase size={13} /> {job.work_type}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {showAlertModal && <JobAlertModal onClose={() => setShowAlertModal(false)} />}

      <style>{`@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }`}</style>
    </div>
  );
}
