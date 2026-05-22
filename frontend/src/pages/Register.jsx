import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, UserPlus, Eye, EyeOff, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [role, setRole] = useState('job_seeker');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, role);
      setSuccess('Kayıt başarılı! E-posta adresinizi onaylayın, ardından giriş yapabilirsiniz.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message || 'Kayıt başarısız. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: 460, padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ background: 'var(--brand-gradient)', padding: '1rem', borderRadius: 'var(--radius-lg)', display: 'inline-flex', marginBottom: '1rem' }}>
            <Briefcase size={32} color="white" />
          </div>
          <h1 style={{ margin: 0, fontSize: '1.75rem' }}>Ücretsiz Üye Ol</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>
            KariyerAI'ya katılarak kariyer fırsatlarını keşfedin
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '1.5rem', color: '#f87171', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '1.5rem', color: '#4ade80', fontSize: '0.9rem' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ position: 'relative' }}>
            <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
            <input type="email" className="input" placeholder="E-posta adresiniz" value={email} onChange={e => setEmail(e.target.value)} required style={{ paddingLeft: '2.75rem' }} />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
            <input type={showPwd ? 'text' : 'password'} className="input" placeholder="Şifre (en az 6 karakter)" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingLeft: '2.75rem', paddingRight: '3rem' }} />
            <button type="button" onClick={() => setShowPwd(!showPwd)}
              style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
            <input type="password" className="input" placeholder="Şifreyi tekrar girin" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required style={{ paddingLeft: '2.75rem' }} />
          </div>

          <div style={{ position: 'relative' }}>
            <Briefcase size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
            <select className="input" value={role} onChange={e => setRole(e.target.value)} required style={{ paddingLeft: '2.75rem', appearance: 'none' }}>
              <option value="job_seeker">İş Arayan</option>
              <option value="employer">İşveren (İlan Yayınla)</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0.9rem', fontSize: '1rem', justifyContent: 'center', marginTop: '0.5rem' }}>
            {loading ? 'Kayıt yapılıyor...' : (<><UserPlus size={18} /> Üye Ol</>)}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '1.5rem', fontSize: '0.95rem' }}>
          Zaten hesabınız var mı?{' '}
          <Link to="/login" style={{ color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'none' }}>Giriş Yap</Link>
        </p>
      </div>
    </div>
  );
}
