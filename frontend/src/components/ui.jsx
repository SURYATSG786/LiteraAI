import { motion } from 'motion/react';
import { getLessonImage } from './LessonImages';

export function ProgressBar({ value, max = 100, label }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="w-full" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className="progress-track">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        />
      </div>
    </div>
  );
}

export function StatChip({ icon: Icon, label, value, tone = 'green', onClick }) {
  const tones = {
    green: 'stat-green',
    blue: 'stat-blue',
    gold: 'stat-gold',
    red: 'stat-red',
  };
  return (
    <motion.div
      className={`glass-card rounded-2xl p-3 sm:p-3.5 ${tones[tone]} ${onClick ? 'cursor-pointer' : ''}`}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 320, damping: 18 }}
      onClick={onClick}
    >
      <div className="mb-1 flex items-center gap-1.5 text-[11px] sm:text-xs font-extrabold uppercase tracking-wide opacity-85 truncate">
        {Icon ? <Icon size={14} className="shrink-0" /> : null}
        <span className="truncate">{label}</span>
      </div>
      <div className="display text-base sm:text-lg md:text-xl font-bold truncate" title={String(value)}>
        {value}
      </div>
    </motion.div>
  );
}

export function PageTitle({ eyebrow, title, subtitle }) {
  return (
    <motion.div
      className="mb-2 sm:mb-3"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {eyebrow ? (
        <div className="mb-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#06304f]/60">{eyebrow}</div>
      ) : null}
      <h1 className="display text-xl font-bold text-[#06304f] sm:text-2xl md:text-3xl leading-snug">{title}</h1>
      {subtitle ? <p className="mt-0.5 max-w-3xl text-xs font-semibold text-[#06304f]/70 sm:text-sm">{subtitle}</p> : null}
    </motion.div>
  );
}

/** Image only — no description / prompt text */
export function LessonArt({ lessonId, title }) {
  const Art = getLessonImage(lessonId);
  return (
    <motion.div
      className="glass-card relative overflow-hidden rounded-[28px] p-2"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45 }}
      aria-label={title}
    >
      <div className="lesson-art-frame floaty overflow-hidden rounded-[22px]">
        <Art />
      </div>
    </motion.div>
  );
}

export function FeedbackBanner({ correct, explanation, t }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mt-4 rounded-2xl border px-4 py-3 font-bold backdrop-blur-xl ${
        correct ? 'banner-ok' : 'banner-err'
      }`}
      role="status"
    >
      <div className="text-lg font-extrabold">{correct ? t('correct') : t('incorrect')}</div>
      <div className="mt-1 text-sm opacity-90">{t('explanation')}: {explanation}</div>
    </motion.div>
  );
}
