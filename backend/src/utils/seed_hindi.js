import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { assertStoreWritable } from '../services/db.js';

assertStoreWritable();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, '../../data/literaai.sqlite'));

const hindiCourses = [
  {
    id: 'foundation-hi',
    path: 'foundation',
    lang: 'hi',
    title: 'मेरा पठन आत्मविश्वास',
    description: 'वर्णमाला, स्वर, संज्ञा, बहुवचन, विशेषण, क्रिया और शब्दार्थ।',
    questions: [
      {
        id: 'hi_c1_q1',
        question: 'हिंदी वर्णमाला में स्वर कितने होते हैं?',
        options: ['10', '11', '13', '12'],
        correct_index: 2,
        explanation: 'हिंदी वर्णमाला में 13 स्वर होते हैं।',
      },
      {
        id: 'hi_c1_q2',
        question: '‘माँ’ किस प्रकार का शब्द है?',
        options: ['क्रिया', 'संज्ञा', 'विशेषण', 'सर्वनाम'],
        correct_index: 1,
        explanation: '‘माँ’ संज्ञा शब्द है।',
      },
      {
        id: 'hi_c1_q3',
        question: '‘लड़का’ का बहुवचन क्या है?',
        options: ['लड़कियाँ', 'लड़के', 'लड़कों', 'लड़का'],
        correct_index: 1,
        explanation: '‘लड़का’ का बहुवचन ‘लड़के’ है।',
      },
      {
        id: 'hi_c1_q4',
        question: '‘सुंदर’ किस प्रकार का शब्द है?',
        options: ['विशेषण', 'संज्ञा', 'क्रिया', 'सर्वनाम'],
        correct_index: 0,
        explanation: '‘सुंदर’ विशेषण शब्द है।',
      },
      {
        id: 'hi_c1_q5',
        question: '‘पढ़ता’ किस प्रकार का शब्द है?',
        options: ['संज्ञा', 'क्रिया', 'विशेषण', 'अव्यय'],
        correct_index: 1,
        explanation: '‘पढ़ता’ क्रिया शब्द है।',
      },
      {
        id: 'hi_c1_q6',
        question: '‘पुस्तक’ का सही अर्थ क्या है?',
        options: ['किताब', 'सड़क', 'पेड़', 'घर'],
        correct_index: 0,
        explanation: '‘पुस्तक’ का अर्थ किताब है।',
      },
      {
        id: 'hi_c1_q7',
        question: '‘विद्यालय’ का अर्थ क्या है?',
        options: ['अस्पताल', 'स्कूल', 'बाजार', 'खेत'],
        correct_index: 1,
        explanation: '‘विद्यालय’ का अर्थ स्कूल है।',
      },
    ],
  },
  {
    id: 'beginner-hi',
    path: 'beginner',
    lang: 'hi',
    title: 'रोज़मर्रा की क्रियाएँ',
    description: 'वर्तमान काल, भूतकाल और भविष्य काल के वाक्य।',
    questions: [
      {
        id: 'hi_c2_q1',
        question: '“मैं स्कूल जाता हूँ।” यह कौन-सा काल है?',
        options: ['भूतकाल', 'वर्तमान काल', 'भविष्य काल', 'आज्ञार्थ'],
        correct_index: 1,
        explanation: 'यह वर्तमान काल का वाक्य है।',
      },
      {
        id: 'hi_c2_q2',
        question: '“वह कल आया।”',
        options: ['भूतकाल', 'वर्तमान काल', 'भविष्य काल', 'कोई नहीं'],
        correct_index: 0,
        explanation: 'आया भूतकाल को दर्शाता है।',
      },
      {
        id: 'hi_c2_q3',
        question: '“मैं कल जाऊँगा।”',
        options: ['वर्तमान काल', 'भविष्य काल', 'भूतकाल', 'संज्ञा'],
        correct_index: 1,
        explanation: 'जाऊँगा भविष्य काल है।',
      },
      {
        id: 'hi_c2_q4',
        question: '“सीमा खाना बनाती है।”',
        options: ['वर्तमान काल', 'भूतकाल', 'भविष्य काल', 'विशेषण'],
        correct_index: 0,
        explanation: 'बनाती है वर्तमान काल है।',
      },
      {
        id: 'hi_c2_q5',
        question: '“खाया” किस काल को दर्शाता है?',
        options: ['वर्तमान', 'भविष्य', 'भूत', 'कोई नहीं'],
        correct_index: 2,
        explanation: 'खाया भूतकाल को दर्शाता है।',
      },
      {
        id: 'hi_c2_q6',
        question: '“पढ़ूँगा” किस काल का रूप है?',
        options: ['भूत', 'वर्तमान', 'भविष्य', 'विशेषण'],
        correct_index: 2,
        explanation: 'पढ़ूँगा भविष्य काल का रूप है।',
      },
      {
        id: 'hi_c2_q7',
        question: '“दौड़ रहा है” किस काल का उदाहरण है?',
        options: ['वर्तमान', 'भूत', 'भविष्य', 'संज्ञा'],
        correct_index: 0,
        explanation: 'दौड़ रहा है वर्तमान काल का उदाहरण है।',
      },
    ],
  },
  {
    id: 'intermediate-hi',
    path: 'intermediate',
    lang: 'hi',
    title: 'मेरे दिन का वर्णन',
    description: 'और, लेकिन, इसलिए, या जैसे संयोजक शब्दों का प्रयोग।',
    questions: [
      {
        id: 'hi_c3_q1',
        question: '“राम ___ स्कूल गया।”',
        options: ['लेकिन', 'और', 'वह', 'क्योंकि'],
        correct_index: 2,
        explanation: 'राम वह स्कूल गया।',
      },
      {
        id: 'hi_c3_q2',
        question: '“माँ और पिता” में संयोजक शब्द कौन-सा है?',
        options: ['माँ', 'और', 'पिता', 'में'],
        correct_index: 1,
        explanation: 'और संयोजक शब्द है।',
      },
      {
        id: 'hi_c3_q3',
        question: '“वह पढ़ा, लेकिन पास नहीं हुआ।” संयोजक?',
        options: ['लेकिन', 'पढ़ा', 'पास', 'हुआ'],
        correct_index: 0,
        explanation: 'लेकिन संयोजक शब्द है।',
      },
      {
        id: 'hi_c3_q4',
        question: '“मैं और तुम” में ‘और’ क्या है?',
        options: ['संयोजक', 'संज्ञा', 'क्रिया', 'विशेषण'],
        correct_index: 0,
        explanation: 'और संयोजक है।',
      },
      {
        id: 'hi_c3_q5',
        question: '“इसलिए” का प्रयोग किसके लिए होता है?',
        options: ['कारण और परिणाम', 'संज्ञा', 'क्रिया', 'काल'],
        correct_index: 0,
        explanation: 'इसलिए का प्रयोग कारण और परिणाम दर्शाने के लिए होता है।',
      },
      {
        id: 'hi_c3_q6',
        question: 'सही संयोजक चुनिए।',
        options: ['और', 'किताब', 'घर', 'दौड़'],
        correct_index: 0,
        explanation: 'और सही संयोजक है।',
      },
      {
        id: 'hi_c3_q7',
        question: '“या” का अर्थ क्या है?',
        options: ['दो विकल्पों में एक', 'समय', 'स्थान', 'क्रिया'],
        correct_index: 0,
        explanation: 'या का अर्थ दो विकल्पों में एक चुनना है।',
      },
    ],
  },
  {
    id: 'advanced-hi',
    path: 'advanced',
    lang: 'hi',
    title: 'मैं पढ़ सकता/सकती हूँ कहानियाँ',
    description: 'छोटे गद्यांशों को पढ़कर प्रश्नों के उत्तर देना।',
    questions: [
      {
        id: 'hi_c4_q1',
        question: 'राहुल कहाँ जाता है?',
        options: ['बाज़ार', 'स्कूल', 'पार्क', 'घर'],
        correct_index: 1,
        explanation: 'राहुल रोज़ स्कूल जाता है।',
      },
      {
        id: 'hi_c4_q2',
        question: 'राहुल को क्या पसंद है?',
        options: ['खेलना', 'किताबें पढ़ना', 'सोना', 'टीवी देखना'],
        correct_index: 1,
        explanation: 'राहुल को किताबें पढ़ना पसंद है।',
      },
      {
        id: 'hi_c4_q3',
        question: 'गद्यांश किसके बारे में है?',
        options: ['रीना', 'राहुल', 'मोहन', 'सीमा'],
        correct_index: 1,
        explanation: 'गद्यांश राहुल के बारे में है।',
      },
      {
        id: 'hi_c4_q4',
        question: '‘रोज़’ का अर्थ क्या है?',
        options: ['हर दिन', 'कल', 'कभी नहीं', 'अगले सप्ताह'],
        correct_index: 0,
        explanation: 'रोज़ का अर्थ हर दिन होता है।',
      },
      {
        id: 'hi_c4_q5',
        question: 'राहुल क्या करता है?',
        options: ['स्कूल जाता है', 'खेत जाता है', 'बाज़ार जाता है', 'अस्पताल जाता है'],
        correct_index: 0,
        explanation: 'राहुल स्कूल जाता है।',
      },
      {
        id: 'hi_c4_q6',
        question: 'गद्यांश का मुख्य विचार क्या है?',
        options: ['पढ़ाई और स्कूल की आदत', 'यात्रा', 'वर्षा', 'पर्वत'],
        correct_index: 0,
        explanation: 'मुख्य विचार पढ़ाई और स्कूल की आदत है।',
      },
      {
        id: 'hi_c4_q7',
        question: 'सही कथन चुनिए।',
        options: [
          'राहुल को किताबें पढ़ना पसंद है।',
          'राहुल स्कूल नहीं जाता।',
          'राहुल केवल खेलता है।',
          'राहुल रोज़ सोता रहता है।',
        ],
        correct_index: 0,
        explanation: 'राहुल को किताबें पढ़ना पसंद है सही कथन है।',
      },
    ],
  },
];

const insertCourse = db.prepare('INSERT INTO courses (id, path, lang, title, description, data) VALUES (?, ?, ?, ?, ?, ?)');

db.transaction(() => {
  hindiCourses.forEach((c) => {
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
          teaching_content: c.path === 'advanced' ? 'राहुल रोज़ स्कूल जाता है। उसे किताबें पढ़ना पसंद है।' : c.description,
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

console.log('Successfully seeded 4 Hindi courses (without Course 1/2/3/4 in name) into SQLite.');
