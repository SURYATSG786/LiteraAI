import { getCoursesFromDb, getAssessmentsFromDb } from './db.js';
import { getPathFromScore, localize, LANGUAGES } from '../utils/auth.js';

export function loadCourses(lang = null) {
  return getCoursesFromDb(lang);
}

export function loadAssessments() {
  return getAssessmentsFromDb();
}

/** Every assessment/practice item must have full 6-language text + 4 options + answer index. */
export function isCompleteQuestion(q) {
  if (!q || typeof q !== 'object') return false;
  if (!q.id || q.correct_index == null || !(q.correct_index >= 0 && q.correct_index < 4)) return false;
  const textOk = (value) => {
    if (value == null) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'object' && !Array.isArray(value)) {
      return LANGUAGES.every((lang) => String(value[lang] || '').trim().length > 0);
    }
    return false;
  };
  if (!textOk(q.question)) return false;
  if (!Array.isArray(q.options) || q.options.length !== 4) return false;
  return q.options.every((opt) => textOk(opt));
}

function localizeQuestion(q, lang) {
  return {
    id: q.id,
    image: q.image || q.image_key || 'book',
    question: localize(q.question, lang),
    options: (q.options || []).map((o) => localize(o, lang)).filter((o) => String(o || '').trim().length > 0),
    // correct_index kept server-side only for assessment/checkpoint submit
  };
}

function localizeQuestionWithAnswer(q, lang) {
  return {
    ...localizeQuestion(q, lang),
    correct_index: q.correct_index,
    explanation: localize(q.explanation, lang),
  };
}

function localizeLesson(lesson, lang, includeAnswers = true) {
  return {
    id: lesson.id,
    title: localize(lesson.title, lang),
    learning_goal: localize(lesson.learning_goal, lang),
    teaching_content: localize(lesson.teaching_content, lang),
    image_key: lesson.image_key || 'book',
    practice_questions: (lesson.practice_questions || []).map((q) =>
      includeAnswers ? localizeQuestionWithAnswer(q, lang) : localizeQuestion(q, lang)
    ),
  };
}

export function getCoursesByPath(pathKey, lang = null) {
  return loadCourses(lang).filter((c) => c.path === pathKey);
}

const DEFAULT_FOUNDATION_COURSE = {
  id: 'foundation-1',
  path: 'foundation-1',
  title: { en: 'Literacy Foundations', hi: 'साक्षरता की नींव' },
  objective: { en: 'Build basic reading and writing skills', hi: 'बुनियादी पठन और लेखन कौशल बनाएं' },
  certificate_criteria: { min_score_percent: 70 },
  lessons: [
    {
      id: 'les_1',
      title: { en: 'Alphabet Basics', hi: 'वर्णमाला के मूल तत्व' },
      learning_goal: { en: 'Recognize basic letters and sounds', hi: 'मूल अक्षरों और ध्वनियों को पहचानें' },
      teaching_content: { en: 'Practice reading basic letters and words.', hi: 'मूल अक्षरों और शब्दों को पढ़ने का अभ्यास करें।' },
      image_key: 'book',
      practice_questions: [
        {
          id: 'q1',
          question: { en: 'Which letter comes first?', hi: 'कौन सा अक्षर पहले आता है?' },
          options: [{ en: 'A' }, { en: 'B' }, { en: 'C' }, { en: 'D' }],
          correct_index: 0,
        },
      ],
    },
  ],
  checkpoint_test: [
    { id: 'cp1', question: { en: 'What sound does A make?' }, options: [{ en: 'ah' }, { en: 'bee' }, { en: 'cat' }, { en: 'dog' }], correct_index: 0 },
    { id: 'cp2', question: { en: 'Select the letter B' }, options: [{ en: 'A' }, { en: 'B' }, { en: 'C' }, { en: 'D' }], correct_index: 1 },
    { id: 'cp3', question: { en: 'Select the letter A' }, options: [{ en: 'A' }, { en: 'B' }, { en: 'C' }, { en: 'D' }], correct_index: 0 },
    { id: 'cp4', question: { en: 'Select the letter A' }, options: [{ en: 'A' }, { en: 'B' }, { en: 'C' }, { en: 'D' }], correct_index: 0 },
    { id: 'cp5', question: { en: 'Select the letter A' }, options: [{ en: 'A' }, { en: 'B' }, { en: 'C' }, { en: 'D' }], correct_index: 0 },
    { id: 'cp6', question: { en: 'Select the letter D' }, options: [{ en: 'A' }, { en: 'B' }, { en: 'C' }, { en: 'D' }], correct_index: 3 },
    { id: 'cp7', question: { en: 'Select the letter B' }, options: [{ en: 'A' }, { en: 'B' }, { en: 'C' }, { en: 'D' }], correct_index: 1 },
  ],
};

export function getCourseById(id, lang = null) {
  const found = loadCourses(lang).find((c) => c.id === id || c.path === id);
  return found || loadCourses('en').find((c) => c.id === id || c.path === id) || DEFAULT_FOUNDATION_COURSE;
}

export function getRecommendedCourses(score, lang = null) {
  return getCoursesByPath(getPathFromScore(score), lang);
}

export function getRecommendedCourse(score, lang = null) {
  const list = getRecommendedCourses(score, lang);
  return list[0] || null;
}

export function getAssessmentQuestions(educationLevel, lang = 'en') {
  const bank = loadAssessments().find((a) => a.education_level === educationLevel);
  if (!bank) return [];
  return bank.questions
    .filter(isCompleteQuestion)
    .map((q) => localizeQuestion(q, lang))
    .filter((q) => q.question && Array.isArray(q.options) && q.options.length === 4);
}

export function scoreAssessment(educationLevel, answers) {
  const bank = loadAssessments().find((a) => a.education_level === educationLevel);
  if (!bank) {
    const err = new Error('Invalid education level');
    err.status = 400;
    throw err;
  }
  const byId = Object.fromEntries(bank.questions.map((q) => [q.id, q]));
  let correct = 0;
  for (const ans of answers) {
    const q = byId[ans.question_id];
    if (!q) continue;
    const idx = typeof ans.answer_index === 'number' ? ans.answer_index : Number(ans.answer_index);
    if (idx === q.correct_index) correct += 1;
  }
  const total = bank.questions.length;
  const score = Math.round((correct / total) * 100);
  return { score, correct, total, path: getPathFromScore(score) };
}

export function scoreCheckpoint(courseIdOrObject, rawAnswers) {
  const course = typeof courseIdOrObject === 'string'
    ? getCourseById(courseIdOrObject)
    : (courseIdOrObject?.id ? getCourseById(courseIdOrObject.id) || courseIdOrObject : courseIdOrObject);
  if (!course || !course.checkpoint_test) {
    const err = new Error('Course or checkpoint test not found');
    err.status = 404;
    throw err;
  }
  const answers = Array.isArray(rawAnswers)
    ? rawAnswers
    : (Array.isArray(rawAnswers?.answers) ? rawAnswers.answers : []);

  const questions = course.checkpoint_test || [];
  let correct = 0;
  answers.forEach((ans, i) => {
    const q = questions[i];
    const idx = typeof ans === 'number' ? ans : Number(ans);
    if (q && idx === q.correct_index) correct += 1;
  });
  const totalQuestions = questions.length || 1;
  const score = Math.round((correct / totalQuestions) * 100);
  const minScore = course.certificate_criteria?.min_score_percent ?? 70;
  return { score, correct, total: questions.length, passed: score >= minScore, minScore, course };
}

export function publicCourse(course, lang = 'en') {
  if (!course) return null;
  return {
    id: course.id,
    path: course.path,
    title: localize(course.title, lang),
    objective: localize(course.objective, lang),
    certificate_criteria: course.certificate_criteria,
    lesson_count: course.lessons.length,
    lessons: course.lessons.map((l, index) => ({
      index,
      ...localizeLesson(l, lang, true),
    })),
    checkpoint_test: course.checkpoint_test.map((q) => localizeQuestion(q, lang)),
  };
}

export function publicCourseSummary(course, lang = 'en') {
  if (!course) return null;
  return {
    id: course.id,
    path: course.path,
    title: localize(course.title, lang),
    objective: localize(course.objective, lang),
    certificate_criteria: course.certificate_criteria,
    lesson_count: course.lessons.length,
  };
}
