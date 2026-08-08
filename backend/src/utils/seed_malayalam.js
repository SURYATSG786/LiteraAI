import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { assertStoreWritable } from '../services/db.js';

assertStoreWritable();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, '../../data/literaai.sqlite'));

const malayalamCourses = [
  {
    id: 'foundation-ml',
    path: 'foundation',
    lang: 'ml',
    title: 'എന്റെ വായനയുടെ ആദ്യപടി',
    description: 'അക്ഷരങ്ങൾ, നാമം, ബഹുവചനം, വിശേഷണം, ക്രിയ, അർത്ഥം എന്നിവ പഠിക്കാം.',
    questions: [
      {
        id: 'ml_c1_q1',
        question: '“അമ്മ” എന്ന വാക്ക് ഏത് അക്ഷരത്തിൽ തുടങ്ങുന്നു?',
        options: ['അ', 'ആ', 'ഇ', 'ഉ'],
        correct_index: 0,
        explanation: '“അമ്മ” എന്ന വാക്ക് ‘അ’ എന്ന അക്ഷരത്തിൽ തുടങ്ങുന്നു.',
      },
      {
        id: 'ml_c1_q2',
        question: '“അമ്മ” ഏത് പദവർഗത്തിൽപ്പെടുന്നു?',
        options: ['ക്രിയ', 'നാമം', 'വിശേഷണം', 'സർവനാമം'],
        correct_index: 1,
        explanation: '“അമ്മ” എന്നത് ഒരു നാമപദമാണ്.',
      },
      {
        id: 'ml_c1_q3',
        question: '“മരം” എന്ന വാക്കിന്റെ ബഹുവചനം ഏത്?',
        options: ['മരം', 'മരങ്ങൾ', 'മരങ്ങളുടെ', 'മരമായി'],
        correct_index: 1,
        explanation: '“മരം” എന്നതിന്റെ ബഹുവചനം “മരങ്ങൾ”.',
      },
      {
        id: 'ml_c1_q4',
        question: '“നല്ല” ഏത് പദവർഗമാണ്?',
        options: ['വിശേഷണം', 'നാമം', 'ക്രിയ', 'സർവനാമം'],
        correct_index: 0,
        explanation: '“നല്ല” എന്നത് വിശേഷണമാണ്.',
      },
      {
        id: 'ml_c1_q5',
        question: '“വായിക്കുന്നു” ഏത് പദവർഗത്തിൽപ്പെടുന്നു?',
        options: ['നാമം', 'ക്രിയ', 'വിശേഷണം', 'സർവനാമം'],
        correct_index: 1,
        explanation: '“വായിക്കുന്നു” എന്നത് ക്രിയാപദമാണ്.',
      },
      {
        id: 'ml_c1_q6',
        question: '“പുസ്തകം” എന്ന വാക്കിന്റെ അർത്ഥം എന്താണ്?',
        options: ['വീട്', 'ഗ്രന്ഥം', 'മരം', 'റോഡ്'],
        correct_index: 1,
        explanation: 'പുസ്തകം എന്നാൽ ഗ്രന്ഥം.',
      },
      {
        id: 'ml_c1_q7',
        question: '“സ്കൂൾ” എന്ന വാക്കിന്റെ അർത്ഥം എന്താണ്?',
        options: ['ആശുപത്രി', 'പഠിക്കുന്ന സ്ഥലം', 'ചന്ത', 'ഉദ്യാനം'],
        correct_index: 1,
        explanation: 'സ്കൂൾ എന്നാൽ പഠിക്കുന്ന സ്ഥലം.',
      },
    ],
  },
  {
    id: 'beginner-ml',
    path: 'beginner',
    lang: 'ml',
    title: 'എന്റെ ചുറ്റുമുള്ള വാക്കുകൾ',
    description: 'വർത്തമാനകാലം, ഭൂതകാലം, ഭാവികാലം എന്നിവയുടെ ഉപയോഗം.',
    questions: [
      {
        id: 'ml_c2_q1',
        question: '“ഞാൻ സ്കൂളിലേക്ക് പോകുകയാണ്.” ഇത് ഏത് കാലമാണ്?',
        options: ['ഭൂതകാലം', 'വർത്തമാനകാലം', 'ഭാവികാലം', 'ആജ്ഞാരൂപം'],
        correct_index: 1,
        explanation: 'ഇപ്പോൾ നടക്കുന്ന കാര്യമായതിനാൽ വർത്തമാനകാലം.',
      },
      {
        id: 'ml_c2_q2',
        question: '“അവൻ ഇന്നലെ വന്നു.” ഇത് ഏത് കാലമാണ്?',
        options: ['ഭൂതകാലം', 'വർത്തമാനകാലം', 'ഭാവികാലം', 'ഒന്നുമല്ല'],
        correct_index: 0,
        explanation: 'വന്നു എന്നത് കഴിഞ്ഞ കാര്യമായതിനാൽ ഭൂതകാലം.',
      },
      {
        id: 'ml_c2_q3',
        question: '“ഞാൻ നാളെ പോകും.” ഇത് ഏത് കാലമാണ്?',
        options: ['വർത്തമാനകാലം', 'ഭാവികാലം', 'ഭൂതകാലം', 'നാമം'],
        correct_index: 1,
        explanation: 'പോക് എന്നത് ഇനി നടക്കാനിരിക്കുന്ന കാര്യമായതിനാൽ ഭാവികാലം.',
      },
      {
        id: 'ml_c2_q4',
        question: '“അവൾ പാടുകയാണ്.” ഇത് ഏത് കാലമാണ്?',
        options: ['വർത്തമാനകാലം', 'ഭൂതകാലം', 'ഭാവികാലം', 'വിശേഷണം'],
        correct_index: 0,
        explanation: 'പാടുകയാണ് എന്നത് വർത്തമാനകാലമാണ്.',
      },
      {
        id: 'ml_c2_q5',
        question: '“കഴിച്ചു” ഏത് കാലത്തെ സൂചിപ്പിക്കുന്നു?',
        options: ['വർത്തമാനകാലം', 'ഭൂതകാലം', 'ഭാവികാലം', 'ഒന്നുമല്ല'],
        correct_index: 1,
        explanation: 'കഴിച്ചു എന്നത് ഭൂതകാലമാണ്.',
      },
      {
        id: 'ml_c2_q6',
        question: '“വായിക്കും” ഏത് കാലമാണ്?',
        options: ['ഭൂതകാലം', 'വർത്തമാനകാലം', 'ഭാവികാലം', 'വിശേഷണം'],
        correct_index: 2,
        explanation: 'വായിക്കും എന്നത് ഭാവികാലമാണ്.',
      },
      {
        id: 'ml_c2_q7',
        question: '“കളിക്കുകയാണ്” ഏത് കാലത്തിന്റെ ഉദാഹരണമാണ്?',
        options: ['വർത്തമാനകാലം', 'ഭൂതകാലം', 'ഭാവികാലം', 'നാമം'],
        correct_index: 0,
        explanation: 'കളിക്കുകയാണ് എന്നത് വർത്തമാനകാലമാണ്.',
      },
    ],
  },
  {
    id: 'intermediate-ml',
    path: 'intermediate',
    lang: 'ml',
    title: 'വാക്കുകളെ ബന്ധിപ്പിക്കുക',
    description: 'ഉം, പക്ഷേ, അതുകൊണ്ട്, അല്ലെങ്കിൽ എന്നീ ബന്ധകപദങ്ങൾ.',
    questions: [
      {
        id: 'ml_c3_q1',
        question: '“രാമും രവിയും സ്കൂളിലേക്ക് പോയി.” ഇതിലെ ബന്ധകപദം ഏത്?',
        options: ['പക്ഷേ', 'ഉം', 'കാരണം', 'അല്ലെങ്കിൽ'],
        correct_index: 1,
        explanation: 'ഉം എന്ന പ്രത്യയം വാക്യങ്ങളെ ബന്ധിപ്പിക്കുന്നു.',
      },
      {
        id: 'ml_c3_q2',
        question: '“അമ്മയും അച്ഛനും” എന്നതിലെ ബന്ധകപദം ഏത്?',
        options: ['അമ്മ', 'ഉം', 'അച്ഛൻ', 'എന്നത്'],
        correct_index: 1,
        explanation: 'ഉം ബന്ധകപദമാണ്.',
      },
      {
        id: 'ml_c3_q3',
        question: '“അവൻ പഠിച്ചു, പക്ഷേ വിജയിച്ചില്ല.” ഇതിലെ ബന്ധകപദം ഏത്?',
        options: ['പക്ഷേ', 'പഠിച്ചു', 'വിജയിച്ചില്ല', 'അവൻ'],
        correct_index: 0,
        explanation: 'പക്ഷേ ബന്ധകപദമാണ്.',
      },
      {
        id: 'ml_c3_q4',
        question: '“ഉം” ഏത് പദവർഗമാണ്?',
        options: ['ബന്ധകപദം', 'നാമം', 'ക്രിയ', 'വിശേഷണം'],
        correct_index: 0,
        explanation: 'ഉം ബന്ധകപദമാണ്.',
      },
      {
        id: 'ml_c3_q5',
        question: '“അതുകൊണ്ട്” എന്ന പദം എപ്പോൾ ഉപയോഗിക്കുന്നു?',
        options: ['കാരണം-ഫലം അറിയിക്കാൻ', 'നാമമായി', 'ക്രിയായായി', 'സമയം സൂചിപ്പിക്കാൻ'],
        correct_index: 0,
        explanation: 'അതുകൊണ്ട് കാരണം-ഫലം അറിയിക്കാൻ ഉപയോഗിക്കുന്നു.',
      },
      {
        id: 'ml_c3_q6',
        question: 'ശരിയായ ബന്ധകപദം ഏത്?',
        options: ['ഉം', 'പുസ്തകം', 'വീട്', 'ഓടുക'],
        correct_index: 0,
        explanation: 'ഉം ശരിയായ ബന്ധകപദമാണ്.',
      },
      {
        id: 'ml_c3_q7',
        question: '“അല്ലെങ്കിൽ” എന്നതിന്റെ അർത്ഥം എന്താണ്?',
        options: ['രണ്ട് തിരഞ്ഞെടുപ്പുകളിൽ ഒന്ന്', 'സമയം', 'സ്ഥലം', 'ക്രിയ'],
        correct_index: 0,
        explanation: 'അല്ലെങ്കിൽ എന്നാൽ രണ്ടു കാര്യങ്ങളിൽ ഒന്ന്.',
      },
    ],
  },
  {
    id: 'advanced-ml',
    path: 'advanced',
    lang: 'ml',
    title: 'എന്റെ വായിക്കാവുന്ന കഥകൾ',
    description: 'ചെറിയ ഗദ്യഭാഗങ്ങൾ വായിച്ച് ചോദ്യങ്ങൾക്ക് ഉത്തരം നൽകാം.',
    questions: [
      {
        id: 'ml_c4_q1',
        question: 'റാഹുൽ എവിടേക്കാണ് പോകുന്നത്?',
        options: ['ചന്ത', 'സ്കൂൾ', 'പാർക്ക്', 'വീട്'],
        correct_index: 1,
        explanation: 'റാഹുൽ എല്ലാ ദിവസവും സ്കൂളിലേക്ക് പോകുന്നു.',
      },
      {
        id: 'ml_c4_q2',
        question: 'റാഹുലിന് എന്താണ് ഇഷ്ടം?',
        options: ['കളിക്കുക', 'പുസ്തകങ്ങൾ വായിക്കുക', 'ഉറങ്ങുക', 'ടെലിവിഷൻ കാണുക'],
        correct_index: 1,
        explanation: 'റാഹുലിന് പുസ്തകങ്ങൾ വായിക്കാൻ വളരെ ഇഷ്ടമാണ്.',
      },
      {
        id: 'ml_c4_q3',
        question: 'ഈ ഗദ്യഭാഗം ആരെക്കുറിച്ചാണ്?',
        options: ['സീത', 'റാഹുൽ', 'മോഹൻ', 'ലത'],
        correct_index: 1,
        explanation: 'ഈ ഗദ്യഭാഗം റാഹുലിനെക്കുറിച്ചാണ്.',
      },
      {
        id: 'ml_c4_q4',
        question: '“എല്ലാ ദിവസവും” എന്നതിന്റെ അർത്ഥം എന്താണ്?',
        options: ['എല്ലാ ദിവസവും', 'ഇന്നലെ', 'ഒരിക്കലുമില്ല', 'അടുത്ത ആഴ്ച'],
        correct_index: 0,
        explanation: 'എല്ലാ ദിവസവും എന്നാൽ ദിവസം തോറും.',
      },
      {
        id: 'ml_c4_q5',
        question: 'റാഹുൽ എന്ത് ചെയ്യുന്നു?',
        options: ['സ്കൂളിലേക്ക് പോകുന്നു', 'ചന്തയിലേക്ക് പോകുന്നു', 'വീട്ടിൽ ഇരിക്കുന്നു', 'ആശുപത്രിയിലേക്ക് പോകുന്നു'],
        correct_index: 0,
        explanation: 'റാഹുൽ സ്കൂളിലേക്ക് പോകുന്നു.',
      },
      {
        id: 'ml_c4_q6',
        question: 'ഈ ഗദ്യഭാഗത്തിന്റെ പ്രധാന ആശയം എന്താണ്?',
        options: ['സ്കൂളിൽ പോകുന്നതും വായനയുടെ ശീലവും', 'യാത്ര', 'മഴ', 'മലകൾ'],
        correct_index: 0,
        explanation: 'പ്രധാന ആശയം സ്കൂളിൽ പോകുന്നതും വായനയുടെ ശീലവുമാണ്.',
      },
      {
        id: 'ml_c4_q7',
        question: 'ശരിയായ പ്രസ്താവന ഏത്?',
        options: [
          'റാഹുലിന് പുസ്തകങ്ങൾ വായിക്കാൻ ഇഷ്ടമാണ്.',
          'റാഹുൽ സ്കൂളിലേക്ക് പോകുന്നില്ല.',
          'റാഹുൽ എല്ലായ്പ്പോഴും കളിക്കുന്നു.',
          'റാഹുൽ വായിക്കുന്നില്ല.',
        ],
        correct_index: 0,
        explanation: 'റാഹുലിന് പുസ്തകങ്ങൾ വായിക്കാൻ ഇഷ്ടമാണ് എന്നത് ശരിയായ പ്രസ്താവനയാണ്.',
      },
    ],
  },
];

const insertCourse = db.prepare('INSERT INTO courses (id, path, lang, title, description, data) VALUES (?, ?, ?, ?, ?, ?)');

db.transaction(() => {
  malayalamCourses.forEach((c) => {
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
          teaching_content: c.path === 'advanced' ? 'റാഹുൽ എല്ലാ ദിവസവും സ്കൂളിലേക്ക് പോകുന്നു. അവന് പുസ്തകങ്ങൾ വായിക്കാൻ വളരെ ഇഷ്ടമാണ്.' : c.description,
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

console.log('Successfully seeded 4 Malayalam courses (without Course 1/2/3/4 in name) into SQLite.');
