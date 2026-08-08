import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Gem, BookOpen, Home, User, Award, LogOut, Mic, Trophy, Users, PenTool } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { RedBird, LoginWelcomeToast } from './RedBird';

export default function Shell({ children }) {
  const { t, i18n } = useTranslation();
  const { user, logout, justLoggedIn, clearJustLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (justLoggedIn) {
      setShowWelcome(true);
      clearJustLoggedIn();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [justLoggedIn]);

  const links = [
    { to: '/dashboard', label: t('dashboard'), icon: Home },
    { to: '/courses', label: t('courses'), icon: BookOpen },
    { to: '/league', label: t('league'), icon: Trophy },
    { to: '/community', label: t('community'), icon: Users },
    { to: '/writing-practice', label: t('writingPractice'), icon: PenTool },
    { to: '/voice-practice', label: t('voicePractice'), icon: Mic },
    { to: '/certificate', label: t('certificate'), icon: Award },
    { to: '/profile', label: t('profile'), icon: User },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* 🌟 PURE GLASS HEADERBAR */}
      <header className="sticky top-0 z-40 px-2 sm:px-4 pt-2">
        <div className="mx-auto flex w-full max-w-[1700px] items-center justify-between gap-2 rounded-2xl glass-header px-3 sm:px-5 py-2.5">
          <button
            type="button"
            className="flex items-center gap-1.5 shrink-0"
            onClick={() => navigate('/dashboard')}
            aria-label={t('appName')}
          >
            <RedBird size={30} />
            <span className="display text-lg sm:text-xl font-bold brand-shimmer">LiteraAI</span>
          </button>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Main">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs lg:text-sm font-extrabold transition whitespace-nowrap ${
                    isActive
                      ? 'bg-white/35 text-[#032038] glass-strong border border-white/60 shadow-sm'
                      : 'text-[#032038]/75 hover:text-[#032038] hover:bg-white/20'
                  }`
                }
              >
                <Icon size={15} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <motion.div
              className="flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1 text-xs sm:text-sm font-black text-[#7a4d00] border border-white/50 shadow-inner backdrop-blur-md"
              whileHover={{ scale: 1.05 }}
              title={t('streak')}
            >
              <Flame size={15} />
              {user?.streak?.current || 0}
            </motion.div>
            <motion.div
              className="flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1 text-xs sm:text-sm font-black text-[#042e4c] border border-white/50 shadow-inner backdrop-blur-md"
              whileHover={{ scale: 1.05 }}
              title={t('gems')}
            >
              <Gem size={15} />
              {user?.gems || 0}
            </motion.div>

            {/* Prominent Glass Sign Out button */}
            <button
              type="button"
              className="flex items-center gap-1 sm:gap-1.5 rounded-xl bg-red-500/18 hover:bg-red-500/30 text-red-900 hover:text-red-950 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-black border border-red-400/50 transition shadow-md shrink-0 cursor-pointer backdrop-blur-md"
              onClick={() => { logout(); navigate('/'); }}
              aria-label={t('logout')}
              title={t('logout')}
            >
              <LogOut size={16} className="text-red-700" />
              <span className="font-extrabold">{t('logout')}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1700px] px-3 sm:px-6 pt-4">{children}</main>

      {/* 🌟 PURE GLASS MOBILE BOTTOM BAR */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/60 glass-header rounded-t-2xl shadow-2xl lg:hidden"
        aria-label="Mobile"
      >
        <div className="mx-auto grid max-w-lg grid-cols-8 gap-0.5 px-1 py-1.5">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-extrabold transition ${
                  isActive ? 'bg-white/35 text-[#032038] glass-strong border border-white/40' : 'text-[#032038]/70 hover:text-[#032038]'
                }`
              }
            >
              <Icon size={16} />
              <span className="truncate max-w-full">{label}</span>
            </NavLink>
          ))}
          <button
            type="button"
            onClick={() => { logout(); navigate('/'); }}
            className="flex flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-extrabold text-red-700 hover:bg-red-500/18 hover:text-red-900 transition"
            aria-label={t('logout')}
          >
            <LogOut size={16} />
            <span className="truncate max-w-full">{t('logout')}</span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {showWelcome ? (
          <LoginWelcomeToast
            key="login-welcome"
            message={t('birdLoginWelcome', { name: user?.name?.split(' ')[0] || 'Learner' })}
            lang={i18n.language}
            onDone={() => setShowWelcome(false)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
