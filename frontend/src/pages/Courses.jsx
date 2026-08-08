import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { BookOpen, Sparkles, CheckCircle2, Trophy } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { PageTitle, ProgressBar } from '../components/ui';
import { GuideBird } from '../components/RedBird';

export default function Courses() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [courseScores, setCourseScores] = useState({});

  useEffect(() => {
    if (user?.assessment_score == null) return;
    api.recommended()
      .then(setData)
      .catch((err) => setError(err.message));
  }, [user?.assessment_score]);

  // Fetch scores for each course
  useEffect(() => {
    const courses = data?.courses || [];
    if (courses.length === 0) return;
    courses.forEach((c) => {
      api.getCourseScores(c.id).then((scores) => {
        setCourseScores((prev) => ({ ...prev, [c.id]: scores }));
      }).catch(() => {});
    });
  }, [data?.courses]);

  if (user?.assessment_score == null) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <PageTitle title={t('courses')} subtitle={t('unlockCourses')} />
          </div>
          <GuideBird message={t('birdGuideCoursesLocked')} mood="think" size={48} />
        </div>
        <div className="pt-2">
          <button className="btn-primary py-2.5 px-6 text-xs sm:text-sm font-bold shadow-md" type="button" onClick={() => navigate('/assessment')}>
            {t('takeAssessment')}
          </button>
        </div>
      </div>
    );
  }

  const courses = data?.courses || (data?.course ? [data.course] : []);

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <PageTitle
            eyebrow={t(`pathLabels.${data?.path || user.current_path}`)}
            title={t('recommendedCourse')}
          />
        </div>
        <GuideBird message={t('birdGuideLesson')} size={48} />
      </div>
      {error ? <div className="banner-err mb-3 rounded-xl px-3 py-2 font-extrabold">{error}</div> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {courses.map((course, i) => {
          const scores = courseScores[course.id];
          const hasScores = scores?.lessons?.length > 0;
          const completedLessons = scores?.lessons?.length || 0;
          const totalLessons = course.lesson_count || 4;

          return (
            <motion.article
              key={course.id}
              className="glass-card relative flex flex-col justify-between overflow-hidden rounded-[28px] p-4 md:p-5"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4 }}
            >
              <div>
                <div className="mb-2.5 flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/55 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#0b6fb8]">
                    <Sparkles size={14} /> {t(`pathLabels.${course.path}`)}
                  </div>
                  {scores?.course_average > 0 && (
                    <div className="inline-flex items-center gap-1 rounded-full bg-[#0b6fb8]/10 px-2.5 py-0.5 text-xs font-extrabold text-[#0b6fb8]">
                      <Trophy size={12} /> {scores.course_average}%
                    </div>
                  )}
                </div>
                <h2 className="display flex items-start gap-2 text-xl font-bold leading-snug">
                  <BookOpen className="mt-0.5 shrink-0 text-[var(--accent)]" size={20} />
                  {course.title}
                </h2>
              </div>

              {/* Per-lesson score indicators */}
              {hasScores ? (
                <div className="mt-3 space-y-1.5">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#06304f]/50">
                    {t('lessonsCompleted')}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from({ length: totalLessons }, (_, li) => {
                      const lessonScore = scores.lessons.find((l) => String(l.lesson_id) === String(li));
                      return (
                        <div
                          key={li}
                          className={`flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                            lessonScore
                              ? lessonScore.score >= 70
                                ? 'bg-green-100 text-green-700'
                                : 'bg-amber-100 text-amber-700'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {lessonScore ? (
                            <>
                              <CheckCircle2 size={10} />
                              L{li + 1}: {lessonScore.score}%
                            </>
                          ) : (
                            <>L{li + 1}</>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {scores.checkpoint_score != null && (
                    <div className="flex items-center gap-1 rounded-lg bg-[#0b6fb8]/10 px-2 py-0.5 text-[10px] font-bold text-[#0b6fb8] w-fit">
                      <Trophy size={10} /> Checkpoint: {scores.checkpoint_score}%
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-3">
                  <div className="mb-1.5 flex justify-between text-xs font-extrabold text-[#06304f]/70">
                    <span>{t('lessonsCompleted')}</span>
                    <span>{completedLessons} {t('of')} {totalLessons}</span>
                  </div>
                  <ProgressBar value={completedLessons} max={totalLessons} label={t('lessonsCompleted')} />
                </div>
              )}

              <button
                className="btn-primary mt-4 w-full"
                type="button"
                onClick={() => navigate(`/course/${course.id}`)}
              >
                {t('startCourse')}
              </button>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
