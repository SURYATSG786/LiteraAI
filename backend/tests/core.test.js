import test from 'node:test';
import assert from 'node:assert/strict';
import { getPathFromScore, passwordStrengthOk, LANGUAGES, EDUCATION_LEVELS } from '../src/utils/auth.js';
import {
  scoreAssessment,
  getRecommendedCourse,
  getRecommendedCourses,
  scoreCheckpoint,
  getAssessmentQuestions,
  publicCourse,
  loadAssessments,
  loadCourses,
  isCompleteQuestion,
} from '../src/services/courses.js';

test('only 6 supported languages', () => {
  assert.deepEqual(LANGUAGES, ['en', 'hi', 'ta', 'te', 'kn', 'ml']);
});

test('getPathFromScore maps bands correctly', () => {
  assert.equal(getPathFromScore(0), 'foundation');
  assert.equal(getPathFromScore(25), 'foundation');
  assert.equal(getPathFromScore(26), 'beginner');
  assert.equal(getPathFromScore(50), 'beginner');
  assert.equal(getPathFromScore(51), 'intermediate');
  assert.equal(getPathFromScore(75), 'intermediate');
  assert.equal(getPathFromScore(76), 'advanced');
  assert.equal(getPathFromScore(100), 'advanced');
});

test('passwordStrengthOk validates rules', () => {
  assert.equal(passwordStrengthOk('Password1'), true);
});

test('scoreAssessment uses answer_index', () => {
  const answers = Array.from({ length: 10 }, (_, i) => ({
    question_id: `nfe-${i + 1}`,
    answer_index: 99,
  }));
  answers[0].answer_index = 0; // Cow
  answers[1].answer_index = 1; // A
  answers[2].answer_index = 2; // Yellow
  const result = scoreAssessment('No Formal Education', answers);
  assert.equal(result.correct, 3);
  assert.equal(result.score, 30);
  assert.equal(result.path, 'beginner');
});

test('4 recommended courses per path', () => {
  assert.equal(loadCourses('en').length, 4);
  assert.equal(getRecommendedCourse(10).path, 'foundation');
  assert.equal(getRecommendedCourse(90).path, 'advanced');
});

test('assessment questions localize to Tamil without English fallback for question text', () => {
  const qs = getAssessmentQuestions('High School', 'ta');
  assert.equal(qs.length, 10);
  assert.match(qs[0].question, /ஊகம்|முடிவு|வாசகர்|படி/);
  assert.ok(qs[0].options.every((o) => typeof o === 'string' && o.length > 0));
  assert.ok(qs[0].image);
});

test('every assessment question is complete in all 6 languages', () => {
  for (const level of EDUCATION_LEVELS) {
    const bank = loadAssessments().find((a) => a.education_level === level);
    assert.ok(bank, level);
    assert.equal(bank.questions.length, 10, level);
    for (const q of bank.questions) {
      assert.equal(isCompleteQuestion(q), true, `${level}/${q.id}`);
    }
    for (const lang of LANGUAGES) {
      const qs = getAssessmentQuestions(level, lang);
      assert.equal(qs.length, 10, `${level}/${lang}`);
      for (const q of qs) {
        assert.ok(String(q.question || '').trim(), `${level}/${lang}/${q.id} question`);
        assert.equal(q.options.length, 4, `${level}/${lang}/${q.id} options`);
        assert.ok(q.options.every((o) => String(o || '').trim()), `${level}/${lang}/${q.id} empty option`);
      }
    }
  }
});

test('Primary School question 6 has text and options (regression)', () => {
  const qs = getAssessmentQuestions('Primary School', 'en');
  const q6 = qs.find((q) => q.id === 'ps-6');
  assert.ok(q6);
  assert.match(q6.question, /rhymes|cat/i);
  assert.equal(q6.options.length, 4);
  assert.ok(q6.options.includes('Hat'));
});

test('Tamil rhyme question must not use தொப்பி for பூனை (native ஓசை ஒற்றுமை)', () => {
  const bank = loadAssessments().find((a) => a.education_level === 'Primary School');
  const raw = bank.questions.find((q) => q.id === 'ps-6');
  assert.ok(raw);
  const taQ = raw.question.ta;
  const taCorrect = raw.options[raw.correct_index].ta;
  // Must not be the bad English cat/hat calque
  assert.equal(taCorrect === 'தொப்பி' && /பூனை/.test(taQ), false);
  assert.notEqual(taCorrect, 'தொப்பி');
  assert.match(taQ, /ஓசை|ஒற்றுமை|கல்|மலர்|வானம்/);
  assert.ok(['பல்', 'வளர்', 'கானம்'].includes(taCorrect), `unexpected Tamil rhyme answer: ${taCorrect}`);

  const ta = getAssessmentQuestions('Primary School', 'ta');
  const q6 = ta.find((q) => q.id === 'ps-6');
  assert.ok(q6);
  assert.equal(q6.options.includes('தொப்பி'), false);
  assert.ok(q6.options.includes(taCorrect));
});

test('foundation questions keep native prompts and answers semantically aligned', () => {
  const expectedFirstVowels = {
    hi: { courseId: 'foundation-hi', question: /मेरा पठन|साक्षरता|शब्द|प्रश्न|वर्णमाला/, answer: 'अ' },
    ta: { courseId: 'foundation-ta', question: /உயிரெழுத்துகள்|எழுத்து|மொழி/, answer: '12' },
    te: { courseId: 'foundation-te', question: /అచ్చులు|వర్ణమాల|అక్షరాస్యత|పదాలు|అక్షరాలు/, answer: '16' },
  };
  for (const [lang, expected] of Object.entries(expectedFirstVowels)) {
    const c = loadCourses(lang).find((course) => course.id === expected.courseId);
    assert.ok(c, `Course ${expected.courseId} must exist`);
    const q1 = c.lessons[0].practice_questions[0];
    const qText = typeof q1.question === 'object' ? q1.question[lang] : q1.question;
    assert.match(qText, expected.question, `${expected.courseId} Q1 ${lang} prompt`);
  }

  const oppositeTerms = {
    hi: /विपरीत/,
    ta: /எதிர்/,
    te: /వ్యతిరేక/,
    kn: /ವಿರುದ್ಧ/,
    ml: /വിപരീത/,
  };
  const soundAnswers = {
    hi: /^(?:बुह|कुह|दुह|अह|ति|द)$/,
    ta: /^(?:புஹ்|குஹ்|டுஹ்|அஹ்|தி)$/,
    te: /^(?:బుహ్|కుహ్|డుహ్|అహ్|ది)$/,
    kn: /^(?:ಬುಹ್|ಕುಹ್|ಡುಹ್|ಅಹ್|ದಿ)$/,
    ml: /^(?:ബുഹ്|കുഹ്|ഡുഹ്|അഹ്|ദി)$/,
  };

  const foundationCourses = loadCourses().filter((course) => course.path === 'foundation');
  for (const course of foundationCourses) {
    const questions = [
      ...course.lessons.flatMap((lesson) => lesson.practice_questions || []),
      ...(course.checkpoint_test || []),
    ];
    for (const question of questions) {
      for (const lang of Object.keys(oppositeTerms)) {
        if (oppositeTerms[lang].test(question.question[lang])) {
          const answer = question.options[question.correct_index][lang];
          assert.doesNotMatch(
            answer,
            soundAnswers[lang],
            `${course.id}/${question.id} ${lang} opposite answer: ${answer}`,
          );
        }
      }
    }
  }
});

test('no placeholder-like options in any language (assessments + courses)', () => {
  const placeholder = /^(Wrong choice|Wrong option|தவறான தேர்வு|गलत विकल्प|తప్పు ఎంపిక|ತಪ್ಪು ಆಯ್ಕೆ|തെറ്റായ തിരഞ്ഞെടുപ്പ്|Placeholder|dummy)$/i;
  const langs = LANGUAGES;

  function checkOptions(options, path) {
    for (const opt of options || []) {
      if (typeof opt === 'string') {
        assert.equal(placeholder.test(opt.trim()), false, `${path}: ${opt}`);
      } else if (opt && typeof opt === 'object') {
        for (const lang of langs) {
          const v = String(opt[lang] || '').trim();
          assert.ok(v.length > 0, `${path}.${lang} empty`);
          assert.equal(placeholder.test(v), false, `${path}.${lang}: ${v}`);
        }
      }
    }
  }

  for (const level of EDUCATION_LEVELS) {
    const bank = loadAssessments().find((a) => a.education_level === level);
    assert.equal(bank.questions.length, 10, level);
    for (const q of bank.questions) {
      checkOptions(q.options, `${level}/${q.id}`);
    }
  }

  for (const course of loadCourses()) {
    for (const lesson of course.lessons) {
      for (const q of lesson.practice_questions || []) {
        checkOptions(q.options, `${course.id}/${q.id || 'pq'}`);
      }
    }
    for (const q of course.checkpoint_test || []) {
      checkOptions(q.options, `${course.id}/${q.id || 'cp'}`);
    }
  }
});

test('native assessment and course text has no Latin English letters', () => {
  const latin = /[A-Za-z]/;
  const nativeLangs = ['hi', 'ta', 'te', 'kn', 'ml'];
  for (const level of EDUCATION_LEVELS) {
    const bank = loadAssessments().find((a) => a.education_level === level);
    for (const q of bank.questions) {
      for (const lang of nativeLangs) {
        assert.equal(latin.test(q.question[lang]), false, `${level}/${q.id} question.${lang}: ${q.question[lang]}`);
        q.options.forEach((opt, i) => {
          assert.equal(latin.test(opt[lang]), false, `${level}/${q.id} opt${i}.${lang}: ${opt[lang]}`);
        });
      }
    }
  }
  // Sample Primary Tamil past-tense question must use native verb, not English "go"
  const ta = getAssessmentQuestions('Primary School', 'ta');
  const ps1 = ta.find((q) => q.id === 'ps-1');
  assert.ok(ps1);
  assert.equal(/go|going|apple|article/i.test(ps1.question), false);
  assert.match(ps1.question, /போ/);
  assert.ok(ps1.options.every((o) => !/[A-Za-z]/.test(o)));
  assert.ok(ps1.options.includes('போனான்'));
  const ps3 = ta.find((q) => q.id === 'ps-3');
  assert.equal(/article|apple|___ apple/i.test(ps3.question), false);
  assert.ok(ps3.options.every((o) => !/[A-Za-z]/.test(o)));
  assert.equal(ps3.options.includes('தொப்பி'), false);

  function walk(obj, path = 'courses') {
    if (obj && typeof obj === 'object') {
      if (Object.prototype.hasOwnProperty.call(obj, 'en') && nativeLangs.some((l) => Object.prototype.hasOwnProperty.call(obj, l))) {
        for (const lang of nativeLangs) {
          if (typeof obj[lang] === 'string') {
            assert.equal(latin.test(obj[lang]), false, `${path}.${lang}: ${obj[lang].slice(0, 80)}`);
          }
        }
        return;
      }
      for (const [k, v] of Object.entries(obj)) walk(v, `${path}.${k}`);
    } else if (Array.isArray(obj)) {
      obj.forEach((v, i) => walk(v, `${path}[${i}]`));
    }
  }
  walk(loadCourses());
});

test('course content localizes', () => {
  const course = getRecommendedCourse(10, 'ta');
  const ta = publicCourse(course, 'ta');
  assert.match(ta.title, /என் மொழி|ஆற்றல்|எழுத்தறிவு|பயணம்|முதல்/);
  assert.ok(ta.lessons.length >= 1);
  assert.equal(ta.lessons[0].practice_questions[0].options.length, 4);
});

test('checkpoint scoring with indices', () => {
  const course = getRecommendedCourse(10);
  const fail = scoreCheckpoint(course.id, Array(10).fill(9));
  assert.equal(fail.passed, false);
  const perfect = course.checkpoint_test.map((q) => q.correct_index);
  const pass = scoreCheckpoint(course.id, perfect);
  assert.equal(pass.passed, true);
  assert.equal(pass.score, 100);
});
