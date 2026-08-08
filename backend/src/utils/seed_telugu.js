import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { assertStoreWritable } from '../services/db.js';

assertStoreWritable();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, '../../data/literaai.sqlite'));

const teluguCourses = [
  {
    id: 'foundation-te',
    path: 'foundation',
    lang: 'te',
    title: 'నా మొదటి అక్షరాస్యత ప్రయాణం',
    description: 'తెలుగు వర్ణమాల, నామవాచకం, బహువచనం, విశేషణం, క్రియ మరియు అర్థాలు.',
    questions: [
      {
        id: 'te_c1_q1',
        question: 'తెలుగు వర్ణమాలలో అచ్చులు ఎన్ని ఉన్నాయి?',
        options: ['14', '15', '16', '12'],
        correct_index: 2,
        explanation: 'తెలుగు వర్ణమాలలో 16 అచ్చులు ఉన్నాయి.',
      },
      {
        id: 'te_c1_q2',
        question: '“అమ్మ” ఏ పదవర్గానికి చెందుతుంది?',
        options: ['క్రియ', 'నామవాచకం', 'విశేషణం', 'సర్వనామం'],
        correct_index: 1,
        explanation: '“అమ్మ” నామవాచకం.',
      },
      {
        id: 'te_c1_q3',
        question: '“చెట్టు” పదానికి బహువచనం ఏది?',
        options: ['చెట్టు', 'చెట్లు', 'చెట్టులు', 'చెట్ల'],
        correct_index: 1,
        explanation: '“చెట్టు” పదానికి బహువచనం “చెట్లు”.',
      },
      {
        id: 'te_c1_q4',
        question: '“మంచి” ఏ పదవర్గం?',
        options: ['విశేషణం', 'నామవాచకం', 'క్రియ', 'అవ్యయం'],
        correct_index: 0,
        explanation: '“మంచి” విశేషణం.',
      },
      {
        id: 'te_c1_q5',
        question: '“చదువుతున్నాను” ఏ పదవర్గానికి చెందుతుంది?',
        options: ['నామవాచకం', 'క్రియ', 'విశేషణం', 'సర్వనామం'],
        correct_index: 1,
        explanation: '“చదువుతున్నాను” క్రియ.',
      },
      {
        id: 'te_c1_q6',
        question: '“పుస్తకం” అనే పదానికి అర్థం ఏమిటి?',
        options: ['ఇల్లు', 'గ్రంథం', 'చెట్టు', 'రహదారి'],
        correct_index: 1,
        explanation: 'పుస్తకం అంటే గ్రంథం.',
      },
      {
        id: 'te_c1_q7',
        question: '“పాఠశాల” అనే పదానికి అర్థం ఏమిటి?',
        options: ['ఆసుపత్రి', 'పాఠాలు నేర్చుకునే స్థలం', 'మార్కెట్', 'ఉద్యానవనం'],
        correct_index: 1,
        explanation: 'పాఠశాల అంటే పాఠాలు నేర్చుకునే స్థలం.',
      },
    ],
  },
  {
    id: 'beginner-te',
    path: 'beginner',
    lang: 'te',
    title: 'నా చుట్టూ ఉన్న పదాలు',
    description: 'వర్తమాన కాలం, భూతకాలం మరియు భవిష్యత్ కాలం వాక్యాలు.',
    questions: [
      {
        id: 'te_c2_q1',
        question: '“నేను పాఠశాలకు వెళుతున్నాను.” ఇది ఏ కాలం?',
        options: ['భూతకాలం', 'వర్తమాన కాలం', 'భవిష్యత్ కాలం', 'ఆజ్ఞార్థకం'],
        correct_index: 1,
        explanation: 'ఇది వర్తమాన కాలం.',
      },
      {
        id: 'te_c2_q2',
        question: '“అతను నిన్న వచ్చాడు.” ఇది ఏ కాలం?',
        options: ['భూతకాలం', 'వర్తమాన కాలం', 'భవిష్యత్ కాలం', 'లేదు'],
        correct_index: 0,
        explanation: 'వచ్చాడు భూతకాలం.',
      },
      {
        id: 'te_c2_q3',
        question: '“నేను రేపు వెళ్తాను.” ఇది ఏ కాలం?',
        options: ['వర్తమాన కాలం', 'భవిష్యత్ కాలం', 'భూతకాలం', 'నామవాచకం'],
        correct_index: 1,
        explanation: 'వెళ్తాను భవిష్యత్ కాలం.',
      },
      {
        id: 'te_c2_q4',
        question: '“ఆమె పాట పాడుతోంది.” ఇది ఏ కాలం?',
        options: ['వర్తమాన కాలం', 'భూతకాలం', 'భవిష్యత్ కాలం', 'విశేషణం'],
        correct_index: 0,
        explanation: 'పాడుతోంది వర్తమాన కాలం.',
      },
      {
        id: 'te_c2_q5',
        question: '“తిన్నాడు” ఏ కాలాన్ని సూచిస్తుంది?',
        options: ['వర్తమాన కాలం', 'భూతకాలం', 'భవిష్యత్ కాలం', 'లేదు'],
        correct_index: 1,
        explanation: 'తిన్నాడు భూతకాలం.',
      },
      {
        id: 'te_c2_q6',
        question: '“చదువుతాను” ఏ కాలానికి చెందుతుంది?',
        options: ['భూతకాలం', 'వర్తమాన కాలం', 'భவிష్యత్ కాలం', 'విశేషణం'],
        correct_index: 2,
        explanation: 'చదువుతాను భవిష్యత్ కాలం.',
      },
      {
        id: 'te_c2_q7',
        question: '“ఆడుతున్నాడు” ఏ కాలానికి ఉదాహరణ?',
        options: ['వర్తమాన కాలం', 'భూతకాలం', 'భవిష్యత్ కాలం', 'నామవాచకం'],
        correct_index: 0,
        explanation: 'ఆడుతున్నాడు వర్తమాన కాలం.',
      },
    ],
  },
  {
    id: 'intermediate-te',
    path: 'intermediate',
    lang: 'te',
    title: 'పదజాలానికి కొత్త అడుగులు',
    description: 'మరియు, కానీ, అందువల్ల, లేదా వంటి సంధాన పదాలు.',
    questions: [
      {
        id: 'te_c3_q1',
        question: '“రాము మరియు రవి పాఠశాలకు వెళ్లారు.” ఇందులో సంధాన పదం ఏది?',
        options: ['కానీ', 'మరియు', 'ఎందుకంటే', 'లేదా'],
        correct_index: 1,
        explanation: 'మరియు సంధాన పదం.',
      },
      {
        id: 'te_c3_q2',
        question: '“అమ్మ మరియు నాన్న”లో సంధాన పదం ఏది?',
        options: ['అమ్మ', 'మరియు', 'నాన్న', 'లో'],
        correct_index: 1,
        explanation: 'మరియు సంధాన పదం.',
      },
      {
        id: 'te_c3_q3',
        question: '“అతను చదివాడు, కానీ ఉత్తీర్ణుడు కాలేదు.” ఇందులో సంధాన పదం ఏది?',
        options: ['కానీ', 'చదివాడు', 'ఉత్తీర్ణుడు', 'కాలేదు'],
        correct_index: 0,
        explanation: 'కానీ సంధాన పదం.',
      },
      {
        id: 'te_c3_q4',
        question: '“మరియు” ఏ పదవర్గానికి చెందుతుంది?',
        options: ['సంధాన పదం', 'నామవాచకం', 'క్రియ', 'విశేషణం'],
        correct_index: 0,
        explanation: 'మరియు సంధాన పదం.',
      },
      {
        id: 'te_c3_q5',
        question: '“అందువల్ల” అనే పదాన్ని ఎప్పుడు ఉపయోగిస్తారు?',
        options: ['కారణం మరియు ఫలితాన్ని తెలియజేయడానికి', 'నామవాచకంగా', 'క్రియగా', 'కాలాన్ని సూచించడానికి'],
        correct_index: 0,
        explanation: 'అందువల్ల కారణం మరియు ఫలితాన్ని తెలియజేయడానికి ఉపయోగిస్తారు.',
      },
      {
        id: 'te_c3_q6',
        question: 'సరైన సంధాన పదం ఏది?',
        options: ['మరియు', 'పుస్తకం', 'ఇల్లు', 'పరుగెత్తు'],
        correct_index: 0,
        explanation: 'మరియు సరైన సంధాన పదం.',
      },
      {
        id: 'te_c3_q7',
        question: '“లేదా” అంటే ఏమిటి?',
        options: ['రెండు ఎంపికల్లో ఒకటి', 'సమయం', 'స్థలం', 'క్రియ'],
        correct_index: 0,
        explanation: 'లేదా అంటే రెండు ఎంపికల్లో ఒకటి.',
      },
    ],
  },
  {
    id: 'advanced-te',
    path: 'advanced',
    lang: 'te',
    title: 'నా ప్రపంచ పదాలు',
    description: 'లఘు గద్యభాగాలను చదివి ప్రశ్నలకు సమాధానాలు ఇవ్వడం.',
    questions: [
      {
        id: 'te_c4_q1',
        question: 'రాహుల్ ఎక్కడికి వెళ్తాడు?',
        options: ['మార్కెట్', 'పాఠశాల', 'పార్క్', 'ఇల్లు'],
        correct_index: 1,
        explanation: 'రాహుల్ ప్రతిరోజూ పాఠశాలకు వెళ్తాడు.',
      },
      {
        id: 'te_c4_q2',
        question: 'రాహుల్కు ఏమి ఇష్టం?',
        options: ['ఆటలు', 'పుస్తకాలు చదవడం', 'నిద్రపోవడం', 'టీవీ చూడడం'],
        correct_index: 1,
        explanation: 'రాహుల్కు పుస్తకాలు చదవడం చాలా ఇష్టం.',
      },
      {
        id: 'te_c4_q3',
        question: 'ఈ గద్యభాగం ఎవరి గురించి?',
        options: ['సీత', 'రాహుల్', 'మోహన్', 'లత'],
        correct_index: 1,
        explanation: 'ఈ గద్యభాగం రాహుల్ గురించి.',
      },
      {
        id: 'te_c4_q4',
        question: '“ప్రతిరోజూ” అంటే ఏమిటి?',
        options: ['ప్రతి రోజు', 'నిన్న', 'ఎప్పుడూ కాదు', 'వచ్చే వారం'],
        correct_index: 0,
        explanation: 'ప్రతిరోజూ అంటే ప్రతి రోజు.',
      },
      {
        id: 'te_c4_q5',
        question: 'రాహుల్ ఏమి చేస్తాడు?',
        options: ['పాఠశాలకు వెళ్తాడు', 'మార్కెట్కు వెళ్తాడు', 'ఇంట్లో ఉంటాడు', 'ఆసుపత్రికి వెళ్తాడు'],
        correct_index: 0,
        explanation: 'రాహుల్ పాఠశాలకు వెళ్తాడు.',
      },
      {
        id: 'te_c4_q6',
        question: 'ఈ గద్యభాగం యొక్క ప్రధాన భావం ఏమిటి?',
        options: ['చదువు మరియు పాఠశాల అలవాటు', 'ప్రయాణం', 'వర్షం', 'కొండలు'],
        correct_index: 0,
        explanation: 'ప్రధాన భావం చదువు మరియు పాఠశాల అలవాటు.',
      },
      {
        id: 'te_c4_q7',
        question: 'సరైన వాక్యం ఏది?',
        options: [
          'రాహుల్కు పుస్తకాలు చదవడం ఇష్టం.',
          'రాహుల్ పాఠశాలకు వెళ్లడు.',
          'రాహుల్ ఎప్పుడూ ఆడుతుంటాడు.',
          'రాహుల్ చదవడు.',
        ],
        correct_index: 0,
        explanation: 'రాహుల్కు పుస్తకాలు చదవడం ఇష్టం సరైన వాక్యం.',
      },
    ],
  },
];

const insertCourse = db.prepare('INSERT INTO courses (id, path, lang, title, description, data) VALUES (?, ?, ?, ?, ?, ?)');

db.transaction(() => {
  teluguCourses.forEach((c) => {
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
          teaching_content: c.path === 'advanced' ? 'రాహుల్ ప్రతిరోజూ పాఠశాలకు వెళ్తాడు. అతనికి పుస్తకాలు చదవడం చాలా ఇష్టం.' : c.description,
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

console.log('Successfully seeded 4 Telugu courses (without Course 1/2/3/4 in name) into SQLite.');
