import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Flame,
  Gem,
  Star,
  BookOpenCheck,
  Trophy,
  CheckCircle2,
  Mic,
  Sparkles,
  ArrowRight,
  Bot,
  Target,
  PenTool,
  GraduationCap,
  Award,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/client';
import { StatChip, ProgressBar } from '../components/ui';
import { GuideBird } from '../components/RedBird';
import { SpeakButton } from '../components/SpeakButton';

export default function Dashboard() {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [coach, setCoach] = useState('');
  const [busy, setBusy] = useState(false);

  const lessonsDone = user?.course_progress?.lessons_completed?.length || 0;
  const lessonScores = user?.course_progress?.lesson_scores || {};
  const scoreValues = Object.values(lessonScores).filter((v) => v > 0);
  const avgScore =
    scoreValues.length > 0
      ? Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length)
      : 0;

  useEffect(() => {
    let alive = true;
    api
      .coach()
      .then((res) => {
        if (alive) setCoach(res.message);
      })
      .catch(() => {
        if (alive) setCoach(t('birdGuideDashboard'));
      });
    return () => {
      alive = false;
    };
  }, [user?.name, lessonsDone, t]);

  async function setGoal(goal) {
    setBusy(true);
    try {
      const { user: next } = await api.updateMe({ streak_goal: goal });
      refreshUser(next);
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    } finally {
      setBusy(false);
    }
  }

  const firstName = user?.name?.split(' ')[0] || 'Learner';

  return (
    <div className="space-y-6 pb-6">
      {/* Hero Welcome Header Card */}
      <motion.div
        className="glass-card relative overflow-hidden rounded-3xl p-5 sm:p-7 shadow-xl border border-white/60"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#0b6fb8]/12 px-3 py-1 text-xs font-black text-[#0b6fb8] uppercase tracking-wider">
              <Sparkles size={14} className="text-[#0b6fb8]" />
              {user?.current_path ? t(`pathLabels.${user.current_path}`) : 'Learning Journey'}
            </div>

            <h1 className="display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#06304f] leading-tight">
              {t('welcome', { name: firstName })}
            </h1>

            <p className="text-xs sm:text-sm font-semibold text-[#06304f]/75 leading-relaxed">
              {user?.assessment_score == null
                ? t('unlockCourses')
                : t('birdGuideDashboardReady')}
            </p>
          </div>

          <div className="shrink-0 self-end md:self-center">
            <GuideBird
              message={
                user?.assessment_score == null
                  ? t('birdGuideDashboard')
                  : t('birdGuideDashboardReady')
              }
              mood={user?.assessment_score == null ? 'cheer' : 'happy'}
              size={56}
            />
          </div>
        </div>
      </motion.div>

      {/* Responsive Stat Chips Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatChip
          icon={Flame}
          label={t('streak')}
          value={`${user?.streak?.current || 0} ${t('days')}`}
          tone="gold"
        />
        <StatChip
          icon={Gem}
          label={t('gems')}
          value={user?.gems || 0}
          tone="blue"
        />
        <StatChip
          icon={Star}
          label={t('xp')}
          value={user?.xp || 0}
          tone="green"
        />
        <StatChip
          icon={BookOpenCheck}
          label={t('lessonsCompleted')}
          value={`${lessonsDone} ${t('of')} 4`}
          tone="red"
        />
        <StatChip
          icon={Trophy}
          label="League Rank"
          value={(user?.league || 'bronze').toUpperCase()}
          tone="gold"
          onClick={() => navigate('/league')}
        />
      </div>

      {/* Main Dashboard Asymmetric 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3 Width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Course Progress / Assessment Action Card */}
          <motion.section
            className="glass-card rounded-3xl p-5 sm:p-7 shadow-lg border border-white/60"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4 border-b border-[#06304f]/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-[#0b6fb8]/15 text-[#0b6fb8]">
                  <GraduationCap size={22} />
                </div>
                <div>
                  <h2 className="display text-lg sm:text-xl font-bold text-[#06304f]">
                    {user?.assessment_score == null ? t('assessment') : t('recommendedCourse')}
                  </h2>
                  <p className="text-xs font-semibold text-[#06304f]/60">
                    {user?.assessment_score == null
                      ? 'Required to unlock customized courses'
                      : `Track: ${t(`pathLabels.${user.current_path}`)}`}
                  </p>
                </div>
              </div>

              {user?.assessment_score != null && (
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-[#0b6fb8]/10 px-3 py-1 text-xs font-extrabold text-[#0b6fb8]">
                  {t('score')}: {user.assessment_score}%
                </span>
              )}
            </div>

            {user?.assessment_score == null ? (
              <div className="space-y-4 py-2">
                <p className="text-sm font-semibold text-[#06304f]/80 leading-relaxed">
                  {t('assessmentIntro')}
                </p>
                <button
                  className="btn-primary w-full sm:w-auto py-3 px-6 text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg"
                  type="button"
                  onClick={() => navigate('/assessment')}
                >
                  {t('takeAssessment')} <ArrowRight size={18} />
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-extrabold text-[#06304f]">
                    <span>{t('lessonsCompleted')}</span>
                    <span>{lessonsDone} / 4</span>
                  </div>
                  <ProgressBar
                    value={lessonsDone}
                    max={4}
                    label={t('lessonsCompleted')}
                  />
                </div>

                {/* Per-lesson score breakdown */}
                {scoreValues.length > 0 && (
                  <div className="rounded-2xl bg-white/20 p-4 border border-white/50 backdrop-blur-md space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-[#032038]/70">
                        Lesson Performance Breakdown
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#055f9e]/15 px-2.5 py-0.5 text-xs font-extrabold text-[#055f9e]">
                        <Trophy size={12} /> Avg: {avgScore}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {Object.entries(lessonScores).map(([lid, sc]) => (
                        <div
                          key={lid}
                          className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-extrabold border backdrop-blur-md ${
                            sc >= 70
                              ? 'bg-green-500/15 text-green-900 border-green-500/40'
                              : 'bg-amber-500/15 text-amber-900 border-amber-500/40'
                          }`}
                        >
                          <span className="flex items-center gap-1">
                            <CheckCircle2 size={13} className="shrink-0" />
                            L{Number(lid) + 1}
                          </span>
                          <span>{sc}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    className="btn-primary py-3 px-6 text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg"
                    type="button"
                    onClick={() => navigate('/courses')}
                  >
                    {t('goCourses')} <ArrowRight size={18} />
                  </button>

                  <button
                    className="btn-ghost py-3 px-5 text-sm font-extrabold flex items-center justify-center gap-2"
                    type="button"
                    onClick={() => navigate('/certificate')}
                  >
                    <Award size={18} className="text-[#055f9e]" /> {t('certificate')}
                  </button>
                </div>
              </div>
            )}
          </motion.section>

          {/* AI Literacy Coach Widget */}
          <motion.section
            className="glass-card rounded-3xl p-5 sm:p-6 shadow-lg border border-white/50"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            <div className="flex items-center justify-between mb-3 border-b border-[#032038]/12 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-amber-500/20 text-amber-800">
                  <Bot size={22} />
                </div>
                <div>
                  <h2 className="display text-base sm:text-lg font-bold text-[#032038]">
                    {t('coach')}
                  </h2>
                  <p className="text-[11px] font-semibold text-[#032038]/70">
                    Personalized audio guidance for your daily goal
                  </p>
                </div>
              </div>
              <SpeakButton text={coach} />
            </div>

            <div className="rounded-2xl bg-white/20 p-4 border border-white/50 shadow-inner backdrop-blur-md">
              <p className="text-xs sm:text-sm font-bold leading-relaxed text-[#032038]/90">
                {coach || t('loading')}
              </p>
            </div>
          </motion.section>
        </div>

        {/* Right Column (1/3 Width) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Streak & Daily Goal Card */}
          <motion.section
            className="glass-card rounded-3xl p-5 sm:p-6 shadow-lg border border-white/50 space-y-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div className="flex items-center gap-2.5 border-b border-[#032038]/12 pb-3">
              <div className="p-2 rounded-2xl bg-orange-500/20 text-orange-800">
                <Target size={20} />
              </div>
              <div>
                <h3 className="display text-base font-bold text-[#032038]">
                  {t('streak')} & {t('goal')}
                </h3>
                <p className="text-[11px] font-semibold text-[#032038]/70">
                  Target learning streak
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-extrabold text-[#032038]">
                <span>Current Streak</span>
                <span className="text-[#055f9e]">
                  {user?.streak?.current || 0} / {user?.streak?.goal || 14} {t('days')}
                </span>
              </div>
              <ProgressBar
                value={user?.streak?.current || 0}
                max={user?.streak?.goal || 14}
                label={t('streak')}
              />
            </div>

            <div className="pt-2">
              <span className="block text-[11px] font-extrabold uppercase tracking-wider text-[#032038]/60 mb-2">
                Set Streak Goal
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[7, 14, 30, 50].map((g) => {
                  const isActive = user?.streak?.goal === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      disabled={busy}
                      className={`rounded-xl py-1.5 text-xs font-black transition-all ${
                        isActive
                          ? 'bg-[#055f9e] text-white shadow-md scale-105'
                          : 'bg-white/25 text-[#032038] hover:bg-white/40 border border-white/40'
                      }`}
                      onClick={() => setGoal(g)}
                    >
                      {g}d
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.section>

          {/* Quick Practice & League Hub */}
          <div className="space-y-3">
            <span className="block text-xs font-extrabold uppercase tracking-wider text-[#06304f]/60 px-1">
              Quick Feature Hub
            </span>

            {/* Writing Practice Card */}
            <motion.div
              className="glass-card rounded-2xl p-4 cursor-pointer border border-white/60 shadow-md hover:shadow-xl transition-all"
              whileHover={{ y: -3, scale: 1.02 }}
              onClick={() => navigate('/writing-practice')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-indigo-500/15 text-indigo-700">
                    <PenTool size={20} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#06304f]">
                      ✍️ {t('writingPractice')}
                    </h4>
                    <p className="text-[11px] font-bold text-[#06304f]/60">
                      {t('writingPracticeSub') || 'Practice handwriting with OCR recognition'}
                    </p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-[#06304f]/50" />
              </div>
            </motion.div>

            {/* Voice Practice Card */}
            <motion.div
              className="glass-card rounded-2xl p-4 cursor-pointer border border-white/60 shadow-md hover:shadow-xl transition-all"
              whileHover={{ y: -3, scale: 1.02 }}
              onClick={() => navigate('/voice-practice')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-purple-500/15 text-purple-700">
                    <Mic size={20} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#06304f]">
                      {t('voicePractice')}
                    </h4>
                    <p className="text-[11px] font-bold text-[#06304f]/60">
                      Speak native sentences out loud
                    </p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-[#06304f]/50" />
              </div>
            </motion.div>

            {/* League Standings Card */}
            <motion.div
              className="glass-card rounded-2xl p-4 cursor-pointer border border-white/60 shadow-md hover:shadow-xl transition-all"
              whileHover={{ y: -3, scale: 1.02 }}
              onClick={() => navigate('/league')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-600">
                    <Trophy size={20} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#06304f]">
                      Literacy League
                    </h4>
                    <p className="text-[11px] font-bold text-[#06304f]/60">
                      Rank: {(user?.league || 'bronze').toUpperCase()}
                    </p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-[#06304f]/50" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
