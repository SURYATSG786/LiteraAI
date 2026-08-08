import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { assertStoreWritable } from '../services/db.js';

assertStoreWritable();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, '../../data/literaai.sqlite'));

const englishCourses = [
  {
    id: 'foundation-1',
    path: 'foundation',
    title: 'Building My Reading Confidence',
    description: 'Learn letters, nouns, plurals, adjectives, verbs, and basic vocabulary.',
    questions: [
      {
        id: 'en_c1_q1',
        question: 'Which letter does the word Apple begin with?',
        options: ['B', 'A', 'C', 'D'],
        correct_index: 1,
        explanation: 'The word Apple begins with the letter A.',
      },
      {
        id: 'en_c1_q2',
        question: 'Which word is a noun?',
        options: ['Run', 'Happy', 'Book', 'Quickly'],
        correct_index: 2,
        explanation: 'Book is a noun representing an object.',
      },
      {
        id: 'en_c1_q3',
        question: 'What is the plural of Tree?',
        options: ['Trees', 'Treees', "Trees'", 'Tree'],
        correct_index: 0,
        explanation: 'The plural of Tree is Trees.',
      },
      {
        id: 'en_c1_q4',
        question: 'Which word is an adjective?',
        options: ['Beautiful', 'School', 'Jump', 'They'],
        correct_index: 0,
        explanation: 'Beautiful is an adjective describing a noun.',
      },
      {
        id: 'en_c1_q5',
        question: 'Which word is a verb?',
        options: ['Reading', 'Table', 'Blue', 'Friend'],
        correct_index: 0,
        explanation: 'Reading is an action verb.',
      },
      {
        id: 'en_c1_q6',
        question: 'What is another word for Book?',
        options: ['Pen', 'Notebook', 'Text', 'Volume'],
        correct_index: 3,
        explanation: 'Volume is another word for a book.',
      },
      {
        id: 'en_c1_q7',
        question: 'What is a School?',
        options: ['A hospital', 'A place to learn', 'A market', 'A park'],
        correct_index: 1,
        explanation: 'A school is a place to learn.',
      },
    ],
  },
  {
    id: 'beginner-1',
    path: 'beginner',
    title: 'Everyday Action Words',
    description: 'Master present, past, and future tenses in everyday conversation.',
    questions: [
      {
        id: 'en_c2_q1',
        question: '"I am going to school." Which tense is this?',
        options: ['Past Tense', 'Present Tense', 'Future Tense', 'Imperative'],
        correct_index: 1,
        explanation: 'This action is happening now, so it is Present Tense.',
      },
      {
        id: 'en_c2_q2',
        question: '"He came yesterday." Which tense is this?',
        options: ['Past Tense', 'Present Tense', 'Future Tense', 'None'],
        correct_index: 0,
        explanation: 'The word came refers to a past action.',
      },
      {
        id: 'en_c2_q3',
        question: '"I will go tomorrow." Which tense is this?',
        options: ['Present Tense', 'Future Tense', 'Past Tense', 'Noun'],
        correct_index: 1,
        explanation: 'The words will go indicate Future Tense.',
      },
      {
        id: 'en_c2_q4',
        question: '"She is singing." Which tense is this?',
        options: ['Present Tense', 'Past Tense', 'Future Tense', 'Adjective'],
        correct_index: 0,
        explanation: 'Is singing expresses Present Tense.',
      },
      {
        id: 'en_c2_q5',
        question: 'Which word shows the past tense?',
        options: ['Eat', 'Ate', 'Eating', 'Eats'],
        correct_index: 1,
        explanation: 'Ate is the past tense form of eat.',
      },
      {
        id: 'en_c2_q6',
        question: 'Which word shows the future tense?',
        options: ['Read', 'Reading', 'Will read', 'Reads'],
        correct_index: 2,
        explanation: 'Will read indicates action in the future.',
      },
      {
        id: 'en_c2_q7',
        question: '"They are playing." Which tense is this?',
        options: ['Present Tense', 'Past Tense', 'Future Tense', 'Noun'],
        correct_index: 0,
        explanation: 'Are playing represents Present Tense.',
      },
    ],
  },
  {
    id: 'intermediate-1',
    path: 'intermediate',
    title: 'Describing My Day',
    description: 'Learn conjunctions and joining words like and, but, because, and or.',
    questions: [
      {
        id: 'en_c3_q1',
        question: 'Which word joins two ideas?',
        options: ['But', 'And', 'Because', 'Or'],
        correct_index: 1,
        explanation: 'And joins two related ideas.',
      },
      {
        id: 'en_c3_q2',
        question: 'In "Mother and Father", which is the joining word?',
        options: ['Mother', 'And', 'Father', 'Family'],
        correct_index: 1,
        explanation: 'And is the joining word.',
      },
      {
        id: 'en_c3_q3',
        question: '"He studied, but he did not pass." Which is the joining word?',
        options: ['But', 'Studied', 'Pass', 'He'],
        correct_index: 0,
        explanation: 'But joins two contrasting clauses.',
      },
      {
        id: 'en_c3_q4',
        question: '"And" is a ______.',
        options: ['Conjunction', 'Noun', 'Verb', 'Adjective'],
        correct_index: 0,
        explanation: 'And is a conjunction.',
      },
      {
        id: 'en_c3_q5',
        question: 'When do we use because?',
        options: ['To show a reason', 'To name a person', 'To show an action', 'To show time'],
        correct_index: 0,
        explanation: 'Because is used to state a reason.',
      },
      {
        id: 'en_c3_q6',
        question: 'Which is a conjunction?',
        options: ['And', 'House', 'Book', 'Run'],
        correct_index: 0,
        explanation: 'And is a conjunction.',
      },
      {
        id: 'en_c3_q7',
        question: 'What does or mean?',
        options: ['One choice between two options', 'A place', 'A time', 'An action'],
        correct_index: 0,
        explanation: 'Or represents a choice between options.',
      },
    ],
  },
  {
    id: 'advanced-1',
    path: 'advanced',
    title: 'Stories I Can Read',
    description: 'Read short passages and answer comprehension questions.',
    questions: [
      {
        id: 'en_c4_q1',
        question: 'Where does Rahul go?',
        options: ['Market', 'School', 'Park', 'Home'],
        correct_index: 1,
        explanation: 'Rahul goes to school every day.',
      },
      {
        id: 'en_c4_q2',
        question: 'What does Rahul like?',
        options: ['Playing games', 'Reading books', 'Sleeping', 'Watching TV'],
        correct_index: 1,
        explanation: 'Rahul likes reading books.',
      },
      {
        id: 'en_c4_q3',
        question: 'Who is the passage about?',
        options: ['Sita', 'Rahul', 'Mohan', 'Riya'],
        correct_index: 1,
        explanation: 'The passage is about Rahul.',
      },
      {
        id: 'en_c4_q4',
        question: 'What does every day mean?',
        options: ['Daily', 'Yesterday', 'Never', 'Next week'],
        correct_index: 0,
        explanation: 'Every day means daily.',
      },
      {
        id: 'en_c4_q5',
        question: 'What does Rahul do?',
        options: ['Goes to school', 'Goes to the market', 'Stays at home', 'Goes to the hospital'],
        correct_index: 0,
        explanation: 'Rahul goes to school every day.',
      },
      {
        id: 'en_c4_q6',
        question: 'What is the main idea of the passage?',
        options: ['Going to school and reading books', 'Traveling', 'Rain', 'Mountains'],
        correct_index: 0,
        explanation: 'The main idea is going to school and reading books.',
      },
      {
        id: 'en_c4_q7',
        question: 'Which sentence is correct?',
        options: [
          'Rahul likes reading books.',
          'Rahul never goes to school.',
          'Rahul only plays games.',
          'Rahul does not read books.',
        ],
        correct_index: 0,
        explanation: 'Rahul likes reading books is the correct sentence.',
      },
    ],
  },
];

db.prepare("DELETE FROM courses WHERE lang = 'en'").run();

const insertCourse = db.prepare('INSERT INTO courses (id, path, lang, title, description, data) VALUES (?, ?, ?, ?, ?, ?)');

db.transaction(() => {
  englishCourses.forEach((c) => {
    const courseData = {
      id: c.id,
      path: c.path,
      lang: 'en',
      title: c.title,
      description: c.description,
      objective: c.description,
      certificate_criteria: { min_score_percent: 70 },
      lessons: [
        {
          id: c.id + '-l1',
          title: c.title,
          learning_goal: c.description,
          teaching_content: c.path === 'advanced' ? 'Rahul goes to school every day. He likes reading books.' : c.description,
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

    insertCourse.run(c.id, c.path, 'en', c.title, c.description, JSON.stringify(courseData));
  });
})();

console.log('Successfully seeded 4 English-only courses into SQLite.');
