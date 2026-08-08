import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { PageTitle, ProgressBar } from '../components/ui';
import { GuideBird } from '../components/RedBird';
import { QuestionImage } from '../components/QuestionImage';
import { SpeakButton } from '../components/SpeakButton';
import { speakText } from '../audio';

export default function Assessment() {
  const { t, i18n } = useTranslation();
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!started) return;
    api
      .getAssessment()
      .then((res) => {
        const usable = (res.questions || []).filter(
          (item) =>
            item
            && item.id
            && String(item.question || '').trim()
            && Array.isArray(item.options)
            && item.options.length === 4
            && item.options.every((opt) => String(opt || '').trim())
        );
        if (!usable.length) {
          setError(t('assessmentBroken'));
          setQuestions([]);
          return;
        }
        setQuestions(usable);
      })
      .catch((err) => setError(err.message));
  }, [started, t]);

  const q = questions[index];
  const canAnswer = Boolean(q?.question && Array.isArray(q?.options) && q.options.length === 4);

  useEffect(() => {
    if (started && q?.question) {
      speakText([t('birdGuideAssessment'), q.question], i18n.language, false, true).catch(() => {});
    }
  }, [started, index, q?.question, i18n.language, t]);

  async function submitAll(finalAnswers) {
    setBusy(true);
    try {
      const payload = Object.entries(finalAnswers).map(([question_id, answer_index]) => ({
        question_id,
        answer_index,
      }));
      const res = await api.submitAssessment(payload);
      refreshUser(res.user);
      setResult(res);
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.65 } });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function next() {
    if (selected == null || !q || !canAnswer) return;
    const nextAnswers = { ...answers, [q.id]: selected };
    setAnswers(nextAnswers);
    setSelected(null);
    if (index + 1 >= questions.length) {
      submitAll(nextAnswers);
    } else {
      setIndex((i) => i + 1);
    }
  }

  if (result) {
    return (
      <motion.div className="glass-card mx-auto max-w-xl rounded-[28px] p-6 text-center" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <GuideBird message={`${result.score}% · ${t(`pathLabels.${result.path}`)}`} mood="cheer" />
        <h1 className="display mt-2 text-4xl font-bold">{result.score}%</h1>
        <p className="mt-2 text-lg font-extrabold text-[#06304f]/80">{result.recommended_course?.title}</p>
        <p className="mt-3 font-bold text-[#06304f]/65">{result.recommended_course?.objective}</p>
        <button className="btn-primary mt-6" type="button" onClick={() => navigate('/courses')}>
          {t('goCourses')}
        </button>
      </motion.div>
    );
  }

  if (!started) {
    return (
      <div>
        <PageTitle eyebrow="LiteraAI" title={t('assessment')} subtitle={t('assessmentIntro')} />
        <GuideBird message={t('birdGuideAssessment')} />
        <motion.div className="glass-card max-w-xl rounded-[28px] p-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <button className="btn-primary" type="button" onClick={() => setStarted(true)}>{t('startAssessment')}</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <PageTitle
            title={t('assessment')}
            subtitle={t('questionOf', { current: Math.min(index + 1, questions.length || 10), total: questions.length || 10 })}
          />
        </div>
        <GuideBird
          key={index}
          message={t('birdGuideAssessment')}
          mood="think"
          size={48}
          autoSpeak={false}
          onSpeechEnd={() => q && speakText(q.question, i18n.language).catch(() => {})}
        />
      </div>

      {error ? <div className="banner-err mt-1.5 rounded-xl px-3 py-1.5 font-extrabold">{error}</div> : null}

      <AnimatePresence mode="wait">
        {q ? (
          <motion.div
            key={q.id}
            className="glass-card mt-1.5 rounded-2xl p-3 md:p-4"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
          >
            {canAnswer ? (
              <div className="grid gap-3 md:grid-cols-12 items-start">
                {/* Left Column: Image & Question */}
                <div className="md:col-span-5 space-y-2">
                  <QuestionImage imageKey={q.image} className="h-28 w-full sm:h-32 md:h-36" />
                  <div className="flex items-start justify-between gap-2">
                    <h2
                      className="display cursor-pointer text-base md:text-lg font-bold leading-snug hover:text-[#0b6fb8]"
                      onClick={() => speakText(q.question, i18n.language)}
                      title={t('listen')}
                    >
                      {q.question}
                    </h2>
                    <SpeakButton text={q.question} label="" className="shrink-0 px-2 py-1" />
                  </div>
                </div>

                {/* Right Column: 4 Options & Action Button */}
                <div className="md:col-span-7 flex flex-col justify-between space-y-2">
                  <div className="grid gap-1.5">
                    {q.options.map((opt, optIndex) => (
                      <button
                        key={`${q.id}-${optIndex}`}
                        type="button"
                        data-no-voice-guide="true"
                        className={`option py-1.5 px-3 text-xs sm:text-sm ${selected === optIndex ? 'selected' : ''}`}
                        onClick={() => setSelected(optIndex)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  <button className="btn-primary mt-2 w-full py-2 text-xs sm:text-sm" type="button" disabled={selected == null || busy} onClick={next}>
                    {index + 1 >= questions.length ? t('seeResults') : t('continue')}
                  </button>
                </div>
              </div>
            ) : (
              <p className="font-extrabold text-[#7a1f1f]">{t('assessmentBroken')}</p>
            )}
          </motion.div>
        ) : (
          <div className="mt-8 text-center font-extrabold text-[#06304f]/70">{t('loading')}</div>
        )}
      </AnimatePresence>
    </div>
  );
}
