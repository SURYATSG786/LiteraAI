import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';
import { Award, Trophy, ShieldCheck, Download, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { PageTitle, FeedbackBanner } from '../components/ui';
import { GuideBird } from '../components/RedBird';
import { speakText } from '../audio';

const LEAGUE_CONFIG = {
  bronze: { key: 'bronzeLeague', defaultName: 'Bronze League', icon: '🥉', color: '#CD7F32', bg: 'from-amber-700/20 to-orange-900/20', border: 'border-amber-700/40' },
  silver: { key: 'silverLeague', defaultName: 'Silver League', icon: '🥈', color: '#C0C0C0', bg: 'from-slate-400/20 to-slate-700/20', border: 'border-slate-400/40' },
  gold: { key: 'goldLeague', defaultName: 'Gold League', icon: '🥇', color: '#FFD700', bg: 'from-yellow-500/20 to-amber-600/20', border: 'border-yellow-500/40' },
};

export default function League() {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const [status, setStatus] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [exam, setExam] = useState(null);
  const [examMode, setExamMode] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchStatus();
    fetchLeaderboard();
  }, []);

  function fetchStatus() {
    api.getLeagueStatus()
      .then(setStatus)
      .catch((err) => setError(err.message));
  }

  function fetchLeaderboard() {
    api.getLeaderboard()
      .then((res) => setLeaderboard(res.leaderboard || []))
      .catch(() => {});
  }

  function startExam() {
    setBusy(true);
    setError('');
    api.getLeagueExam()
      .then((data) => {
        setExam(data);
        setQIndex(0);
        setSelected(null);
        setAnswers([]);
        setResult(null);
        setExamMode(true);
      })
      .catch((err) => setError(err.message))
      .finally(() => setBusy(false));
  }

  function selectOption(optIdx) {
    setSelected(optIdx);
  }

  function nextQuestion() {
    if (selected == null) return;
    const nextAnswers = [...answers, selected];
    setAnswers(nextAnswers);

    if (qIndex + 1 < (exam?.questions?.length || 0)) {
      setQIndex(qIndex + 1);
      setSelected(null);
    } else {
      // Submit exam
      setBusy(true);
      api.submitLeagueExam(nextAnswers)
        .then((res) => {
          setResult(res);
          if (res.passed) {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            refreshUser(res.user);
            fetchStatus();
          }
        })
        .catch((err) => setError(err.message))
        .finally(() => setBusy(false));
    }
  }

  async function downloadPdf(leagueName) {
    try {
      const blob = await api.downloadLeagueCertificate(leagueName);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `literaai-${leagueName}-certificate.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message || 'Error downloading league certificate');
    }
  }

  const currentTier = status?.current_league || 'bronze';
  const config = LEAGUE_CONFIG[currentTier] || LEAGUE_CONFIG.bronze;

  function getLeagueTitle(key) {
    const cfg = LEAGUE_CONFIG[key];
    if (!cfg) return key;
    return t(cfg.key, cfg.defaultName);
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <PageTitle title={t('literacyLeagues', 'Literacy Leagues')} subtitle={t('leagueSubtitle', 'Advance through tiers by passing league exams')} />
        </div>
        <GuideBird message={t('birdGuideLeague', 'Compete and level up your league rank!')} mood="cheer" size={48} />
      </div>

      {error ? <div className="banner-err rounded-xl p-3 font-bold">{error}</div> : null}

      {/* Tiers Overview Bar */}
      <div className="grid grid-cols-3 gap-3">
        {Object.entries(LEAGUE_CONFIG).map(([key, cfg]) => {
          const isCurrent = currentTier === key;
          const isUnlocked = Object.keys(LEAGUE_CONFIG).indexOf(key) <= Object.keys(LEAGUE_CONFIG).indexOf(currentTier);

          return (
            <div
              key={key}
              className={`glass-card rounded-2xl p-4 text-center transition-all ${
                isCurrent
                  ? 'ring-2 ring-[#055f9e] scale-105 shadow-lg bg-white/35 border border-white/60 backdrop-blur-md'
                  : isUnlocked
                  ? 'opacity-90'
                  : 'opacity-50 grayscale'
              }`}
            >
              <div className="text-3xl mb-1">{cfg.icon}</div>
              <div className="font-extrabold text-sm text-[#06304f]">{t(cfg.key, cfg.defaultName)}</div>
              {isCurrent && (
                <span className="mt-1 inline-block text-[10px] font-black uppercase tracking-wider bg-[#0b6fb8] text-white px-2 py-0.5 rounded-full">
                  {t('currentRank', 'Current Rank')}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {!examMode ? (
        <>
          {/* Status Card */}
          <motion.div
            className={`glass-card rounded-3xl p-6 md:p-8 border-2 ${config.border} bg-gradient-to-br ${config.bg} space-y-6 text-center`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-6xl">{config.icon}</div>
            <div>
              <h2 className="text-2xl md:text-4xl font-black text-[#06304f]">{t(config.key, config.defaultName)}</h2>
              <p className="text-sm font-bold text-[#06304f]/70 mt-1">
                {status?.is_max_league
                  ? t('highestLeagueReached', '🏆 Highest League Reached! You are a Literacy Master.')
                  : t('passExamToRankUp', 'Pass the {{current}} exam to rank up to {{next}}.', {
                      current: getLeagueTitle(status?.current_league),
                      next: getLeagueTitle(status?.next_league),
                    })}
              </p>
            </div>

            {!status?.is_max_league && (
              <button
                type="button"
                disabled={busy}
                onClick={startExam}
                className="btn-primary py-3 px-8 text-base font-extrabold shadow-xl inline-flex items-center gap-2"
              >
                <Trophy size={20} /> {t('takeExam', 'Take {{title}} Exam', { title: getLeagueTitle(status?.current_league) })} <ArrowRight size={18} />
              </button>
            )}

            {/* Earned League Certificates */}
            {status?.certificates?.length > 0 && (
              <div className="border-t border-[#06304f]/15 pt-4 text-left space-y-3">
                <h3 className="font-extrabold text-sm text-[#06304f] flex items-center gap-1.5">
                  <Award size={18} className="text-[#0b6fb8]" /> {t('earnedLeagueCertificates', 'Earned League Certificates')}
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {status.certificates.map((cert) => (
                    <div key={cert.credential_id} className="bg-white/25 border border-white/40 backdrop-blur-md rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-xs text-[#032038]">{getLeagueTitle(cert.league)}</div>
                        <div className="text-[10px] text-[#032038]/60 font-mono">{t('score', 'Score')}: {cert.score}%</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => downloadPdf(cert.league)}
                        className="btn-ghost p-1.5 rounded-lg text-[#055f9e]"
                        title={t('downloadPdf', 'Download PDF')}
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Leaderboard Table Section */}
          <motion.div
            className="glass-card rounded-3xl p-6 md:p-8 space-y-4"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between border-b border-[#032038]/15 pb-3">
              <h3 className="font-black text-xl text-[#032038] flex items-center gap-2">
                <Trophy className="text-yellow-500" size={24} /> {t('globalLeagueLeaderboard', 'Global League Leaderboard')}
              </h3>
              <span className="text-xs font-bold text-[#032038]/60">
                {t('learnersRanked', '{{count}} Learners Ranked', { count: leaderboard.length })}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#032038]/10 text-xs font-extrabold text-[#032038]/50 uppercase">
                    <th className="py-2.5 px-3">{t('rank', 'Rank')}</th>
                    <th className="py-2.5 px-3">{t('learner', 'Learner')}</th>
                    <th className="py-2.5 px-3">{t('league', 'League')}</th>
                    <th className="py-2.5 px-3 text-right">{t('xp', 'XP')}</th>
                    <th className="py-2.5 px-3 text-right">{t('gems', 'Gems')}</th>
                    <th className="py-2.5 px-3 text-right">{t('streak', 'Streak')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#032038]/5 font-bold">
                  {leaderboard.map((u) => {
                    const cfg = LEAGUE_CONFIG[u.league] || LEAGUE_CONFIG.bronze;
                    return (
                      <tr
                        key={u.id}
                        className={`transition-colors ${
                          u.is_current_user ? 'bg-[#055f9e]/18 font-black text-[#055f9e]' : 'hover:bg-white/20 text-[#032038]'
                        }`}
                      >
                        <td className="py-3 px-3">
                          {u.rank === 1 ? '🥇 1' : u.rank === 2 ? '🥈 2' : u.rank === 3 ? '🥉 3' : `#${u.rank}`}
                        </td>
                        <td className="py-3 px-3 flex items-center gap-2">
                          {u.name}
                          {u.is_current_user && (
                            <span className="text-[10px] bg-[#055f9e] text-white px-2 py-0.5 rounded-full font-black uppercase">
                              {t('you', 'You')}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold"
                            style={{ backgroundColor: `${cfg.color}22`, color: cfg.color === '#E5E4E2' ? '#2B4C6F' : cfg.color }}
                          >
                            {cfg.icon} {getLeagueTitle(u.league)}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono">{u.xp} {t('xp', 'XP')}</td>
                        <td className="py-3 px-3 text-right font-mono">💎 {u.gems}</td>
                        <td className="py-3 px-3 text-right font-mono">🔥 {u.streak}{t('days', 'd')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      ) : (
        /* Exam Interface */
        <motion.div className="glass-card rounded-3xl p-6 md:p-8 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {!result ? (
            <>
              <div className="flex items-center justify-between border-b border-[#032038]/15 pb-4">
                <div>
                  <h3 className="font-black text-lg text-[#032038]">{exam?.title}</h3>
                  <div className="text-xs font-bold text-[#032038]/60">
                    {t('questionOf', 'Question {{current}} of {{total}}', { current: qIndex + 1, total: exam?.questions?.length })}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setExamMode(false)}
                  className="text-xs font-bold text-red-600 hover:underline"
                >
                  {t('exitExam', 'Exit Exam')}
                </button>
              </div>

              {/* Current Question */}
              {exam?.questions?.[qIndex] && (
                <div className="space-y-4">
                  <h2 className="text-lg md:text-xl font-extrabold text-[#032038]">
                    {exam.questions[qIndex].question}
                  </h2>

                  <div className="grid gap-2">
                    {exam.questions[qIndex].options.map((opt, optIdx) => (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => selectOption(optIdx)}
                        className={`p-3 rounded-2xl text-left font-bold text-sm transition-all border-2 ${
                          selected === optIdx
                            ? 'bg-[#055f9e] text-white border-[#055f9e]'
                            : 'bg-white/25 text-[#032038] border-white/40 hover:bg-white/40'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={selected == null || busy}
                    onClick={nextQuestion}
                    className="btn-primary w-full py-3 font-extrabold text-sm"
                  >
                    {qIndex + 1 < exam.questions.length ? t('nextQuestion', 'Next Question →') : t('submitExam', 'Submit Exam 🏆')}
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Exam Results Screen */
            <div className="text-center space-y-6 py-4">
              <div className="text-6xl">{result.passed ? '🎉' : '❌'}</div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-[#06304f]">
                  {result.passed ? t('promotionGranted', 'Promotion Granted!') : t('examNotPassed', 'Exam Not Passed')}
                </h2>
                <p className="text-sm font-bold text-[#06304f]/70 mt-1">
                  {t('scoredResult', 'You scored {{score}}% ({{correct}} / {{total}} correct). Required: {{required}}%.', {
                    score: result.score,
                    correct: result.correct,
                    total: result.total,
                    required: result.min_score,
                  })}
                </p>
              </div>

              {result.passed ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-700 font-extrabold text-sm">
                    {t('promotedTo', 'Congratulations! You have been promoted to the {{league}} League!', {
                      league: getLeagueTitle(result.new_league),
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadPdf(result.new_league)}
                    className="btn-primary py-3 px-6 font-extrabold inline-flex items-center gap-2"
                  >
                    <Download size={18} /> {t('downloadLeagueCertificate', 'Download League Certificate')}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={startExam}
                  className="btn-primary py-3 px-6 font-extrabold"
                >
                  {t('tryAgainExam', 'Try Again 🔄')}
                </button>
              )}

              <button
                type="button"
                onClick={() => setExamMode(false)}
                className="block mx-auto text-xs font-bold text-[#06304f]/60 hover:underline pt-2"
              >
                {t('backToLeagueDashboard', 'Back to League Dashboard')}
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
