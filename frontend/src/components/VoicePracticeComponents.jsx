import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

export function PronunciationFeedback({ gradedResult, labels }) {
  if (!gradedResult) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full rounded-xl border border-[#06304f]/15 bg-white/55 p-3"
    >
      <div className="flex items-center justify-between border-b border-[#06304f]/12 pb-2">
        <span className="text-xs font-extrabold uppercase tracking-wider text-[#06304f]/70">
          {labels.pronunciationScore}
        </span>
        <div className="flex items-center gap-1.5">
          <CheckCircle2
            className={`h-5 w-5 ${
              gradedResult.score >= 70 ? 'text-emerald-400' : 'text-amber-400'
            }`}
          />
          <span className="display text-xl font-black text-[#06304f]">
            {gradedResult.score}%
          </span>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {gradedResult.words.map((w, idx) => (
          <span
            key={idx}
            className={`rounded-lg px-2 py-0.5 text-[11px] font-extrabold ${
              w.correct
                ? 'bg-emerald-500/20 text-emerald-800 border border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-800 border border-rose-500/40'
            }`}
          >
            {w.text}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export function PracticeSummaryCard({ sentences, results, index, setIndex, totalAttempted, avgScore, handleResetAll, labels }) {
  return (
    <div className="glass-card rounded-2xl p-3 sm:p-4">
      <div className="mb-2 flex items-center gap-2 text-xs sm:text-sm font-extrabold text-[#06304f]">
        <span>{labels.practiceSummary}</span>
      </div>

      <div className="mb-2 text-center rounded-xl bg-[#0b6fb8]/8 p-2.5 border border-[#06304f]/12">
        <div className="display text-2xl font-black text-[#06304f]">{avgScore}%</div>
        <div className="text-[11px] font-bold text-[#06304f]/60 mt-0.5">
          {labels.overallScore} ({totalAttempted}/{sentences.length} {labels.completed})
        </div>
      </div>

      <div className="space-y-1.5">
        {sentences.map((sent, i) => {
          const res = results[i];
          return (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition border ${
                i === index
                  ? 'bg-[#0b6fb8]/12 border-[#0b6fb8]'
                  : 'bg-white/35 border-transparent hover:bg-white/60'
              }`}
            >
              <span className="font-extrabold text-[#06304f]/90 truncate max-w-[170px]">
                {i + 1}. {sent}
              </span>
              <span
                className={`font-black ${
                  res
                    ? res.score >= 70
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                    : 'text-[#06304f]/40'
                }`}
              >
                {res ? `${res.score}%` : '-'}
              </span>
            </button>
          );
        })}
      </div>

      {totalAttempted > 0 ? (
        <button
          type="button"
          onClick={handleResetAll}
          className="btn-ghost mt-4 w-full flex items-center justify-center gap-1.5 text-xs text-[#06304f]/70"
        >
          <span>{labels.tryAgain}</span>
        </button>
      ) : null}
    </div>
  );
}
