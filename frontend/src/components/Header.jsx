import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, User, LogIn, LogOut, Shield, FileText, Bell, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchNotifications, markNotificationAsRead } from '../services/api';

export default function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    let intervalId;
    if (user) {
      loadNotifications();
      // Poll every 15 seconds to update the unread badge
      intervalId = setInterval(() => {
        loadNotifications();
      }, 15000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await fetchNotifications(user.id);
      setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.is_read) {
        await markNotificationAsRead(notif.id);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      }
      setShowDropdown(false);
      if (notif.job_id) {
        navigate(`/job/${notif.job_id}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      padding: '1rem 0',
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'var(--brand-gradient)', padding: '0.5rem', borderRadius: 'var(--radius-md)', display: 'flex' }}>
            <Briefcase size={22} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1.3rem', background: 'var(--brand-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            KariyerAI
          </span>
        </Link>

        {/* Nav right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user ? (
            <>
              {/* Employer Panel link — only for employer role */}
              {user.user_metadata?.role === 'employer' ? (
                <Link to="/admin" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
                  <Shield size={16} /> İşveren Paneli
                </Link>
              ) : (
                <Link to="/my-applications" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
                  <FileText size={16} /> Başvurularım
                </Link>
              )}
              <Link to="/my-alerts" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
                <Bell size={16} /> İş Alarmlarım
              </Link>
              {/* Notification Bell Dropdown */}
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => {
                    if (!showDropdown) loadNotifications();
                    setShowDropdown(!showDropdown);
                  }}
                  style={{
                    background: 'none', border: 'none', color: 'var(--text-secondary)',
                    cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', padding: '0.4rem'
                  }}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute', top: '2px', right: '2px',
                      background: 'var(--brand-primary)', color: 'white',
                      fontSize: '0.65rem', fontWeight: 'bold', width: 16, height: 16,
                      borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showDropdown && (
                  <div className="card animate-fade-in" style={{
                    position: 'absolute', top: '120%', right: '-50px', width: 320, padding: 0,
                    zIndex: 100, boxShadow: '0 10px 40px rgba(0,0,0,0.5)', border: '1px solid var(--border-color)', overflow: 'hidden'
                  }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)', fontWeight: 600 }}>
                      Bildirimler ({unreadCount} yeni)
                    </div>
                    <div style={{ maxHeight: 350, overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                          Henüz bir bildiriminiz yok.
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            style={{
                              padding: '1rem', borderBottom: '1px solid var(--border-color)',
                              background: n.is_read ? 'transparent' : 'rgba(139,92,246,0.1)',
                              cursor: 'pointer', display: 'flex', gap: '0.75rem', transition: 'var(--transition)'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                            onMouseOut={e => e.currentTarget.style.background = n.is_read ? 'transparent' : 'rgba(139,92,246,0.1)'}
                          >
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.is_read ? 'transparent' : 'var(--brand-primary)', marginTop: 6, flexShrink: 0 }} />
                            <div>
                              <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem', color: n.is_read ? 'var(--text-secondary)' : 'var(--text-primary)', lineHeight: 1.4 }}>
                                {n.message}
                              </p>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {new Date(n.created_at).toLocaleDateString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--brand-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={16} color="white" />
                </div>
                <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.email}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <LogOut size={16} /> Çıkış
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>
                Giriş Yap
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <LogIn size={16} /> Üye Ol
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
