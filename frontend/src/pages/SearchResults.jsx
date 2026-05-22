import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Filter, MapPin, Briefcase, X, Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { searchJobs } from '../services/api';
import { useAuth } from '../context/AuthContext';

const WORK_TYPES = ['Tam Zamanlı', 'Yarı Zamanlı', 'Uzaktan', 'Hibrit'];
const CITIES = ['İstanbul', 'İzmir', 'Ankara', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep', 'Mersin', 'Kayseri'];

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Controlled search inputs
  const [positionInput, setPositionInput] = useState(searchParams.get('position') || '');
  const [cityInput, setCityInput] = useState(searchParams.get('city') || '');

  // Filters
  const [filterTown, setFilterTown] = useState(searchParams.get('town') || '');
  const [filterWorkType, setFilterWorkType] = useState(searchParams.get('work_type') || '');
  const [filterCountry, setFilterCountry] = useState(searchParams.get('country') || '');
  const [filterCity, setFilterCity] = useState(searchParams.get('city') || '');

  // Results state
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  // Active filter chips (shown above results)
  const activeChips = [
    searchParams.get('position') && { key: 'position', label: searchParams.get('position') },
    searchParams.get('city') && { key: 'city', label: searchParams.get('city') },
    searchParams.get('town') && { key: 'town', label: searchParams.get('town') },
    searchParams.get('work_type') && { key: 'work_type', label: searchParams.get('work_type') },
    searchParams.get('country') && { key: 'country', label: searchParams.get('country') },
  ].filter(Boolean);

  const removeChip = (key) => {
    const next = new URLSearchParams(searchParams);
    next.delete(key);
    setSearchParams(next);
    setPage(1);
  };

  const clearAll = () => {
    setSearchParams({});
    setPositionInput('');
    setCityInput('');
    setFilterTown('');
    setFilterWorkType('');
    setFilterCity('');
    setFilterCountry('');
    setPage(1);
  };

  const doSearch = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchParams.get('position')) params.position = searchParams.get('position');
      if (searchParams.get('city')) params.city = searchParams.get('city');
      if (searchParams.get('town')) params.town = searchParams.get('town');
      if (searchParams.get('work_type')) params.work_type = searchParams.get('work_type');
      if (searchParams.get('country')) params.country = searchParams.get('country');
      params.page = page;
      params.limit = 10;
      if (user) params.userId = user.id;

      const data = await searchJobs(params);
      setResults(data.data || []);
      setPagination(data.pagination || null);
    } catch (e) {
      console.error('Search error', e);
    } finally {
      setLoading(false);
    }
  }, [searchParams, page, user]);

  useEffect(() => { doSearch(); }, [doSearch]);

  const applyFilters = (e) => {
    e.preventDefault();
    const next = new URLSearchParams();
    if (positionInput) next.set('position', positionInput);
    if (cityInput || filterCity) next.set('city', cityInput || filterCity);
    if (filterTown) next.set('town', filterTown);
    if (filterWorkType) next.set('work_type', filterWorkType);
    if (filterCountry) next.set('country', filterCountry);
    setSearchParams(next);
    setPage(1);
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const safeDate = dateStr.endsWith('Z') || dateStr.includes('+') ? dateStr : `${dateStr}Z`;
    const diff = Date.now() - new Date(safeDate).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return 'Az önce';
    if (h < 24) return `${h} saat önce`;
    return `${Math.floor(h / 24)} gün önce`;
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem', alignItems: 'start' }}>

      {/* ── Filters Pane ──────────────────────────────── */}
      <aside className="card animate-fade-in" style={{ position: 'sticky', top: '90px', padding: '1.5rem', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
        <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', marginBottom: '1rem', padding: '0.5rem' }} onClick={() => navigate(-1)}>
          <ChevronLeft size={16} /> Geri Dön
        </button>
        <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <Filter size={18} /> Filtreler
        </h3>

        <form onSubmit={applyFilters} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Pozisyon</label>
            <input type="text" className="input" placeholder="Pozisyon ara..." value={positionInput} onChange={e => setPositionInput(e.target.value)} style={{ padding: '0.6rem 0.9rem' }} />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Ülke</label>
            <select className="input" value={filterCountry} onChange={e => setFilterCountry(e.target.value)} style={{ padding: '0.6rem 0.9rem' }}>
              <option value="">Tümü</option>
              <option value="Türkiye">Türkiye</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Şehir</label>
            <input type="text" className="input" placeholder="Şehir ara..." value={cityInput} onChange={e => setCityInput(e.target.value)} style={{ padding: '0.6rem 0.9rem', marginBottom: '0.5rem' }} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {CITIES.map(c => (
                <button key={c} type="button"
                  onClick={() => setCityInput(c)}
                  style={{ padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-pill)', fontSize: '0.75rem', background: cityInput === c ? 'var(--brand-primary)' : 'var(--bg-tertiary)', color: cityInput === c ? 'white' : 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>İlçe</label>
            <input type="text" className="input" placeholder="İlçe ara (örn: Kadıköy)" value={filterTown} onChange={e => setFilterTown(e.target.value)} style={{ padding: '0.6rem 0.9rem' }} />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Çalışma Tercihi</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {WORK_TYPES.map(wt => (
                <label key={wt} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input type="checkbox" checked={filterWorkType === wt}
                    onChange={() => setFilterWorkType(filterWorkType === wt ? '' : wt)} />
                  {wt}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center' }}>
            <Search size={16} /> Uygula
          </button>
          <button type="button" className="btn btn-secondary" style={{ justifyContent: 'center' }} onClick={clearAll}>
            Filtreleri Temizle
          </button>
        </form>
      </aside>

      {/* ── Results ───────────────────────────────────── */}
      <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Seçili Filtreler ({activeChips.length})</span>
            {activeChips.map(chip => (
              <span key={chip.key} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-pill)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                {chip.label}
                <X size={13} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => removeChip(chip.key)} />
              </span>
            ))}
            <button onClick={clearAll} style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
              Filtreleri Temizle
            </button>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>
            {pagination ? `${pagination.total} İlan Bulundu` : 'Arama Sonuçları'}
          </h2>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <Loader2 size={40} color="var(--brand-primary)" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : results.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
            <Search size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
            <h3>Sonuç bulunamadı</h3>
            <p>Farklı anahtar kelimeler veya filtreler deneyin.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {results.map(job => (
                <div key={job.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ margin: '0 0 0.25rem 0', color: 'var(--brand-primary)', cursor: 'pointer', fontSize: '1.2rem' }}
                        onClick={() => navigate(`/job/${job.id}`)}>
                        {job.title}
                      </h3>
                      <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>{job.company_name}</p>
                    </div>
                    <span className="badge" style={{ background: 'rgba(139,92,246,0.1)', color: 'var(--brand-secondary)', flexShrink: 0 }}>
                      {timeAgo(job.created_at)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={15} /> {job.city} • {job.work_type}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Briefcase size={15} /> {job.position}</span>
                  </div>

                  {job.description && (
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {job.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.25rem' }}>
                    <button className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}
                      onClick={() => navigate(`/job/${job.id}`)}>
                      Detayları İncele
                    </button>
                    <button className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}
                      onClick={() => user ? navigate(`/job/${job.id}`) : navigate('/login')}>
                      Başvur
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '2rem' }}>
                <button className="btn btn-secondary" style={{ padding: '0.5rem', width: 40, height: 40, justifyContent: 'center' }}
                  disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft size={20} />
                </button>
                <span style={{ color: 'var(--text-secondary)' }}>
                  Sayfa {page} / {pagination.totalPages}
                </span>
                <button className="btn btn-secondary" style={{ padding: '0.5rem', width: 40, height: 40, justifyContent: 'center' }}
                  disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}

        <style>{`@keyframes spin { from{transform:rotate(0deg);}to{transform:rotate(360deg);} }`}</style>
      </section>
    </div>
  );
}
