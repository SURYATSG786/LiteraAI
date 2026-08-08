import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/client';
import { PageTitle } from '../components/ui';
import { SUPPORTED_LANGS, setAppLanguage } from '../i18n';
import { GuideBird } from '../components/RedBird';

const EDU = [
  { value: 'No Formal Education', key: 'edu_none' },
  { value: 'Primary School', key: 'edu_primary' },
  { value: 'Middle School', key: 'edu_middle' },
  { value: 'High School', key: 'edu_high' },
];

export default function Profile() {
  const { t } = useTranslation();
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || '',
    preferred_language: (user?.preferred_language || 'en').split('-')[0],
    education_level: user?.education_level || 'Primary School',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const educationChanged = form.education_level !== user.education_level;
      const { user: next } = await api.updateMe(form);
      refreshUser(next);
      await setAppLanguage(form.preferred_language);
      setMessage(t('save'));
      if (educationChanged) {
        navigate('/assessment');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <PageTitle title={t('profile')} />
        </div>
        <GuideBird message={t('birdGuideProfile')} mood="think" size={48} />
      </div>
      <motion.form
        onSubmit={onSubmit}
        className="glass max-w-2xl rounded-3xl p-5 md:p-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {error ? <div className="mb-3 font-bold text-[#7a1f1f]">{error}</div> : null}
        {message ? <div className="mb-3 font-bold text-[#175c27]">{message}</div> : null}

        <label className="mb-4 block">
          <span className="label">{t('fullName')}</span>
          <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label className="mb-4 block">
          <span className="label">{t('preferredLanguage')}</span>
          <select
            className="input font-extrabold"
            value={form.preferred_language}
            onChange={(e) => setForm({ ...form, preferred_language: e.target.value })}
          >
            {SUPPORTED_LANGS.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </label>
        <label className="mb-6 block">
          <span className="label">{t('educationLevel')}</span>
          <select
            className="input font-extrabold"
            value={form.education_level}
            onChange={(e) => setForm({ ...form, education_level: e.target.value })}
          >
            {EDU.map((e) => (
              <option key={e.value} value={e.value}>{t(e.key)}</option>
            ))}
          </select>
          <span className="mt-1 block text-xs font-bold text-[#06304f]/55">
            {t('reassessNote')}
          </span>
        </label>

        <div className="flex flex-col gap-3">
          <button className="btn-primary" type="submit" disabled={busy}>
            {busy ? t('loading') : t('save')}
          </button>
          
          <button
            type="button"
            onClick={() => { logout(); navigate('/'); }}
            className="flex items-center justify-center gap-2 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-extrabold text-red-700 hover:bg-red-500/20 hover:text-red-800 transition"
          >
            <LogOut size={18} />
            <span>{t('logout')}</span>
          </button>
        </div>
      </motion.form>
    </div>
  );
}
