import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { assertStoreWritable } from '../services/db.js';

assertStoreWritable();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, '../../data/literaai.sqlite'));

const tamilCourses = [
  {
    id: 'foundation-ta',
    path: 'foundation',
    lang: 'ta',
    title: 'என் மொழி ஆற்றல் விரிவாக்கம்',
    description: 'உயிரெழுத்துகள், பெயர்ச்சொல், பன்மை, வினைச்சொல், உரிச்சொல் மற்றும் சொற்களின் பொருள்.',
    questions: [
      {
        id: 'ta_c1_q1',
        question: 'தமிழ் மொழியில் உயிரெழுத்துகள் எத்தனை?',
        options: ['10', '11', '12', '13'],
        correct_index: 2,
        explanation: 'தமிழ் மொழியில் உயிரெழுத்துகள் 12 ஆகும்.',
      },
      {
        id: 'ta_c1_q2',
        question: '‘அம்மா’ என்பது எந்த வகைச் சொல்?',
        options: ['வினைச்சொல்', 'பெயர்ச்சொல்', 'உரிச்சொல்', 'இடைச்சொல்'],
        correct_index: 1,
        explanation: '‘அம்மா’ என்பது பெயர்ச்சொல் ஆகும்.',
      },
      {
        id: 'ta_c1_q3',
        question: '‘மரம்’ என்பதன் பன்மை?',
        options: ['மரம்', 'மரங்கள்', 'மரங்கள்ல்', 'மரத்தால்'],
        correct_index: 1,
        explanation: '‘மரம்’ என்பதன் பன்மை ‘மரங்கள்’.',
      },
      {
        id: 'ta_c1_q4',
        question: 'தமிழ் எழுத்துக்கள் மொத்தம்?',
        options: ['247', '146', '216', '100'],
        correct_index: 0,
        explanation: 'தமிழ் எழுத்துக்கள் மொத்தம் 247.',
      },
      {
        id: 'ta_c1_q5',
        question: '‘படிக்கிறேன்’ என்பது?',
        options: ['பெயர்', 'வினைச்சொல்', 'இடைச்சொல்', 'உரிச்சொல்'],
        correct_index: 1,
        explanation: '‘படிக்கிறேன்’ என்பது வினைச்சொல்.',
      },
      {
        id: 'ta_c1_q6',
        question: '‘நல்ல’ என்பது?',
        options: ['உரிச்சொல்', 'பெயர்', 'வினை', 'இடைச்சொல்'],
        correct_index: 0,
        explanation: '‘நல்ல’ என்பது உரிச்சொல் ஆகும்.',
      },
      {
        id: 'ta_c1_q7',
        question: '‘புத்தகம்’ என்பதன் சரியான பொருள்?',
        options: ['மரம்', 'நூல்', 'வீடு', 'கடல்'],
        correct_index: 1,
        explanation: '‘புத்தகம்’ என்பதன் பொருள் நூல்.',
      },
    ],
  },
  {
    id: 'beginner-ta',
    path: 'beginner',
    lang: 'ta',
    title: 'வாக்கியங்களை நேரம்',
    description: 'இறந்தகாலம், நிகழ்காலம் மற்றும் எதிர்காலம் ஆகிய காலங்களைப் புரிந்துகொள்ளுதல்.',
    questions: [
      {
        id: 'ta_c2_q1',
        question: '“நான் பள்ளிக்கு செல்கிறேன்.” இது எந்த காலம்?',
        options: ['இறந்தகாலம்', 'நிகழ்காலம்', 'எதிர்காலம்', 'இல்லை'],
        correct_index: 1,
        explanation: 'செல்கிறேன் என்பது நிகழ்காலம் ஆகும்.',
      },
      {
        id: 'ta_c2_q2',
        question: '“அவன் நேற்று வந்தான்.”?',
        options: ['எதிர்காலம்', 'நிகழ்காலம்', 'இறந்தகாலம்', 'கட்டளை'],
        correct_index: 2,
        explanation: 'வந்தான் என்பது இறந்தகாலம் ஆகும்.',
      },
      {
        id: 'ta_c2_q3',
        question: '“நான் நாளை செல்வேன்.”?',
        options: ['நிகழ்காலம்', 'எதிர்காலம்', 'இறந்தகாலம்', 'இல்லை'],
        correct_index: 1,
        explanation: 'செல்வேன் என்பது எதிர்காலம் ஆகும்.',
      },
      {
        id: 'ta_c2_q4',
        question: '“அவள் பாடுகிறாள்.”?',
        options: ['நிகழ்காலம்', 'இறந்தகாலம்', 'எதிர்காலம்', 'பெயர்ச்சொல்'],
        correct_index: 0,
        explanation: 'பாடுகிறாள் என்பது நிகழ்காலம்.',
      },
      {
        id: 'ta_c2_q5',
        question: '“வந்தான்” என்பது?',
        options: ['எதிர்காலம்', 'இறந்தகாலம்', 'நிகழ்காலம்', 'இடைச்சொல்'],
        correct_index: 1,
        explanation: 'வந்தான் என்பது இறந்தகாலம்.',
      },
      {
        id: 'ta_c2_q6',
        question: '“படிப்பேன்”?',
        options: ['எதிர்காலம்', 'நிகழ்காலம்', 'இறந்தகாலம்', 'பெயர்'],
        correct_index: 0,
        explanation: 'படிப்பேன் என்பது எதிர்காலம்.',
      },
      {
        id: 'ta_c2_q7',
        question: '“சாப்பிட்டான்”?',
        options: ['எதிர்காலம்', 'இறந்தகாலம்', 'நிகழ்காலம்', 'உரிச்சொல்'],
        correct_index: 1,
        explanation: 'சாப்பிட்டான் என்பது இறந்தகாலம்.',
      },
    ],
  },
  {
    id: 'intermediate-ta',
    path: 'intermediate',
    lang: 'ta',
    title: 'கருத்துகளை இணைத்தல்',
    description: 'மற்றும், ஆனால், எனவே, அல்லது போன்ற இணைப்புச் சொற்கள்.',
    questions: [
      {
        id: 'ta_c3_q1',
        question: '“ரவி ___ பள்ளிக்கு சென்றான்.”',
        options: ['ஆனால்', 'மற்றும்', 'இன்று', 'அவன்'],
        correct_index: 3,
        explanation: 'ரவி அவன் பள்ளிக்கு சென்றான்.',
      },
      {
        id: 'ta_c3_q2',
        question: '“அம்மா மற்றும் அப்பா” இல் இணைப்புச் சொல்?',
        options: ['அம்மா', 'மற்றும்', 'அப்பா', 'இல்'],
        correct_index: 1,
        explanation: 'மற்றும் என்பது இணைப்புச் சொல்.',
      },
      {
        id: 'ta_c3_q3',
        question: '“அவன் படித்தான், ஆனால் தேர்ச்சி பெறவில்லை.”?',
        options: ['ஆனால்', 'அவன்', 'படித்தான்', 'தேர்ச்சி'],
        correct_index: 0,
        explanation: 'ஆனால் என்பது இணைப்புச் சொல்.',
      },
      {
        id: 'ta_c3_q4',
        question: '“நானும் நீயும்”?',
        options: ['இணைப்பு', 'வினை', 'பெயர்', 'காலம்'],
        correct_index: 0,
        explanation: 'நானும் நீயும் என்பது இணைப்பு ஆகும்.',
      },
      {
        id: 'ta_c3_q5',
        question: '“எனவே” பயன்பாடு?',
        options: ['காரண விளைவு', 'பெயர்', 'வினை', 'காலம்'],
        correct_index: 0,
        explanation: 'எனவே என்பது காரண விளைவைக் குறிக்கும்.',
      },
      {
        id: 'ta_c3_q6',
        question: 'சரியான இணைப்பு?',
        options: ['மற்றும்', 'வீடு', 'புத்தகம்', 'ஓடு'],
        correct_index: 0,
        explanation: 'மற்றும் சரியான இணைப்புச் சொல்.',
      },
      {
        id: 'ta_c3_q7',
        question: '“அல்லது” என்பதன் பொருள்?',
        options: ['இரண்டு தேர்வுகளில் ஒன்று', 'காலம்', 'பெயர்', 'வினை'],
        correct_index: 0,
        explanation: 'அல்லது என்பது இரண்டு தேர்வுகளில் ஒன்றைக் குறிக்கும்.',
      },
    ],
  },
  {
    id: 'advanced-ta',
    path: 'advanced',
    lang: 'ta',
    title: 'புரிதலுக்கான வாசிப்பு',
    description: 'பத்தியை வாசித்து வினாக்களுக்கு விடையளித்தல்.',
    questions: [
      {
        id: 'ta_c4_q1',
        question: 'ராம் தினமும் எங்கு செல்கிறான்?',
        options: ['சந்தை', 'பள்ளி', 'பூங்கா', 'வீடு'],
        correct_index: 1,
        explanation: 'ராம் தினமும் பள்ளிக்குச் செல்கிறான்.',
      },
      {
        id: 'ta_c4_q2',
        question: 'ராமுக்கு என்ன பிடிக்கும்?',
        options: ['விளையாட்டு', 'புத்தகங்கள்', 'திரைப்படம்', 'இசை'],
        correct_index: 1,
        explanation: 'ராமுக்கு புத்தகங்கள் பிடிக்கும்.',
      },
      {
        id: 'ta_c4_q3',
        question: 'பகுதி யாரைப் பற்றி?',
        options: ['சீதா', 'ராம்', 'குமார்', 'லலிதா'],
        correct_index: 1,
        explanation: 'பகுதி ராமைப் பற்றியது.',
      },
      {
        id: 'ta_c4_q4',
        question: '“தினமும்” என்பதன் பொருள்?',
        options: ['சில நேரம்', 'ஒவ்வொரு நாள்', 'நேற்று', 'நாளை'],
        correct_index: 1,
        explanation: 'தினமும் என்றால் ஒவ்வொரு நாள்.',
      },
      {
        id: 'ta_c4_q5',
        question: 'ராம் என்ன செய்கிறான்?',
        options: ['பள்ளிக்குச் செல்கிறான்', 'தூங்குகிறான்', 'ஓடுகிறான்', 'பாடுகிறான்'],
        correct_index: 0,
        explanation: 'ராம் பள்ளிக்குச் செல்கிறான்.',
      },
      {
        id: 'ta_c4_q6',
        question: 'பகுதியின் முக்கிய கருத்து?',
        options: ['பள்ளி செல்லும் பழக்கம்', 'கடல்', 'மழை', 'மலை'],
        correct_index: 0,
        explanation: 'முக்கிய கருத்து பள்ளி செல்லும் பழக்கம்.',
      },
      {
        id: 'ta_c4_q7',
        question: 'சரியான விடை?',
        options: [
          'ராம் புத்தகங்களை விரும்புகிறான்.',
          'ராம் பள்ளிக்குச் செல்லவில்லை.',
          'ராம் தினமும் தூங்குகிறான்.',
          'ராம் கிரிக்கெட் மட்டும் விளையாடுகிறான்.',
        ],
        correct_index: 0,
        explanation: 'ராம் புத்தகங்களை விரும்புகிறான் என்பது சரியான விடை.',
      },
    ],
  },
];

const insertCourse = db.prepare('INSERT INTO courses (id, path, lang, title, description, data) VALUES (?, ?, ?, ?, ?, ?)');

db.transaction(() => {
  tamilCourses.forEach((c) => {
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
          teaching_content: c.path === 'advanced' ? 'ராம் தினமும் பள்ளிக்குச் செல்கிறான். அவன் புத்தகங்களை விரும்புகிறான்.' : c.description,
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

console.log('Successfully seeded 4 Tamil courses (without Course 1/2/3/4 in name) into SQLite.');
