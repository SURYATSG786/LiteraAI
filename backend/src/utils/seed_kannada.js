import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { assertStoreWritable } from '../services/db.js';

assertStoreWritable();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, '../../data/literaai.sqlite'));

const kannadaCourses = [
  {
    id: 'foundation-kn',
    path: 'foundation',
    lang: 'kn',
    title: 'ನನ್ನ ಮೊದಲ ಸಾಕ್ಷರತಾ ಪ್ರಯಾಣ',
    description: 'ಕನ್ನಡ ವರ್ಣಮಾಲೆ, ನಾಮಪದ, ಬಹುವಚನ, ವಿಶೇಷಣ, ಕ್ರಿಯಾಪದ ಮತ್ತು ಮೂಲ ಪದಗಳು.',
    questions: [
      {
        id: 'kn_c1_q1',
        question: 'ಕನ್ನಡ ವರ್ಣಮಾಲೆಯಲ್ಲಿ ಸ್ವರಗಳು ಎಷ್ಟು?',
        options: ['12', '13', '14', '15'],
        correct_index: 1,
        explanation: 'ಕನ್ನಡ ವರ್ಣಮಾಲೆಯಲ್ಲಿ 13 ಸ್ವರಗಳಿವೆ.',
      },
      {
        id: 'kn_c1_q2',
        question: '“ಅಮ್ಮ” ಯಾವ ಪದವರ್ಗಕ್ಕೆ ಸೇರಿದೆ?',
        options: ['ಕ್ರಿಯಾಪದ', 'ನಾಮಪದ', 'ವಿಶೇಷಣ', 'ಸರ್ವನಾಮ'],
        correct_index: 1,
        explanation: '“ಅಮ್ಮ” ಎಂಬುದು ನಾಮಪದ.',
      },
      {
        id: 'kn_c1_q3',
        question: '“ಮರ” ಪದದ ಬಹುವಚನ ಯಾವುದು?',
        options: ['ಮರ', 'ಮರಗಳು', 'ಮರಗಳ', 'ಮರವು'],
        correct_index: 1,
        explanation: '“ಮರ” ಪದದ ಬಹುವಚನ “ಮರಗಳು”.',
      },
      {
        id: 'kn_c1_q4',
        question: '“ಒಳ್ಳೆಯ” ಯಾವ ಪದವರ್ಗ?',
        options: ['ವಿಶೇಷಣ', 'ನಾಮಪದ', 'ಕ್ರಿಯಾಪದ', 'ಸರ್ವನಾಮ'],
        correct_index: 0,
        explanation: '“ಒಳ್ಳೆಯ” ಎಂಬುದು ವಿಶೇಷಣ.',
      },
      {
        id: 'kn_c1_q5',
        question: '“ಓದುತ್ತಿದ್ದೇನೆ” ಯಾವ ಪದವರ್ಗಕ್ಕೆ ಸೇರಿದೆ?',
        options: ['ನಾಮಪದ', 'ಕ್ರಿಯಾಪದ', 'ವಿಶೇಷಣ', 'ಸರ್ವನಾಮ'],
        correct_index: 1,
        explanation: '“ಓದುತ್ತಿದ್ದೇನೆ” ಎಂಬುದು ಕ್ರಿಯಾಪದ.',
      },
      {
        id: 'kn_c1_q6',
        question: '“ಪುಸ್ತಕ” ಎಂಬ ಪದದ ಅರ್ಥವೇನು?',
        options: ['ಮನೆ', 'ಗ್ರಂಥ', 'ರಸ್ತೆ', 'ಮರ'],
        correct_index: 1,
        explanation: '“ಪುಸ್ತಕ” ಎಂದರೆ ಗ್ರಂಥ.',
      },
      {
        id: 'kn_c1_q7',
        question: '“ಶಾಲೆ” ಎಂಬ ಪದದ ಅರ್ಥವೇನು?',
        options: ['ಆಸ್ಪತ್ರೆ', 'ಕಲಿಯುವ ಸ್ಥಳ', 'ಮಾರುಕಟ್ಟೆ', 'ಉದ್ಯಾನ'],
        correct_index: 1,
        explanation: 'ಶಾಲೆ ಎಂದರೆ ಕಲಿಯುವ ಸ್ಥಳ.',
      },
    ],
  },
  {
    id: 'beginner-kn',
    path: 'beginner',
    lang: 'kn',
    title: 'ನನ್ನ ಸುತ್ತಲಿನ ಪದಗಳು',
    description: 'ವರ್ತಮಾನಕಾಲ, ಭೂತಕಾಲ ಮತ್ತು ಭವಿಷ್ಯತ್ಕಾಲದ ವಾಕ್ಯಗಳನ್ನು ಕಲಿಯಿರಿ.',
    questions: [
      {
        id: 'kn_c2_q1',
        question: '“ನಾನು ಶಾಲೆಗೆ ಹೋಗುತ್ತಿದ್ದೇನೆ.” ಇದು ಯಾವ ಕಾಲ?',
        options: ['ಭೂತಕಾಲ', 'ವರ್ತಮಾನಕಾಲ', 'ಭವಿಷ್ಯತ್ಕಾಲ', 'ಆಜ್ಞಾರ್ಥಕ'],
        correct_index: 1,
        explanation: 'ಇದು ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ಕ್ರಿಯೆ, ಆದ್ದರಿಂದ ವರ್ತಮಾನಕಾಲ.',
      },
      {
        id: 'kn_c2_q2',
        question: '“ಅವನು ನಿನ್ನೆ ಬಂದನು.” ಇದು ಯಾವ ಕಾಲ?',
        options: ['ಭೂತಕಾಲ', 'ವರ್ತಮಾನಕಾಲ', 'ಭವಿಷ್ಯತ್ಕಾಲ', 'ಯಾವುದೂ ಅಲ್ಲ'],
        correct_index: 0,
        explanation: 'ಬಂದನು ಎಂಬುದು ಭೂತಕಾಲದ ಕ್ರಿಯೆ.',
      },
      {
        id: 'kn_c2_q3',
        question: '“ನಾನು ನಾಳೆ ಹೋಗುವೆ.” ಇದು ಯಾವ ಕಾಲ?',
        options: ['ವರ್ತಮಾನಕಾಲ', 'ಭವಿಷ್ಯತ್ಕಾಲ', 'ಭೂತಕಾಲ', 'ನಾಮಪದ'],
        correct_index: 1,
        explanation: 'ಹೋಗುವೆ ಎಂಬುದು ಭವಿಷ್ಯತ್ಕಾಲವನ್ನು ಸೂಚಿಸುತ್ತದೆ.',
      },
      {
        id: 'kn_c2_q4',
        question: '“ಅವಳು ಹಾಡುತ್ತಿದ್ದಾಳೆ.” ಇದು ಯಾವ ಕಾಲ?',
        options: ['ವರ್ತಮಾನಕಾಲ', 'ಭೂತಕಾಲ', 'ಭವಿಷ್ಯತ್ಕಾಲ', 'ವಿಶೇಷಣ'],
        correct_index: 0,
        explanation: 'ಹಾಡುತ್ತಿದ್ದಾಳೆ ಎಂಬುದು ವರ್ತಮಾನಕಾಲ.',
      },
      {
        id: 'kn_c2_q5',
        question: '“ತಿಂದನು” ಯಾವ ಕಾಲವನ್ನು ಸೂಚಿಸುತ್ತದೆ?',
        options: ['ವರ್ತಮಾನಕಾಲ', 'ಭೂತಕಾಲ', 'ಭವಿಷ್ಯತ್ಕಾಲ', 'ಯಾವುದೂ ಅಲ್ಲ'],
        correct_index: 1,
        explanation: 'ತಿಂದನು ಭೂತಕಾಲಕ್ಕೆ ಉದಾಹರಣೆ.',
      },
      {
        id: 'kn_c2_q6',
        question: '“ಓದುವೆ” ಯಾವ ಕಾಲಕ್ಕೆ ಸೇರಿದೆ?',
        options: ['ಭೂತಕಾಲ', 'ವರ್ತಮಾನಕಾಲ', 'ಭವಿಷ್ಯತ್ಕಾಲ', 'ವಿಶೇಷಣ'],
        correct_index: 2,
        explanation: 'ಓದುವೆ ಭವಿಷ್ಯತ್ಕಾಲಕ್ಕೆ ಸೇರಿದೆ.',
      },
      {
        id: 'kn_c2_q7',
        question: '“ಆಡುತ್ತಿದ್ದಾನೆ” ಯಾವ ಕಾಲಕ್ಕೆ ಉದಾಹರಣೆ?',
        options: ['ವರ್ತಮಾನಕಾಲ', 'ಭೂತಕಾಲ', 'ಭವಿಷ್ಯತ್ಕಾಲ', 'ನಾಮಪದ'],
        correct_index: 0,
        explanation: 'ಆಡುತ್ತಿದ್ದಾನೆ ವರ್ತಮಾನಕಾಲವನ್ನು ಸೂಚಿಸುತ್ತದೆ.',
      },
    ],
  },
  {
    id: 'intermediate-kn',
    path: 'intermediate',
    lang: 'kn',
    title: 'ಪದಗಳನ್ನು ಸಂಪರ್ಕಿಸುವುದು',
    description: 'ಮತ್ತು, ಆದರೆ, ಆದ್ದರಿಂದ, ಅಥವಾ ಮುಂತಾದ ಸಂಪರ್ಕ ಪದಗಳ ಬಳಕೆ.',
    questions: [
      {
        id: 'kn_c3_q1',
        question: '“ರಾಮ ಮತ್ತು ರವಿ ಶಾಲೆಗೆ ಹೋದರು.” ಇಲ್ಲಿ ಸಂಪರ್ಕ ಪದ ಯಾವುದು?',
        options: ['ಆದರೆ', 'ಮತ್ತು', 'ಏಕೆಂದರೆ', 'ಅಥವಾ'],
        correct_index: 1,
        explanation: 'ಮತ್ತು ಎರಡು ಪದಗಳನ್ನು ಜೋಡಿಸುವ ಸಂಪರ್ಕ ಪದ.',
      },
      {
        id: 'kn_c3_q2',
        question: '“ಅಮ್ಮ ಮತ್ತು ಅಪ್ಪ” ನಲ್ಲಿ ಸಂಪರ್ಕ ಪದ ಯಾವುದು?',
        options: ['ಅಮ್ಮ', 'ಮತ್ತು', 'ಅಪ್ಪ', 'ನಲ್ಲಿ'],
        correct_index: 1,
        explanation: 'ಮತ್ತು ಸಂಪರ್ಕ ಪದವಾಗಿದೆ.',
      },
      {
        id: 'kn_c3_q3',
        question: '“ಅವನು ಓದಿದನು, ಆದರೆ ಉತ್ತೀರ್ಣನಾಗಲಿಲ್ಲ.” ಸಂಪರ್ಕ ಪದ ಯಾವುದು?',
        options: ['ಆದರೆ', 'ಓದಿದನು', 'ಉತ್ತೀರ್ಣನಾಗಲಿಲ್ಲ', 'ಅವನು'],
        correct_index: 0,
        explanation: 'ಆದರೆ ಎಂಬುದು ಸಂಪರ್ಕ ಪದ.',
      },
      {
        id: 'kn_c3_q4',
        question: '“ಮತ್ತು” ಯಾವ ಪದವರ್ಗಕ್ಕೆ ಸೇರಿದೆ?',
        options: ['ಸಂಪರ್ಕಪದ', 'ನಾಮಪದ', 'ಕ್ರಿಯಾಪದ', 'ವಿಶೇಷಣ'],
        correct_index: 0,
        explanation: 'ಮತ್ತು ಸಂಪರ್ಕಪದಕ್ಕೆ ಸೇರಿದೆ.',
      },
      {
        id: 'kn_c3_q5',
        question: '“ಆದ್ದರಿಂದ” ಪದವನ್ನು ಯಾವಾಗ ಬಳಸುತ್ತಾರೆ?',
        options: ['ಕಾರಣ ಮತ್ತು ಫಲಿತಾಂಶ ತಿಳಿಸಲು', 'ನಾಮಪದವಾಗಿ', 'ಕ್ರಿಯಾಪದವಾಗಿ', 'ಕಾಲ ಸೂಚಿಸಲು'],
        correct_index: 0,
        explanation: 'ಆದ್ದರಿಂದ ಕಾರಣ ಮತ್ತು ಫಲಿತಾಂಶ ತಿಳಿಸಲು ಬಳಸಲಾಗುತ್ತದೆ.',
      },
      {
        id: 'kn_c3_q6',
        question: 'ಸರಿಯಾದ ಸಂಪರ್ಕ ಪದ ಯಾವುದು?',
        options: ['ಮತ್ತು', 'ಪುಸ್ತಕ', 'ಮನೆ', 'ಓಡು'],
        correct_index: 0,
        explanation: 'ಮತ್ತು ಸರಿಯಾದ ಸಂಪರ್ಕ ಪದ.',
      },
      {
        id: 'kn_c3_q7',
        question: '“ಅಥವಾ” ಎಂದರೆ ಏನು?',
        options: ['ಎರಡು ಆಯ್ಕೆಗಳಲ್ಲಿ ಒಂದು', 'ಸಮಯ', 'ಸ್ಥಳ', 'ಕ್ರಿಯೆ'],
        correct_index: 0,
        explanation: 'ಅಥವಾ ಎಂದರೆ ಎರಡು ಆಯ್ಕೆಗಳಲ್ಲಿ ಒಂದನ್ನು ಆಯ್ಕೆ ಮಾಡುವುದು.',
      },
    ],
  },
  {
    id: 'advanced-kn',
    path: 'advanced',
    lang: 'kn',
    title: 'ನನ್ನ ಲೋಕದ ಪದಗಳು',
    description: 'ಸಣ್ಣ ಗದ್ಯಭಾಗಗಳನ್ನು ಓದಿ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಿ.',
    questions: [
      {
        id: 'kn_c4_q1',
        question: 'ರಾಹುಲ್ ಎಲ್ಲಿಗೆ ಹೋಗುತ್ತಾನೆ?',
        options: ['ಮಾರುಕಟ್ಟೆ', 'ಶಾಲೆ', 'ಉದ್ಯಾನ', 'ಮನೆ'],
        correct_index: 1,
        explanation: 'ರಾಹುಲ್ ಪ್ರತಿದಿನ ಶಾಲೆಗೆ ಹೋಗುತ್ತಾನೆ.',
      },
      {
        id: 'kn_c4_q2',
        question: 'ರಾಹುಲ್ಗೆ ಏನು ಇಷ್ಟ?',
        options: ['ಆಟ ಆಡುವುದು', 'ಪುಸ್ತಕಗಳನ್ನು ಓದುವುದು', 'ನಿದ್ರೆ ಮಾಡುವುದು', 'ದೂರದರ್ಶನ ನೋಡುವುದು'],
        correct_index: 1,
        explanation: 'ರಾಹುಲ್ಗೆ ಪುಸ್ತಕಗಳನ್ನು ಓದುವುದು ಇಷ್ಟ.',
      },
      {
        id: 'kn_c4_q3',
        question: 'ಈ ಗದ್ಯಭಾಗ ಯಾರ ಬಗ್ಗೆ ಇದೆ?',
        options: ['ಸೀತಾ', 'ರಾಹುಲ್', 'ಮೋಹನ್', 'ಲತಾ'],
        correct_index: 1,
        explanation: 'ಈ ಗದ್ಯಭಾಗ ರಾಹುಲ್ ಬಗ್ಗೆ ಇದೆ.',
      },
      {
        id: 'kn_c4_q4',
        question: '“ಪ್ರತಿದಿನ” ಎಂದರೆ ಏನು?',
        options: ['ಪ್ರತಿ ದಿನ', 'ನಿನ್ನೆ', 'ಎಂದಿಗೂ ಇಲ್ಲ', 'ಮುಂದಿನ ವಾರ'],
        correct_index: 0,
        explanation: 'ಪ್ರತಿದಿನ ಎಂದರೆ ಪ್ರತಿ ದಿನ (Daily).',
      },
      {
        id: 'kn_c4_q5',
        question: 'ರಾಹುಲ್ ಏನು ಮಾಡುತ್ತಾನೆ?',
        options: ['ಶಾಲೆಗೆ ಹೋಗುತ್ತಾನೆ', 'ಮಾರುಕಟ್ಟೆಗೆ ಹೋಗುತ್ತಾನೆ', 'ಮನೆಯಲ್ಲಿ ಇರುತ್ತಾನೆ', 'ಆಸ್ಪತ್ರೆಗೆ ಹೋಗುತ್ತಾನೆ'],
        correct_index: 0,
        explanation: 'ರಾಹುಲ್ ಶಾಲೆಗೆ ಹೋಗುತ್ತಾನೆ.',
      },
      {
        id: 'kn_c4_q6',
        question: 'ಈ ಗದ್ಯಭಾಗದ ಮುಖ್ಯ ಅರ್ಥವೇನು?',
        options: ['ಓದು ಮತ್ತು ಶಾಲೆಯ ಅಭ್ಯಾಸ', 'ಪ್ರವಾಸ', 'ಮಳೆ', 'ಬೆಟ್ಟಗಳು'],
        correct_index: 0,
        explanation: 'ಮುಖ್ಯ ಅರ್ಥ ಓದು ಮತ್ತು ಶಾಲೆಯ ಅಭ್ಯಾಸ.',
      },
      {
        id: 'kn_c4_q7',
        question: 'ಸರಿಯಾದ ವಾಕ್ಯ ಯಾವುದು?',
        options: [
          'ರಾಹುಲ್ಗೆ ಪುಸ್ತಕಗಳನ್ನು ಓದುವುದು ಇಷ್ಟ.',
          'ರಾಹುಲ್ ಶಾಲೆಗೆ ಹೋಗುವುದಿಲ್ಲ.',
          'ರಾಹುಲ್ ಯಾವಾಗಲೂ ಆಟವಾಡುತ್ತಾನೆ.',
          'ರಾಹುಲ್ ಓದುವುದಿಲ್ಲ.',
        ],
        correct_index: 0,
        explanation: 'ರಾಹುಲ್ಗೆ ಪುಸ್ತಕಗಳನ್ನು ಓದುವುದು ಇಷ್ಟ ಎಂಬುದು ಸರಿಯಾದ ವಾಕ್ಯ.',
      },
    ],
  },
];

const insertCourse = db.prepare('INSERT INTO courses (id, path, lang, title, description, data) VALUES (?, ?, ?, ?, ?, ?)');

db.transaction(() => {
  kannadaCourses.forEach((c) => {
    const courseData = {
      id: c.id,
      path: c.path,
      lang: c.lang,
      title: c.title,
      description: c.description,
      objective: c.description,
      certificate_criteria: { min_score_percent: 70 },
      lessons: [
        {
          id: c.id + '-l1',
          title: c.title,
          learning_goal: c.description,
          teaching_content: c.path === 'advanced' ? 'ರಾಹುಲ್ ಪ್ರತಿದಿನ ಶಾಲೆಗೆ ಹೋಗುತ್ತಾನೆ. ಅವನಿಗೆ ಪುಸ್ತಕಗಳನ್ನು ಓದುವುದು ತುಂಬಾ ಇಷ್ಟ.' : c.description,
          image_key: 'book',
          practice_questions: c.questions,
        },
      ],
      checkpoint: {
        min_pass_score: 70,
        questions: c.questions,
      },
      checkpoint_test: c.questions,
    };

    insertCourse.run(c.id, c.path, c.lang, c.title, c.description, JSON.stringify(courseData));
  });
})();

console.log('Successfully seeded 4 Kannada courses (without Course 1/2/3/4 in name) into SQLite.');
