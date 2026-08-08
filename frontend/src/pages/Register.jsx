import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { SUPPORTED_LANGS } from '../i18n';
import { RedBird } from '../components/RedBird';
import BackendStatus from '../components/BackendStatus';

const EDU = [
  { value: 'No Formal Education', key: 'edu_none' },
  { value: 'Primary School', key: 'edu_primary' },
  { value: 'Middle School', key: 'edu_middle' },
  { value: 'High School', key: 'edu_high' },
];

const FEATURES = [
  { icon: '🤖', title: 'AI-Powered', desc: 'Personalized lessons that adapt to your pace' },
  { icon: '🌍', title: 'Multilingual', desc: 'Learn in Hindi, Tamil, Telugu, Kannada & more' },
  { icon: '🎯', title: 'Track Progress', desc: 'Earn certificates and track your journey' },
  { icon: '🆓', title: '100% Free', desc: 'Quality education accessible to everyone' },
];

export default function Register() {
  const { t, i18n } = useTranslation();
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    preferred_language: (i18n.language || 'en').split('-')[0],
    education_level: 'Primary School',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || t('error'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="sky-page relative min-h-screen overflow-hidden px-4 py-4 md:py-6">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 md:items-center md:min-h-[calc(100vh-3rem)]">
          {/* Left side — redesigned branding panel */}
          <motion.section
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55 }}
            className="flex flex-col items-start gap-6 pt-2"
          >
            {/* Mascot + brand */}
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ y: [0, -8, 0], rotate: [0, -3, 0, 3, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <RedBird size={80} mood="wave" />
              </motion.div>
              <div>
                <h1 className="sky-title text-5xl leading-none md:text-6xl">LiteraAI</h1>
                <p className="sky-tagline mt-1 text-xl md:text-2xl">{t('tagline')}</p>
              </div>
            </div>

            {/* Feature cards */}
            <div className="grid w-full grid-cols-2 gap-3">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 + i * 0.1 }}
                  className="rounded-2xl border border-white/60 bg-white/40 p-4 backdrop-blur-sm"
                  style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
                >
                  <div className="mb-2 text-2xl">{f.icon}</div>
                  <h3 className="display text-sm font-bold text-[var(--text)]">{f.title}</h3>
                  <p className="mt-1 text-xs leading-snug text-[var(--muted)]">{f.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-3 rounded-xl border border-white/50 bg-white/30 px-4 py-3 backdrop-blur-sm"
            >
              <div className="flex -space-x-2">
                {['🧑‍🎓', '👩‍🏫', '👨‍💻'].map((e, i) => (
                  <span key={i} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-sky-100 text-sm">{e}</span>
                ))}
              </div>
              <p className="text-sm font-semibold text-[var(--text)]">
                Join thousands learning to read &amp; write
              </p>
            </motion.div>
          </motion.section>

          {/* Right side — register form */}
          <motion.form
            onSubmit={onSubmit}
            className="sky-card p-6 md:p-8"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            <h2 className="display mb-1 text-2xl font-bold">{t('signup')}</h2>
            <BackendStatus light />
            {error ? <div className="sky-error mb-4" role="alert">{error}</div> : null}

            <div className="mb-4 grid grid-cols-2 gap-4">
              <label className="block">
                <span className="sky-label">{t('fullName')}</span>
                <input className="sky-input" required value={form.name} onChange={(e) => setField('name', e.target.value)} autoComplete="name" />
              </label>
              <label className="block">
                <span className="sky-label">Age</span>
                <input className="sky-input" type="number" min="5" max="120" required value={form.age} onChange={(e) => setField('age', e.target.value)} placeholder="e.g. 25" />
              </label>
            </div>
            <label className="mb-4 block">
              <span className="sky-label">{t('email')}</span>
              <input className="sky-input" type="email" required value={form.email} onChange={(e) => setField('email', e.target.value)} autoComplete="email" />
            </label>
            <label className="mb-4 block">
              <span className="sky-label">{t('password')}</span>
              <input className="sky-input" type="password" required value={form.password} onChange={(e) => setField('password', e.target.value)} autoComplete="new-password" />
              <span className="sky-sub mt-1 block text-xs">{t('passwordHint')}</span>
            </label>
            <div className="mb-6 grid grid-cols-2 gap-4">
              <label className="block">
                <span className="sky-label">{t('preferredLanguage')}</span>
                <select
                  className="sky-select font-extrabold"
                  value={form.preferred_language}
                  onChange={(e) => setField('preferred_language', e.target.value)}
                >
                  {SUPPORTED_LANGS.map((l) => (
                    <option key={l.code} value={l.code}>{l.label}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="sky-label">{t('educationLevel')}</span>
                <select
                  className="sky-select font-extrabold"
                  value={form.education_level}
                  onChange={(e) => setField('education_level', e.target.value)}
                >
                  {EDU.map((e) => (
                    <option key={e.value} value={e.value}>{t(e.key)}</option>
                  ))}
                </select>
              </label>
            </div>

            <button className="sky-btn" disabled={busy} type="submit">
              {busy ? t('loading') : t('signup')}
            </button>
            <p className="sky-sub mt-5 text-center">
              <Link className="sky-link" to="/">{t('login')}</Link>
            </p>
          </motion.form>
        </div>
      </div>
    </>
  );
}
