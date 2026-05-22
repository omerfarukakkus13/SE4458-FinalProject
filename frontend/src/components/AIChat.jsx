import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchJobs } from '../services/api';

const INITIAL_MESSAGE = {
  role: 'ai',
  content: 'Merhaba! 👋 Kariyer hedefleriniz için yardımcı olmaya hazırım. Örneğin "İstanbul\'da frontend ilanlarını göster" veya "Uzaktan çalışmak istiyorum" diyebilirsiniz.',
};

function parseIntent(text) {
  const lower = text.toLowerCase();
  const cities = ['istanbul', 'izmir', 'ankara', 'bursa', 'antalya', 'gaziantep', 'adana', 'konya'];
  const positions = ['frontend', 'backend', 'full stack', 'devops', 'mobile', 'android', 'ios', 'yazılım', 'ux', 'ui', 'data', 'python', 'java', 'react', 'node', 'cloud'];
  const workTypes = ['uzaktan', 'remote', 'hibrit', 'tam zamanlı'];

  const city = cities.find(c => lower.includes(c));
  const position = positions.find(p => lower.includes(p));
  const workType = lower.includes('uzaktan') || lower.includes('remote') ? 'Uzaktan'
    : lower.includes('hibrit') ? 'Hibrit'
    : lower.includes('tam zaman') ? 'Tam Zamanlı'
    : undefined;

  return { city, position, workType };
}

export default function AIChat() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const addMessage = (msg) => setMessages(prev => [...prev, msg]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    addMessage({ role: 'user', content: text });
    setInput('');
    setLoading(true);

    try {
      const { city, position, workType } = parseIntent(text);
      const params = {};
      if (city) params.city = city.charAt(0).toUpperCase() + city.slice(1);
      if (position) params.position = position;
      if (workType) params.work_type = workType;
      params.limit = 3;

      const result = await fetchJobs(params);
      const jobs = result.data || [];

      if (jobs.length === 0) {
        addMessage({
          role: 'ai',
          content: 'Aradığınız kriterlere uygun ilan bulamadım. Farklı şehir veya pozisyon deneyebilirsiniz.',
        });
      } else {
        const cityLabel = params.city ? `${params.city}'da ` : '';
        const posLabel = position ? `${position} ` : '';
        addMessage({
          role: 'ai',
          content: `${cityLabel}${posLabel}için harika seçenekler buldum 🎯`,
          jobs,
        });
      }
    } catch (err) {
      addMessage({ role: 'ai', content: 'Üzgünüm, şu anda arama yapamıyorum. Lütfen backend servislerinin çalıştığından emin olun.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          id="ai-chat-btn"
          onClick={() => setIsOpen(true)}
          className="btn btn-primary animate-pulse-glow"
          title="AI Kariyer Asistanı"
          style={{ position: 'fixed', bottom: '2rem', right: '2rem', width: 62, height: 62, borderRadius: '50%', padding: 0, zIndex: 200, boxShadow: '0 8px 30px rgba(59,130,246,0.5)' }}
        >
          <MessageSquare size={26} />
        </button>
      )}

      {isOpen && (
        <div id="ai-chat-window" className="glass animate-fade-in" style={{ position: 'fixed', bottom: '2rem', right: '2rem', width: 400, height: 570, zIndex: 200, display: 'flex', flexDirection: 'column', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>

          {/* Header */}
          <div style={{ background: 'var(--brand-gradient)', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'white' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={20} />
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>KariyerAI Asistan</p>
                <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8 }}>İş arama yardımcısı</p>
              </div>
            </div>
            <X size={20} color="white" style={{ cursor: 'pointer' }} onClick={() => setIsOpen(false)} />
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-primary)' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', maxWidth: '88%' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: msg.role === 'user' ? 'var(--brand-primary)' : 'rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {msg.role === 'user' ? <User size={14} color="white" /> : <Bot size={14} color="var(--brand-secondary)" />}
                  </div>
                  <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: msg.role === 'user' ? 'var(--brand-primary)' : 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    {msg.content}
                  </div>
                </div>

                {/* Job cards inside chat */}
                {msg.jobs && msg.jobs.length > 0 && (
                  <div style={{ marginLeft: '2.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                    {msg.jobs.map(job => (
                      <div key={job.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.75rem', cursor: 'pointer', transition: 'var(--transition)' }}
                        onClick={() => { navigate(`/job/${job.id}`); setIsOpen(false); }}
                        onMouseOver={e => e.currentTarget.style.borderColor = 'var(--brand-primary)'}
                        onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                        <p style={{ margin: '0 0 0.2rem 0', fontWeight: 700, color: 'var(--brand-primary)', fontSize: '0.9rem' }}>{job.title}</p>
                        <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{job.company_name}</p>
                        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          <span>📍 {job.city}</span>
                          <span>💼 {job.work_type}</span>
                        </div>
                        <p style={{ margin: '0.5rem 0 0 0', color: 'var(--brand-primary)', fontSize: '0.82rem', fontWeight: 600 }}>[Detayları Gör →]</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Aranıyor...
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} style={{ padding: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem', background: 'var(--bg-secondary)', flexShrink: 0 }}>
            <input type="text" className="input" placeholder="Bir mesaj yazın..." value={input} onChange={e => setInput(e.target.value)}
              style={{ flex: 1, padding: '0.65rem 1rem', borderRadius: 'var(--radius-pill)' }} disabled={loading} />
            <button type="submit" className="btn btn-primary" style={{ width: 44, height: 44, padding: 0, borderRadius: '50%' }} disabled={loading}>
              <Send size={17} />
            </button>
          </form>
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </>
  );
}
