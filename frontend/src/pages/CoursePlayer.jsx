import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { PageTitle, ProgressBar, FeedbackBanner } from '../components/ui';
import { GuideBird } from '../components/RedBird';
import { QuestionImage } from '../components/QuestionImage';
import { SpeakButton } from '../components/SpeakButton';
import { VoicePractice } from '../components/VoicePractice';
import { speakText } from '../audio';

export default function CoursePlayer() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [lessonIndex, setLessonIndex] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [error, setError] = useState('');
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    api.getCourse(id)
      .then((res) => {
        setCourse(res.course);
        setProgress(res.progress);
        const completed = res.progress?.lessons_completed || [];
        let start = 0;
        for (let i = 0; i < 4; i += 1) {
          if (!completed.includes(i)) {
            start = i;
            break;
          }
          start = Math.min(i, 3);
        }
        if (completed.length >= 4) start = 3;
        setLessonIndex(start);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  const lesson = course?.lessons?.[lessonIndex];
  const question = lesson?.practice_questions?.[qIndex];
  const completed = progress?.lessons_completed || [];

  useEffect(() => {
    if (question?.question) {
      speakText([t('birdGuideLesson'), question.question], i18n.language, false, true).catch(() => {});
    }
  }, [lessonIndex, qIndex, question?.question, i18n.language, t]);

  const canAccess = useMemo(() => {
    for (let i = 0; i < lessonIndex; i += 1) {
      if (!completed.includes(i)) return false;
    }
    return true;
  }, [completed, lessonIndex]);

  function check() {
    if (selected == null || !question) return;
    setRevealed(true);
    const isCorrect = selected === question.correct_index;
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      speakText(t('correctCheer'), i18n.language).catch(() => {});
    } else {
      speakText(t('tryAgainVoice'), i18n.language).catch(() => {});
    }
  }

  async function advance() {
    if (!revealed) return;
    if (qIndex + 1 < (lesson?.practice_questions?.length || 0)) {
      setQIndex((i) => i + 1);
      setSelected(null);
      setRevealed(false);
      return;
    }

    setFinishing(true);
    try {
      const totalQs = lesson?.practice_questions?.length || 1;
      const scorePercent = Math.round(((correctCount + (selected === question?.correct_index ? 1 : 0)) / totalQs) * 100);
      const res = await api.lessonProgress(lessonIndex, {
        lesson_index: lessonIndex,
        correct_count: correctCount,
        score: scorePercent,
        course_id: id,
      });
      refreshUser(res.user);
      setProgress({ ...progress, lessons_completed: res.lessons_completed });
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });

      const totalLessons = course?.lessons?.length || 1;
      if (lessonIndex < totalLessons - 1) {
        setLessonIndex((i) => i + 1);
        setQIndex(0);
        setSelected(null);
        setRevealed(false);
        setCorrectCount(0);
      } else {
        navigate('/certificate');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setFinishing(false);
    }
  }

  if (error) return <div className="banner-err rounded-xl px-3 py-2 font-extrabold">{error}</div>;
  if (!course || !lesson) return <div className="font-extrabold text-[#06304f]/70">{t('loading')}</div>;

  if (!canAccess) {
    return (
      <div className="glass-card rounded-3xl p-6">
        <p className="font-extrabold">{t('error')}</p>
        <button className="btn-primary mt-4" type="button" onClick={() => setLessonIndex(0)}>{t('back')}</button>
      </div>
    );
  }

  const isLastQ = qIndex + 1 >= lesson.practice_questions.length;
  const imageKey = question?.image || lesson.image_key || 'book';

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <PageTitle
            eyebrow={`${t(`pathLabels.${course.path}`)} · ${lessonIndex + 1}/4`}
            title={lesson.title}
            subtitle={lesson.learning_goal}
          />
        </div>
        <GuideBird
          key={`${lessonIndex}-${qIndex}`}
          message={t('birdGuideLesson')}
          autoSpeak={false}
          size={48}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <motion.section className="glass-card rounded-3xl p-4 md:p-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#06304f]/55">{t('learningGoal')}</div>
            </div>
            <p className="text-base font-extrabold leading-relaxed text-[#06304f]/90">{lesson.teaching_content}</p>
          </motion.section>
        </div>

        <AnimatePresence mode="wait">
          <motion.section
            key={`${lessonIndex}-${qIndex}`}
            className="glass-card rounded-3xl p-4 md:p-5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="grid gap-3 md:grid-cols-12 items-start">
              {/* Left Column: Image & Question */}
              <div className="md:col-span-5 space-y-2">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#06304f]/55">
                  {t('practice')} · {t('questionOf', { current: qIndex + 1, total: lesson.practice_questions.length })}
                </div>
                <QuestionImage imageKey={imageKey} className="h-28 w-full sm:h-32 md:h-36" />
                <div className="flex items-start justify-between gap-2">
                  <h2
                    className="display cursor-pointer text-base md:text-lg font-bold leading-snug hover:text-[#0b6fb8]"
                    onClick={() => speakText(question.question, i18n.language)}
                    title="Click to hear question"
                  >
                    {question.question}
                  </h2>
                  <SpeakButton text={question.question} label="" className="shrink-0 px-2 py-1" />
                </div>
              </div>

              {/* Right Column: Options & Check/Next Button */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-2">
                <div className="grid gap-2">
                  {question.options.map((opt, optIndex) => {
                    let cls = 'option py-2 px-3 text-xs sm:text-sm';
                    if (selected === optIndex) cls += ' selected';
                    if (revealed && optIndex === question.correct_index) cls += ' correct';
                    if (revealed && selected === optIndex && optIndex !== question.correct_index) cls += ' wrong';
                    return (
                      <button
                        key={optIndex}
                        type="button"
                        data-no-voice-guide="true"
                        className={cls}
                        disabled={revealed}
                        onClick={() => setSelected(optIndex)}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {revealed ? (
                  <FeedbackBanner
                    correct={selected === question.correct_index}
                    explanation={question.explanation}
                    t={t}
                  />
                ) : null}

                <div className="mt-3 flex flex-wrap gap-2">
                  {!revealed ? (
                    <button className="btn-primary w-full py-2 text-xs sm:text-sm" type="button" disabled={selected == null} onClick={check}>
                      {t('checkAnswer')}
                    </button>
                  ) : (
                    <button className="btn-primary w-full py-2 text-xs sm:text-sm" type="button" disabled={finishing} onClick={advance}>
                      {isLastQ ? (lessonIndex < (course?.lessons?.length || 1) - 1 ? t('nextLesson') : t('getCertificate')) : t('continue')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.section>
        </AnimatePresence>
      </div>
    </div>
  );
}
