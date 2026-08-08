import { findUserById, updateUser, sanitizeUser, getCourseScores as getCourseScoresDb } from '../services/db.js';
import { getPathFromScore } from '../utils/auth.js';
import {
  loadCourses,
  getRecommendedCourse,
  getRecommendedCourses,
  getCourseById,
  publicCourse,
  publicCourseSummary,
  scoreCheckpoint,
} from '../services/courses.js';
import { generateCourse } from '../services/gemini.js';
import { randomUUID } from 'crypto';

export function getRecommended(req, res) {
  try {
    const user = findUserById(req.user.id);
    const score = user.assessment_score;

    if (score == null) {
      return res.json({
        recommended: null,
        courses: [],
        message: 'Complete the assessment first to unlock personalized courses.',
      });
    }

    const path = getPathFromScore(score);
    const lang = user.preferred_language || 'en';
    const allCourses = loadCourses(lang);

    const userCourses = allCourses
      .map((c) => publicCourseSummary(c, lang))
      .filter((c) => c && c.title !== null && c.title !== undefined);

    const recommendedFull = getRecommendedCourse(
      score,
      user.preferred_language,
      user.education_level
    );
    const rec = publicCourseSummary(recommendedFull, lang);

    res.json({
      path,
      recommended: (rec && rec.title) ? rec : (userCourses[0] || null),
      courses: userCourses,
    });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

export function getCourse(req, res) {
  try {
    const user = findUserById(req.user.id);
    const courseId = req.params.id;
    const course = getCourseById(
      courseId,
      user.preferred_language,
      user.education_level
    );
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json({ course: publicCourse(course, user.preferred_language) });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

export function markLessonProgress(req, res) {
  try {
    const user = findUserById(req.user.id);
    const { lessonId } = req.params;
    const { score, course_id } = req.body || {};
    const current = user.course_progress || { lessons_completed: [], checkpoint_passed: false, lesson_scores: {} };
    const completed = new Set(current.lessons_completed || []);
    completed.add(lessonId);

    const lessonScore = typeof score === 'number' ? Math.round(score) : 0;
    const existingScores = current.lesson_scores || {};
    const newLessonScores = { ...existingScores, [lessonId]: lessonScore };

    const xpGained = 15;
    const newXp = (user.xp || 0) + xpGained;

    const updated = updateUser(user.id, {
      xp: newXp,
      course_progress: {
        ...current,
        course_id: course_id || current.course_id || null,
        lessons_completed: Array.from(completed),
        lesson_scores: newLessonScores,
      },
    });

    res.json({
      message: 'Lesson completed',
      xp_gained: xpGained,
      score: lessonScore,
      user: sanitizeUser(updated),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export function submitCheckpoint(req, res) {
  try {
    const user = findUserById(req.user.id);
    const { courseId } = req.params;
    const answers = req.body.answers || [];

    const course = getCourseById(
      courseId,
      user.preferred_language,
      user.education_level
    );
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const result = scoreCheckpoint(courseId, answers);
    let certificate = user.certificate;

    if (result.passed) {
      const currentProgress = user.course_progress || {};
      const newXp = (user.xp || 0) + 100;
      const newGems = (user.gems || 0) + 10;

      const courseTitleStr = typeof course.title === 'string' ? course.title : (course.title?.en || 'Foundation Course');
      certificate = {
        issued: true,
        course_id: courseId,
        course_title: courseTitleStr,
        issued_date: new Date().toISOString(),
        score: result.score,
        credential_id: 'LIT-' + randomUUID().slice(0, 8).toUpperCase(),
      };

      updateUser(user.id, {
        xp: newXp,
        gems: newGems,
        course_progress: {
          ...currentProgress,
          checkpoint_passed: true,
        },
        certificate,
      });
    }

    res.json({
      score: result.score,
      passed: result.passed,
      min_score: result.minScore,
      correct: result.correct,
      total: result.total,
      certificate: result.passed ? certificate : null,
      user: sanitizeUser(findUserById(user.id)),
    });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

export async function generateCourseHandler(req, res) {
  try {
    const user = findUserById(req.user.id);
    const score = req.body?.assessment_score ?? user.assessment_score;
    if (score == null) {
      return res.status(400).json({ error: 'Assessment score required' });
    }
    const result = await generateCourse({
      assessment_score: score,
      education_level: req.body?.education_level || user.education_level,
      preferred_language: req.body?.preferred_language || user.preferred_language,
      learner_name: req.body?.learner_name || user.name,
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export function getCourseScoresHandler(req, res) {
  try {
    const user = findUserById(req.user.id);
    const { id } = req.params;
    const scores = getCourseScoresDb(user.id, id);
    res.json(scores);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}
