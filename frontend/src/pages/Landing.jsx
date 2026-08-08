import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { SUPPORTED_LANGS, setAppLanguage } from '../i18n';
import { GuideBird } from '../components/RedBird';
import BackendStatus from '../components/BackendStatus';

export default function Landing() {
  const { t, i18n } = useTranslation();
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
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
          <motion.section
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55 }}
            className="pt-2"
          >
            <GuideBird message={t('birdGuideLogin')} />
            <h1 className="sky-title text-5xl leading-none md:text-6xl">LiteraAI</h1>
            <p className="sky-tagline mt-3 text-2xl md:text-3xl">{t('tagline')}</p>
            <p className="sky-sub mt-4 max-w-md text-lg leading-snug">{t('subtitle')}</p>

            <label className="mt-8 block max-w-xs">
              <span className="sky-label">{t('preferredLanguage')}</span>
              <select
                className="sky-select font-extrabold"
                value={(i18n.language || 'en').split('-')[0]}
                onChange={(e) => setAppLanguage(e.target.value)}
                aria-label={t('preferredLanguage')}
              >
                {SUPPORTED_LANGS.map((l) => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </label>
          </motion.section>

          <motion.form
            onSubmit={onSubmit}
            className="sky-card p-6 md:p-8"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            <h2 className="display mb-1 text-2xl font-bold">{t('login')}</h2>
            <p className="sky-sub mb-4 text-sm">{t('birdGuideLogin')}</p>
            <BackendStatus light />
            {error ? <div className="sky-error mb-4" role="alert">{error}</div> : null}

            <label className="mb-4 block">
              <span className="sky-label">{t('email')}</span>
              <input className="sky-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </label>
            <label className="mb-6 block">
              <span className="sky-label">{t('password')}</span>
              <input className="sky-input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            </label>

            <button className="sky-btn" disabled={busy} type="submit">
              {busy ? t('loading') : t('login')}
            </button>

            <p className="sky-sub mt-5 text-center">
              <Link className="sky-link" to="/register">
                {t('signup')}
              </Link>
            </p>
          </motion.form>
        </div>
      </div>
    </>
  );
}
