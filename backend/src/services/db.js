import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import Database from 'better-sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.resolve(__dirname, '../../data');

const DB_FILE = path.join(DATA_DIR, 'literaai.sqlite');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

let dbInstance = null;

function getDb() {
  if (!dbInstance) {
    ensureDir();
    dbInstance = new Database(DB_FILE);
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('foreign_keys = ON');

    // Create normalized 3NF schema tables
    dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        preferred_language TEXT NOT NULL,
        education_level TEXT NOT NULL,
        assessment_score INTEGER,
        current_path TEXT,
        course_progress TEXT,
        streak TEXT,
        gems INTEGER DEFAULT 0,
        xp INTEGER DEFAULT 0,
        certificate TEXT,
        certificates TEXT,
        league TEXT DEFAULT 'bronze',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS user_streaks (
        user_id TEXT PRIMARY KEY,
        current_streak INTEGER DEFAULT 0,
        goal INTEGER DEFAULT 14,
        last_activity TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS user_lesson_progress (
        user_id TEXT NOT NULL,
        course_id TEXT,
        lesson_id TEXT NOT NULL,
        score INTEGER DEFAULT 0,
        completed_at TEXT NOT NULL,
        PRIMARY KEY (user_id, lesson_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS certificates (
        credential_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        course_id TEXT NOT NULL,
        course_title TEXT NOT NULL,
        score INTEGER NOT NULL,
        issued_date TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS registrations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        email TEXT NOT NULL,
        name TEXT NOT NULL,
        preferred_language TEXT NOT NULL,
        education_level TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS login_events (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        email TEXT NOT NULL,
        success INTEGER NOT NULL,
        ip TEXT,
        user_agent TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        path TEXT NOT NULL,
        lang TEXT NOT NULL DEFAULT 'en',
        title TEXT NOT NULL,
        description TEXT,
        data TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS assessments (
        education_level TEXT PRIMARY KEY,
        data TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS league_exams (
        id TEXT PRIMARY KEY,
        league TEXT NOT NULL,
        lang TEXT NOT NULL DEFAULT 'en',
        data TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS league_certificates (
        credential_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        league TEXT NOT NULL,
        league_title TEXT NOT NULL,
        score INTEGER NOT NULL,
        issued_date TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS community_posts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        image_url TEXT,
        achievement_meta TEXT,
        language TEXT DEFAULT 'en',
        likes INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      );
    `);

    // Migrations
    try {
      dbInstance.exec(`ALTER TABLE user_lesson_progress ADD COLUMN score INTEGER DEFAULT 0`);
    } catch (_) { /* column already exists */ }
    try {
      dbInstance.exec(`ALTER TABLE users ADD COLUMN league TEXT DEFAULT 'bronze'`);
    } catch (_) { /* column already exists */ }

    seedCoursesAndAssessments();
    seedLeagueExamsHelper();
    try {
      dbInstance.exec("DELETE FROM community_posts WHERE id LIKE 'post_seed_%';");
    } catch (_) {}
  }
  return dbInstance;
}

function seedCoursesAndAssessments() {
  const db = dbInstance;
  const coursesCount = db.prepare('SELECT COUNT(*) as count FROM courses').get().count;

  if (coursesCount === 0) {
    const jsonCoursesPath = path.join(__dirname, '../data/courses.json');
    if (fs.existsSync(jsonCoursesPath)) {
      try {
        const raw = fs.readFileSync(jsonCoursesPath, 'utf8');
        const courses = JSON.parse(raw);

        const insertCourse = db.prepare('INSERT INTO courses (id, path, title, description, data) VALUES (?, ?, ?, ?, ?)');
        db.transaction(() => {
          for (const c of courses) {
            insertCourse.run(c.id, c.path, JSON.stringify(c.title || ''), JSON.stringify(c.description || ''), JSON.stringify(c));
          }
        })();

        fs.unlinkSync(jsonCoursesPath);
      } catch (err) {
        console.warn('Failed to seed courses into SQLite:', err.message);
      }
    }
  }

  const assessmentsCount = db.prepare('SELECT COUNT(*) as count FROM assessments').get().count;
  if (assessmentsCount === 0) {
    const jsonAssessmentsPath = path.join(__dirname, '../data/assessments.json');
    if (fs.existsSync(jsonAssessmentsPath)) {
      try {
        const raw = fs.readFileSync(jsonAssessmentsPath, 'utf8');
        const assessments = JSON.parse(raw);

        const insertAssessment = db.prepare('INSERT INTO assessments (education_level, data) VALUES (?, ?)');
        db.transaction(() => {
          for (const a of assessments) {
            insertAssessment.run(a.education_level, JSON.stringify(a));
          }
        })();

        fs.unlinkSync(jsonAssessmentsPath);
      } catch (err) {
        console.warn('Failed to seed assessments into SQLite:', err.message);
      }
    }
  }
}

function seedLeagueExamsHelper() {
  const db = dbInstance;
  const LEAGUE_EXAMS_DATA = {
    en: {
      bronze: {
        title: 'Bronze League Exam',
        target_league: 'silver',
        min_score_percent: 70,
        questions: [
          { id: 'en_b_1', question: 'Which of these words is spelled correctly?', options: ['Recieve', 'Receive', 'Receve', 'Recive'], correct_index: 1, explanation: "The rule is 'i' before 'e' except after 'c', so it is spelled 'Receive'." },
          { id: 'en_b_2', question: 'Which adjective describes something that is of extremely large size?', options: ['Tiny', 'Huge', 'Micro', 'Slim'], correct_index: 1, explanation: "'Huge' means extremely large or enormous." },
          { id: 'en_b_3', question: "What is the past tense of the irregular verb 'run'?", options: ['runned', 'running', 'ran', 'runs'], correct_index: 2, explanation: "The past tense of the verb 'run' is 'ran'." }
        ]
      },
      silver: {
        title: 'Silver League Exam',
        target_league: 'gold',
        min_score_percent: 70,
        questions: [
          { id: 'en_s_1', question: "What is the definition of the word 'Benevolent'?", options: ['Extremely cruel and abusive', 'Well-meaning, kind, and helpful', 'Very wealthy and powerful', 'Extremely loud and disturbing'], correct_index: 1, explanation: "'Benevolent' comes from Latin roots meaning 'well-wishing' or 'kind'." },
          { id: 'en_s_2', question: "Choose the correct conjunction: 'I wanted to go for a run, _____ it began raining heavily.'", options: ['because', 'but', 'so', 'or'], correct_index: 1, explanation: "'But' is used to introduce a contrasting statement." },
          { id: 'en_s_3', question: "Identify the noun in the sentence: 'The happy dog barked loudly.'", options: ['happy', 'dog', 'barked', 'loudly'], correct_index: 1, explanation: "'Dog' is the person, place, or thing (noun) in this sentence." }
        ]
      },
      gold: {
        title: 'Gold League Exam',
        target_league: 'mastery',
        min_score_percent: 70,
        questions: [
          { id: 'en_g_1', question: "Which word means 'existing or being everywhere at the same time'?", options: ['Ubiquitous', 'Ephemeral', 'Scarcity', 'Redundant'], correct_index: 0, explanation: "'Ubiquitous' describes something that is omnipresent or found everywhere." },
          { id: 'en_g_2', question: "Complete the famous English idiom: 'By the skin of your _____'", options: ['nails', 'teeth', 'lips', 'hands'], correct_index: 1, explanation: "'By the skin of your teeth' means barely succeeding or escaping by a narrow margin." },
          { id: 'en_g_3', question: "Select the correct negative sentence structure:", options: ["She don't care about the outcome.", "She doesn't care about the outcome.", "She not care about the outcome.", "She isn't care about the outcome."], correct_index: 1, explanation: "Third-person singular subjects ('She') require the helper verb 'does not' or 'doesn't'." }
        ]
      }
    },
    hi: {
      bronze: {
        title: 'कांस्य लीग परीक्षा (Bronze League Exam)',
        target_league: 'silver',
        min_score_percent: 70,
        questions: [
          { id: 'hi_b_1', question: 'किस शब्द की वर्तनी (Spelling) सही है?', options: ['कवित्री', 'कवयित्री', 'कविइत्री', 'कवीयित्री'], correct_index: 1, explanation: "'कवयित्री' कवि का स्त्रीलिंग रूप है और इसकी वर्तनी यही सही है।" },
          { id: 'hi_b_2', question: 'अत्यधिक बड़े आकार को दर्शाने वाला विशेषण कौन सा है?', options: ['छोटा', 'विशाल', 'सूक्ष्म', 'पतला'], correct_index: 1, explanation: "'विशाल' का अर्थ बहुत बड़ा या विराट होता है।" },
          { id: 'hi_b_3', question: "'दौड़ना' क्रिया का भूतकाल रूप क्या होगा?", options: ['दौड़ेगा', 'दौड़ा', 'दौड़ता', 'दौड़ रही'], correct_index: 1, explanation: "'दौड़ना' का भूतकाल रूप 'दौड़ा' होता है।" }
        ]
      },
      silver: {
        title: 'रजत लीग परीक्षा (Silver League Exam)',
        target_league: 'gold',
        min_score_percent: 70,
        questions: [
          { id: 'hi_s_1', question: "'परोपकारी' शब्द का सही अर्थ क्या है?", options: ['दूसरों का बुरा करने वाला', 'दूसरों की भलाई करने वाला', 'बहुत अमीर व्यक्ति', 'शांत रहने वाला'], correct_index: 1, explanation: "'परोपकारी' का अर्थ होता है दूसरों पर उपकार करने वाला।" },
          { id: 'hi_s_2', question: "सही योजक शब्द चुनें: 'मैं बाहर जाना चाहता था, _____ भारी बारिश होने लगी।'", options: ['क्योंकि', 'लेकिन', 'इसलिए', 'या'], correct_index: 1, explanation: "'लेकिन' विपरीत परिस्थिति को दर्शाने के लिए प्रयोग होता है।" },
          { id: 'hi_s_3', question: "वाक्य में संज्ञा शब्द पहचानें: 'सुंदर कुत्ता जोर से भौंका।'", options: ['सुंदर', 'कुत्ता', 'भौंका', 'जोर'], correct_index: 1, explanation: "'कुत्ता' एक प्राणी का नाम है, इसलिए यह संज्ञा (Noun) है।" }
        ]
      },
      gold: {
        title: 'स्वर्ण लीग परीक्षा (Gold League Exam)',
        target_league: 'mastery',
        min_score_percent: 70,
        questions: [
          { id: 'hi_g_1', question: 'वह जो सब जगह उपस्थित हो, उसके लिए एक शब्द क्या होगा?', options: ['सर्वव्यापी', 'क्षणभंगुर', 'दुर्लभ', 'अनावश्यक'], correct_index: 0, explanation: "सब जगह मौजूद रहने वाले को 'सर्वव्यापी' (omnipresent) कहा जाता है।" },
          { id: 'hi_g_2', question: "मुहावरा पूरा करें: 'दांतों तले _____ दबाना'", options: ['जीभ', 'उंगली', 'हाथ', 'नाखून'], correct_index: 1, explanation: "'दांतों तले उंगली दबाना' का अर्थ दंग रह जाना या आश्चर्यचकित होना होता है।" },
          { id: 'hi_g_3', question: 'सही नकारात्मक वाक्य की पहचान करें:', options: ['वह झूठ नहीं बोलता।', 'वह झूठ नहीं बोलते।', 'वह झूठ नहीं बोलना।', 'वह झूठ नहीं बोली।'], correct_index: 0, explanation: "एकवचन पुल्लिंग कर्ता ('वह') के लिए 'बोलता' के साथ 'नहीं' का प्रयोग बिल्कुल सही है।" }
        ]
      }
    },
    ml: {
      bronze: {
        title: 'ബ്രോൺസ് ലീഗ് പരീക്ഷ (Bronze League Exam)',
        target_league: 'silver',
        min_score_percent: 70,
        questions: [
          { id: 'ml_b_1', question: 'താഴെ പറയുന്നവയിൽ ശരിയായ അക്ഷരവിന്യാസമുള്ള വാക്ക് ഏതാണ്?', options: ['ആശിർവാദം', 'ആശീർവാദം', 'അശിർവാദം', 'ആശിർവാഠം'], correct_index: 1, explanation: "'ആശീർവാദം' എന്നതാണ് ശരിയായ പദം." },
          { id: 'ml_b_2', question: 'വളരെ വലിയ വലിപ്പത്തെ സൂചിപ്പിക്കുന്ന നാമവിശേഷണം ഏതാണ്?', options: ['ചെറിയ', 'ബൃഹത്തായ/ഭീമമായ', 'സൂക്ഷ്മമായ', 'മെലിഞ്ഞ'], correct_index: 1, explanation: "'ബൃഹത്തായ' എന്നത് പ്രബലമായ വലിപ്പത്തെ സൂചിപ്പിക്കുന്നു." },
          { id: 'ml_b_3', question: "'ഓടുക' എന്ന ക്രിയയുടെ ഭൂതകാല രൂപം ഏതാണ്?", options: ['ഓടും', 'ഓടി', 'ഓടുന്നു', 'ഓടുക'], correct_index: 1, explanation: "ഓടുന്ന പ്രക്രിയ കഴിഞ്ഞതിനെ 'ഓടി' എന്ന് രേഖപ്പെടുത്തുന്നു." }
        ]
      },
      silver: {
        title: 'സിൽവർ ലീഗ് പരീക്ഷ (Silver League Exam)',
        target_league: 'gold',
        min_score_percent: 70,
        questions: [
          { id: 'ml_s_1', question: "'പരോപകാരി' എന്ന വാക്കിന്റെ ശരിയായ അർത്ഥമെന്താണ്?", options: ['മറ്റുള്ളവർക്ക് ദോഷം ചെയ്യുന്നവൻ', 'മറ്റുള്ളവർക്ക് നന്മ ചെയ്യുന്നവൻ', 'സമ്പന്നനായ മനുഷ്യൻ', 'മിണ്ടാതിരിക്കുന്നവൻ'], correct_index: 1, explanation: "സ്വാർത്ഥതയില്ലാതെ മറ്റുള്ളവരെ സഹായിക്കുന്നവനെയാണ് പരോപകാരി എന്ന് വിളിക്കുന്നത്." },
          { id: 'ml_s_2', question: "ശരിയായ യോജക വാക്ക് തിരഞ്ഞെടുക്കുക: 'എനിക്ക് പുറത്തു പോകണമായിരുന്നു, _____ ശക്തമായ മഴ പെയ്തു.'", options: ['കാരണം', 'പക്ഷേ', 'അതുകൊണ്ട്', 'അല്ലെങ്കിൽ'], correct_index: 1, explanation: "മുൻ വാക്യത്തിന് വിപരീതമായ കാര്യം പറയാൻ 'പക്ഷേ' ഉപയോഗിക്കുന്നു." },
          { id: 'ml_s_3', question: "വാക്യത്തിലെ നാമപദം കണ്ടെത്തുക: 'മനോഹരമായ പട്ടി ഉച്ചത്തിൽ കുരച്ചു.'", options: ['മനോഹരമായ', 'പട്ടി', 'കുരച്ചു', 'ഉച്ചത്തിൽ'], correct_index: 1, explanation: "മൃഗത്തിന്റെ പേരായ 'പട്ടി' എന്നത് ഒരു നാമപദമാണ്." }
        ]
      },
      gold: {
        title: 'ഗോൾഡ് ലീഗ് പരീക്ഷ (Gold League Exam)',
        target_league: 'mastery',
        min_score_percent: 70,
        questions: [
          { id: 'ml_g_1', question: 'എല്ലാ സ്ഥലത്തും ഒരേ സമയം നിറഞ്ഞുനിൽക്കുന്നതിനെ എന്താണ് വിളിക്കുന്നത്?', options: ['സർവ്വവ്യാപി', 'ക്ഷണികം', 'അപൂർവ്വം', 'അനാവശ്യം'], correct_index: 0, explanation: "എല്ലായിടത്തും ഒരുപോലെ നിലകൊള്ളുന്ന ശക്തിയെ 'സർവ്വവ്യാപി' എന്ന് വിളിക്കുന്നു." },
          { id: 'ml_g_2', question: "മലയാളം ശൈലി പൂർത്തിയാക്കുക: 'ഉപ്പിലിട്ടത് പോലെ _____'", options: ['തളരുക', 'കഴിക്കുക', 'ഇരിക്കുക', 'കിടക്കുക'], correct_index: 0, explanation: "പ്രത്യേക ലക്ഷ്യമൊന്നുമില്ലാതെ നിഷ്ക്രിയമായി ഒരിടത്ത് തന്നെ കഴിയുന്ന അവസ്ഥയെയാണ് 'ഉപ്പിലിട്ടത് പോലെ ഇരിക്കുക' എന്ന് ശൈലിയിൽ പറയുന്നത്." },
          { id: 'ml_g_3', question: 'ശരിയായ നിഷേധ വാക്യം കണ്ടെത്തുക:', options: ['അവൾ കള്ളം പറയുകയില്ല.', 'അവൾ കള്ളം പറയുകയില്ലരു.', 'അവൾ കള്ളം പറയുകയില്ലെ.', 'അവൾ കള്ളം പറയുകയില്ലന.'], correct_index: 0, explanation: "സ്ത്രീലിംഗ ഏകവചന കർത്താവിനോടൊപ്പം 'പറയുകയില്ല' എന്നത് ശരിയായ പ്രയോഗമാണ്." }
        ]
      }
    },
    te: {
      bronze: {
        title: 'కాంశ్య లీగ్ పరీక్ష (Bronze League Exam)',
        target_league: 'silver',
        min_score_percent: 70,
        questions: [
          { id: 'te_b_1', question: 'కింది వాటిలో సరైన అక్షరక్రమం గల పదం ఏది?', options: ['ఆసిర్వాదం', 'ఆశీర్వాదం', 'అసిర్వాదం', 'ఆసిర్వాడం'], correct_index: 1, explanation: "'ఆశీర్వాదం' అనేది సరైన సంస్కృత తత్సమ పదం." },
          { id: 'te_b_2', question: 'చాలా పెద్ద పరిమాణాన్ని సూచించే పదం ఏది?', options: ['చిన్న', 'విశాలమైన/భారీ', 'సూక్ష్మ', 'సన్నని'], correct_index: 1, explanation: "'భారీ' లేదా 'విశాలమైన' అంటే చాలా పెద్దది అని అర్థం." },
          { id: 'te_b_3', question: 'పరిగెత్తుట క్రియకు భూతకాల రూపం ఏది?', options: ['పరిగెత్తుతాడు', 'పరిగెత్తాడు', 'పరిగెత్తుతుంది', 'పరిగెత్తడం'], correct_index: 1, explanation: "పని జరిగిపోయినట్లు తెలిపే క్రియారూపం 'పరిగెత్తాడు'." }
        ]
      },
      silver: {
        title: 'రజత లీగ్ పరీక్ష (Silver League Exam)',
        target_league: 'gold',
        min_score_percent: 70,
        questions: [
          { id: 'te_s_1', question: "'పరోపకారి' పదానికి సరైన అర్థం ఏమిటి?", options: ['ఇతరులకు కీడు చేసేవాడు', 'ఇతరులకు మేలు చేసేవాడు', 'ధనవంతుడు', 'మౌనంగా ఉండేవాడు'], correct_index: 1, explanation: "పరులకు ఉపకారం చేసేవాడిని పరోపకారి అంటారు." },
          { id: 'te_s_2', question: "సరైన సంధి పదాన్ని ఎంచుకోండి: 'నేను బయటకు వెళ్ళాలనుకున్నాను, _____ వర్షం పడింది.'", options: ['ఎందుకంటే', 'కానీ', 'అందువల్ల', 'లేదా'], correct_index: 1, explanation: "మునుపటి వాక్యానికి విరుద్ధంగా చెప్పడానికి 'కానీ' ఉపయోగిస్తాము." },
          { id: 'te_s_3', question: "వాక్యంలో నామవాచకాన్ని గుర్తించండి: 'అందమైన కుక్క బిగ్గరగా అరిచింది.'", options: ['అందమైన', 'కుక్క', 'అరిచింది', 'బిగ్గరగా'], correct_index: 1, explanation: "జంతువు పేరును సూచించే పదం 'కుక్క' కాబట్టి అది నామవాచకం." }
        ]
      },
      gold: {
        title: 'స్వర్ణ లీగ్ పరీక్ష (Gold League Exam)',
        target_league: 'mastery',
        min_score_percent: 70,
        questions: [
          { id: 'te_g_1', question: 'అన్ని చోట్లా ఒకే సమయంలో ఉండేదానిని ఏమంటారు?', options: ['సర్వవ్యాపి', 'క్షణభంగురం', 'అరుదైనది', 'అనవసరమైనది'], correct_index: 0, explanation: "అంతటా నిండి ఉండే శక్తిని లేదా వస్తువును 'సర్వవ్యాపి' అంటారు." },
          { id: 'te_g_2', question: "తెలుగు జాతీయాన్ని పూర్తి చేయండి: 'నోటి ముత్యాలు _____'", options: ['రాలడం', 'కొరకడం', 'నవ్వడం', 'పాడటం'], correct_index: 0, explanation: "ఎక్కువగా మాట్లాడని వ్యక్తి చివరకు మాట్లాడినప్పుడు 'నోటి ముత్యాలు రాలాయా' అంటారు." },
          { id: 'te_g_3', question: 'సరైన వ్యతిరేక వాక్యాన్ని గుర్తించండి:', options: ['ఆమె అబద్ధం చెప్పదు.', 'ఆమె అబద్ధం చెప్పరు.', 'ఆమె అబద్ధం చెప్పవు.', 'ఆమె అబద్ధం చెప్పను.'], correct_index: 0, explanation: "స్త్రీలింగ ఏకవచన కర్తకు 'చెప్పదు' అనేది సరైన వ్యతిరేక క్రియారూపం." }
        ]
      }
    },
    kn: {
      bronze: {
        title: 'ಕಂಚಿನ ಲೀಗ್ ಪರೀಕ್ಷೆ (Bronze League Exam)',
        target_league: 'silver',
        min_score_percent: 70,
        questions: [
          { id: 'kn_b_1', question: 'ಕೆಳಗಿನವುಗಳಲ್ಲಿ ಸರಿಯಾದ ಕಾಗುಣಿತ ಹೊಂದಿರುವ ಪದ ಯಾವುದು?', options: ['ಆಸಿರ್ವಾದ', 'ಆಶೀರ್ವಾದ', 'ಅಸಿರ್ವಾದ', 'ಆಸಿರ್ವಾಡ'], correct_index: 1, explanation: "'ಆಶೀರ್ವಾದ' ಎಂಬುದು ಸರಿಯಾದ ಕಾಗುಣಿತ ರೂಪವಾಗಿದೆ." },
          { id: 'kn_b_2', question: 'ಅತಿ ದೊಡ್ಡ ಗಾತ್ರವನ್ನು ಸೂಚಿಸುವ ವಿಶೇಷಣ ಯಾವುದು?', options: ['ಸಣ್ಣ', 'ಬೃಹತ್ (ವಿಶಾಲ)', 'ಸೂಕ್ಷ್ಮ', 'ತೆಳು'], correct_index: 1, explanation: "'ಬೃಹತ್' ಎಂದರೆ ಅತ್ಯಂತ ದೊಡ್ಡ ಪ್ರಮಾಣದ ಗಾತ್ರ." },
          { id: 'kn_b_3', question: "'ಓಡು' ಕ್ರಿಯಾಪದದ ಭೂತಕಾಲ ರೂಪ ಯಾವುದು?", options: ['ಓಡುತ್ತಾನೆ', 'ಓಡಿದನು', 'ಓಡುವನು', 'ಓಡುತ್ತಾ'], correct_index: 1, explanation: "ಓಡುವ ಕ್ರಿಯೆ ಮುಗಿದಿರುವುದನ್ನು 'ಓಡಿದನು' ಎಂದು ಹೇಳಲಾಗುತ್ತದೆ." }
        ]
      },
      silver: {
        title: 'ಬೆಳ್ಳಿಯ ಲೀಗ್ ಪರೀಕ್ಷೆ (Silver League Exam)',
        target_league: 'gold',
        min_score_percent: 70,
        questions: [
          { id: 'kn_s_1', question: "'ಪರೋಪಕಾರಿ' ಪದದ ಸರಿಯಾದ ಅರ್ಥವೇನು?", options: ['ಇತರರಿಗೆ ಕೆಡುಕು ಮಾಡುವವನು', 'ಇತರರಿಗೆ ಒಳಿತನ್ನು ಬಯಸುವವನು/ಮಾಡುವವನು', 'ಶ್ರೀಮಂತ ವ್ಯಕ್ತಿ', 'ಮೌನಿಯಾಗಿರುವವನು'], correct_index: 1, explanation: "ಯಾರು ಸ್ವಾರ್ಥವಿಲ್ಲದೆ ಇತರರಿಗೆ ಒಳಿತನ್ನು ಮಾಡುತ್ತಾರೋ ಅವರು ಪರೋಪಕಾರಿ." },
          { id: 'kn_s_2', question: "ಸರಿಯಾದ ಲಿಂಕ್ ಪದವನ್ನು ಆರಿಸಿ: 'ನಾನು ಹೊರಗೆ ಹೋಗಲು ಬಯಸಿದ್ದೆ, _____ ಜೋರಾಗಿ ಮಳೆ ಬಂದಿತು.'", options: ['ಏಕೆಂದರೆ', 'ಆದರೆ', 'ಆದ್ದರಿಂದ', 'ಅಥವಾ'], correct_index: 1, explanation: "ಮುಂಚಿನ ವಾಕ್ಯಕ್ಕೆ ಭಿನ್ನವಾದ ಪರಿಸ್ಥಿತಿ ಸೂಚಿಸಲು 'ಆದರೆ' ಬಳಸುತ್ತೇವೆ." },
          { id: 'kn_s_3', question: "ವಾಕ್ಯದಲ್ಲಿ ನಾಮಪದವನ್ನು ಗುರುತಿಸಿ: 'ಸುಂದರವಾದ ನಾಯಿ ಜೋರಾಗಿ ಬೊಗಳಿತು.'", options: ['ಸುಂದರವಾದ', 'ನಾಯಿ', 'ಬೊಗಳಿತು', 'ಜೋರಾಗಿ'], correct_index: 1, explanation: "ಪ್ರಾಣಿಯ ಹೆಸರನ್ನು ಸೂಚಿಸುವ 'ನಾಯಿ' ಎಂಬುದು ನಾಮಪದ." }
        ]
      },
      gold: {
        title: 'ಚಿನ್ನದ ಲೀಗ್ ಪರೀಕ್ಷೆ (Gold League Exam)',
        target_league: 'mastery',
        min_score_percent: 70,
        questions: [
          { id: 'kn_g_1', question: 'ಎಲ್ಲಾ ಕಡೆ ಏಕಕಾಲದಲ್ಲಿ ಇರುವುದಕ್ಕೆ ಏನನ್ನುತ್ತಾರೆ?', options: ['ಸರ್ವವ್ಯಾಪಿ', 'ಕ್ಷಣಭಂಗುರ', 'ಅಪರೂಪದ', 'ಅನಗತ್ಯ'], correct_index: 0, explanation: "ಎಲ್ಲೆಡೆಯೂ ವ್ಯಾಪಿಸಿರುವ ಶಕ್ತಿ ಅಥವಾ ತತ್ವವನ್ನು 'ಸರ್ವವ್ಯಾಪಿ' ಎನ್ನಲಾಗುತ್ತದೆ." },
          { id: 'kn_g_2', question: "ಕನ್ನಡ ಗಾದೆ ಮಾತನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ: 'ತುಂಬಿದ ಕೊಡ _____'", options: ['ತುಳುಕುವುದಿಲ್ಲ', 'ತುಳುಕುತ್ತದೆ', 'ಹಾಳಾಗುತ್ತದೆ', 'ಒಡೆಯುತ್ತದೆ'], correct_index: 0, explanation: "ತಿಳುವಳಿಕೆ ಉಳ್ಳವರು ಎಂದಿಗೂ ಆಡಂಬರ ಮಾಡುವುದಿಲ್ಲ ಎಂಬುದನ್ನು ಸೂಚಿಸಲು 'ತುಂಬಿದ ಕೊಡ ತುಳುಕುವುದಿಲ್ಲ' ಎನ್ನಲಾಗುತ್ತದೆ." },
          { id: 'kn_g_3', question: 'ಸರಿಯಾದ ನಕಾರಾತ್ಮಕ ವಾಕ್ಯವನ್ನು ಗುರುತಿಸಿ:', options: ['ಅವಳು ಸುಳ್ಳು ಹೇಳುವುದಿಲ್ಲ.', 'ಅವಳು ಸುಳ್ಳು ಹೇಳುವುದಿಲ್ಲರು.', 'ಅವಳು ಸುಳ್ಳು ಹೇಳುವುದಿಲ್ಲೆ.', 'ಅವಳು ಸುಳ್ಳು ಹೇಳುವುದಿಲ್ಲನು.'], correct_index: 0, explanation: "ಸ್ತ್ರೀಲಿಂಗ ಏಕವಚನಕ್ಕೆ 'ಹೇಳುವುದಿಲ್ಲ' ಎಂಬ ನಕಾರಾತ್ಮಕ ಕ್ರಿಯಾಪದ ಸೂಕ್ತವಾಗಿದೆ." }
        ]
      }
    },
    ta: {
      bronze: {
        title: 'வெண்கல ലീഗ് தேர்வு (Bronze League Exam)',
        target_league: 'silver',
        min_score_percent: 70,
        questions: [
          { id: 'ta_b_1', question: 'சரியான தமிழ் எழுத்துக்கூட்டல் கொண்ட சொல் எது?', options: ['ஆசிர்வாதம்', 'ஆசீர்வாதம்', 'அசிர்வாதம்', 'ஆசிர்வாடம்'], correct_index: 1, explanation: "'ஆசீர்வாதம்' என்பதே சரியான தமிழ் எழுத்துக் கூட்டல் ஆகும்." },
          { id: 'ta_b_2', question: 'மிகப் பெரிய அளவைக் குறிக்கும் சொல் எது?', options: ['சிறிய', 'மிகப் பெரிய', 'நுண்ணிய', 'மெல்லிய'], correct_index: 1, explanation: "'மிகப் பெரிய' என்பது பிரம்மாண்டமான அளவைக் குறிக்கும் சொல்." },
          { id: 'ta_b_3', question: 'ஓடினான் என்பதன் நிகழ்காலம் என்ன?', options: ['ஓடுகிறான்', 'ஓடினான்', 'ஓடுவான்', 'ஓடுதல்'], correct_index: 0, explanation: "நிகழ்காலத்தைக் குறிக்க 'ஓடுகிறான்' என்று பயன்படுத்த வேண்டும்." }
        ]
      },
      silver: {
        title: 'வெள்ளி ലീഗ് தேர்வு (Silver League Exam)',
        target_league: 'gold',
        min_score_percent: 70,
        questions: [
          { id: 'ta_s_1', question: "'நற்பண்பு' கொண்ட ஒருவரைக் குறிக்கும் சொல் எது?", options: ['கொடியவர்', 'நற்குணாளர் (வள்ளல்)', 'செல்வந்தர்', 'சத்தமிடுபவர்'], correct_index: 1, explanation: "நற்பண்பும் ஈகைக் குணமும் கொண்டவர் நற்குணாளர் எனப்படுவார்." },
          { id: 'ta_s_2', question: "வாக்கியத்தை நிரப்புக: 'நான் விளையாடச் சென்றேன், _____ திடீரென மழை பெய்தது.'", options: ['ஏனெனில்', 'ஆனால்', 'அதனால்', 'அல்லது'], correct_index: 1, explanation: "முரணான கருத்தை இணைக்க 'ஆனால்' என்ற இணைப்புச்சொல் பயன்படுத்தப்படுகிறது." },
          { id: 'ta_s_3', question: "வாக்கியத்தில் உள்ள பெயர்ச்சொல்லைக் கண்டறியவும்: 'அழகான நாய் வேகமாக ஓடியது.'", options: ['அழகான', 'நாய்', 'வேகமாக', 'ஓடியது'], correct_index: 1, explanation: "'நாய்' என்பது ஒரு விலங்கைக் குறிக்கும் பெயர்ச்சொல் (Noun) ஆகும்." }
        ]
      },
      gold: {
        title: 'தங்கம் ലീഗ് தேர்வு (Gold League Exam)',
        target_league: 'mastery',
        min_score_percent: 70,
        questions: [
          { id: 'ta_g_1', question: 'எல்லா இடங்களிலும் ஒரே நேரத்தில் நிறைந்திருப்பதை குறிக்கும் சொல் எது?', options: ['நீக்கமற நிறைந்திருப்பது', 'அழிந்துபோகும்', 'பற்றாக்குறை', 'தேவையற்றது'], correct_index: 0, explanation: "எங்கும் நிறைந்திருக்கும் தன்மைக்கு 'நீக்கமற நிறைந்திருப்பது' என்று பொருள்." },
          { id: 'ta_g_2', question: "தமிழ் மரபுத்தொடரை நிரப்புக: 'கண்ணிமைக்கும் _____'", options: ['நேரம்', 'நொடி', 'காலம்', 'பொழுது'], correct_index: 0, explanation: "'கண்ணிமைக்கும் நேரம்' என்பது மிகக் குறுகிய காலத்தைக் குறிக்கும் தமிழ் மரபுத்தொடர்." },
          { id: 'ta_g_3', question: 'சரியான எதிர்மறை வாக்கியத்தைத் தேர்ந்தெடுக்கவும்:', options: ['அவள் பொய் பேச மாட்டான்.', 'அவள் பொய் பேச மாட்டாள்.', 'அவள் பொய் பேச மாட்டார்கள்.', 'அவள் பொய் பேச மாட்டேன்.'], correct_index: 1, explanation: "பெண்பால் ஒருமை எழுவாய்க்கு 'பேச மாட்டாள்' என்பதே சரியான எதிர்மறை வினைமுற்று." }
        ]
      }
    }
  };

  const stmt = db.prepare('INSERT OR REPLACE INTO league_exams (id, league, lang, data) VALUES (?, ?, ?, ?)');
  db.transaction(() => {
    db.prepare("DELETE FROM league_exams").run();
    for (const [lang, leagues] of Object.entries(LEAGUE_EXAMS_DATA)) {
      for (const [league, data] of Object.entries(leagues)) {
        stmt.run(`exam_${league}_${lang}`, league, lang, JSON.stringify(data));
      }
    }
  })();
}

function defaultCourseProgress() {
  return {
    course_id: null,
    lessons_completed: [],
    checkpoint_passed: false,
    checkpoint_score: null,
  };
}

function defaultStreak() {
  return { current: 0, goal: 14, last_activity: null };
}

function defaultCertificate() {
  return {
    issued: false,
    credential_id: null,
    issued_date: null,
    course_title: null,
    score: null,
  };
}

function rowToUser(row) {
  if (!row) return null;
  const db = getDb();

  // Load streak
  const streakRow = db.prepare('SELECT current_streak, goal, last_activity FROM user_streaks WHERE user_id = ?').get(row.id);
  const streak = streakRow
    ? { current: streakRow.current_streak, goal: streakRow.goal, last_activity: streakRow.last_activity }
    : defaultStreak();

  // Load lesson progress (with scores)
  const progressRows = db.prepare('SELECT lesson_id, score, course_id FROM user_lesson_progress WHERE user_id = ?').all(row.id);
  const lessons_completed = progressRows.map((r) => r.lesson_id);
  const lesson_scores = progressRows.reduce((acc, r) => { acc[r.lesson_id] = r.score || 0; return acc; }, {});

  // Load certificates
  const certRows = db.prepare('SELECT credential_id, course_id, course_title, score, issued_date FROM certificates WHERE user_id = ?').all(row.id);
  const certificates = certRows.map((c) => ({
    issued: true,
    credential_id: c.credential_id,
    course_id: c.course_id,
    course_title: c.course_title,
    score: c.score,
    issued_date: c.issued_date,
  }));
  const latestCert = certificates[certificates.length - 1] || defaultCertificate();

  const checkpoint_passed = certificates.length > 0;

  // Load league certificates
  const leagueCertRows = db.prepare('SELECT credential_id, league, league_title, score, issued_date FROM league_certificates WHERE user_id = ?').all(row.id);
  const league_certificates = leagueCertRows.map((c) => ({
    credential_id: c.credential_id,
    league: c.league,
    league_title: c.league_title,
    score: c.score,
    issued_date: c.issued_date,
  }));

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    preferred_language: row.preferred_language,
    education_level: row.education_level,
    assessment_score: row.assessment_score,
    current_path: row.current_path,
    course_progress: {
      course_id: latestCert.course_id || null,
      lessons_completed,
      lesson_scores,
      checkpoint_passed,
      checkpoint_score: latestCert.score || null,
    },
    streak,
    gems: row.gems,
    xp: row.xp,
    league: row.league || 'bronze',
    certificate: latestCert,
    certificates,
    league_certificates,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function getDbStatus() {
  const db = getDb();
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  const regCount = db.prepare('SELECT COUNT(*) as count FROM registrations').get().count;
  const loginCount = db.prepare('SELECT COUNT(*) as count FROM login_events').get().count;

  return {
    ok: true,
    engine: 'sqlite',
    path: DB_FILE,
    users: userCount,
    registrations: regCount,
    login_events: loginCount,
  };
}

export function listUsers() {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM users').all();
  return rows.map(rowToUser).map(sanitizeUser);
}

export function findUserByEmail(email) {
  const db = getDb();
  const needle = String(email || '').toLowerCase().trim();
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(needle);
  return rowToUser(row);
}

export function findUserById(id) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  return rowToUser(row);
}

export function createUser(data) {
  const db = getDb();
  const email = String(data.email || '').toLowerCase().trim();
  if (!email || !email.includes('@')) {
    const err = new Error('Valid email is required');
    err.status = 400;
    throw err;
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    const err = new Error('Email already registered. Please log in instead.');
    err.status = 409;
    throw err;
  }
  if (!String(data.name || '').trim()) {
    const err = new Error('Full name is required');
    err.status = 400;
    throw err;
  }
  if (!data.password) {
    const err = new Error('Password is required');
    err.status = 400;
    throw err;
  }

  const now = new Date().toISOString();
  const id = randomUUID();
  const name = String(data.name).trim();
  const preferred_language = data.preferred_language || 'en';
  const education_level = data.education_level || 'Primary School';

  const insertUser = db.prepare(`
    INSERT INTO users (
      id, name, email, password, preferred_language, education_level,
      assessment_score, current_path, course_progress, streak, gems, xp,
      certificate, certificates, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertStreak = db.prepare(`
    INSERT INTO user_streaks (user_id, current_streak, goal, last_activity)
    VALUES (?, ?, ?, ?)
  `);

  const insertReg = db.prepare(`
    INSERT INTO registrations (id, user_id, email, name, preferred_language, education_level, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const defaultProgressJson = JSON.stringify(defaultCourseProgress());
  const defaultStreakJson = JSON.stringify(defaultStreak());
  const defaultCertJson = JSON.stringify(defaultCertificate());
  const defaultCertsJson = JSON.stringify([]);

  db.transaction(() => {
    insertUser.run(
      id,
      name,
      email,
      data.password,
      preferred_language,
      education_level,
      null,
      null,
      defaultProgressJson,
      defaultStreakJson,
      0,
      0,
      defaultCertJson,
      defaultCertsJson,
      now,
      now
    );
    insertStreak.run(id, 0, 14, null);
    insertReg.run(randomUUID(), id, email, name, preferred_language, education_level, now);
  })();

  return sanitizeUser(findUserById(id));
}

export function updateUser(id, updates) {
  const db = getDb();
  const existing = findUserById(id);
  if (!existing) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const name = updates.name !== undefined ? String(updates.name).trim() : existing.name;
  const password = updates.password !== undefined ? updates.password : existing.password;
  const preferred_language = updates.preferred_language !== undefined ? updates.preferred_language : existing.preferred_language;
  const education_level = updates.education_level !== undefined ? updates.education_level : existing.education_level;
  const assessment_score = updates.assessment_score !== undefined ? updates.assessment_score : existing.assessment_score;
  const current_path = updates.current_path !== undefined ? updates.current_path : existing.current_path;
  const gems = updates.gems !== undefined ? updates.gems : existing.gems;
  const xp = updates.xp !== undefined ? updates.xp : existing.xp;
  const updated_at = new Date().toISOString();

  db.transaction(() => {
    db.prepare(`
      UPDATE users SET
        name = ?,
        password = ?,
        preferred_language = ?,
        education_level = ?,
        assessment_score = ?,
        current_path = ?,
        gems = ?,
        xp = ?,
        updated_at = ?
      WHERE id = ?
    `).run(
      name,
      password,
      preferred_language,
      education_level,
      assessment_score,
      current_path,
      gems,
      xp,
      updated_at,
      id
    );

    if (updates.streak) {
      const s = { ...existing.streak, ...updates.streak };
      db.prepare(`
        INSERT INTO user_streaks (user_id, current_streak, goal, last_activity)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
          current_streak = excluded.current_streak,
          goal = excluded.goal,
          last_activity = excluded.last_activity
      `).run(id, s.current || 0, s.goal || 14, s.last_activity || null);
    }

    if (updates.course_progress?.lessons_completed) {
      const insertProgress = db.prepare(`
        INSERT INTO user_lesson_progress (user_id, course_id, lesson_id, score, completed_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(user_id, lesson_id) DO UPDATE SET score = excluded.score, completed_at = excluded.completed_at
      `);
      for (const lessonId of updates.course_progress.lessons_completed) {
        const score = updates.course_progress.lesson_scores?.[lessonId] || 0;
        insertProgress.run(id, updates.course_progress.course_id || null, lessonId, score, nowStr());
      }
    }

    if (updates.certificate?.issued) {
      const cert = updates.certificate;
      db.prepare(`
        INSERT OR REPLACE INTO certificates (credential_id, user_id, course_id, course_title, score, issued_date)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        cert.credential_id || 'LIT-' + randomUUID().slice(0, 8).toUpperCase(),
        id,
        cert.course_id || 'course_1',
        cert.course_title || 'Literacy Course',
        cert.score || 80,
        cert.issued_date || nowStr()
      );
    }
  })();

  return sanitizeUser(findUserById(id));
}

function nowStr() {
  return new Date().toISOString();
}

export function getUserWithPassword(email) {
  return findUserByEmail(email);
}

export function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
}

export function recordLoginEvent({ userId = null, email, success, ip = null, userAgent = null }) {
  const db = getDb();
  db.prepare(`
    INSERT INTO login_events (id, user_id, email, success, ip, user_agent, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    randomUUID(),
    userId,
    String(email || '').toLowerCase(),
    success ? 1 : 0,
    ip,
    userAgent,
    nowStr()
  );
}

export function bumpActivity(userId, { xp = 0, gems = 0 } = {}) {
  const user = findUserById(userId);
  if (!user) return null;

  const today = new Date().toISOString().slice(0, 10);
  const last = user.streak.last_activity
    ? new Date(user.streak.last_activity).toISOString().slice(0, 10)
    : null;

  let current = user.streak.current || 0;
  if (last !== today) {
    if (last) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const y = yesterday.toISOString().slice(0, 10);
      current = last === y ? current + 1 : 1;
    } else {
      current = 1;
    }
  }

  return updateUser(userId, {
    xp: (user.xp || 0) + xp,
    gems: (user.gems || 0) + gems,
    streak: {
      current,
      goal: user.streak.goal || 14,
      last_activity: new Date().toISOString(),
    },
  });
}

export function getCoursesFromDb(lang = null) {
  const db = getDb();
  if (lang) {
    const rows = db.prepare('SELECT data FROM courses WHERE lang = ?').all(lang);
    return rows.map((r) => JSON.parse(r.data));
  }
  const rows = db.prepare('SELECT data FROM courses').all();
  return rows.map((r) => JSON.parse(r.data));
}

export function getLessonScores(userId, courseId) {
  const db = getDb();
  const rows = db.prepare(
    'SELECT lesson_id, score FROM user_lesson_progress WHERE user_id = ? AND course_id = ?'
  ).all(userId, courseId);
  return rows;
}

export function getCourseScores(userId, courseId) {
  const db = getDb();
  const lessonRows = db.prepare(
    'SELECT lesson_id, score FROM user_lesson_progress WHERE user_id = ? AND course_id = ?'
  ).all(userId, courseId);

  const certRow = db.prepare(
    'SELECT score FROM certificates WHERE user_id = ? AND course_id = ?'
  ).get(userId, courseId);

  const lessonScores = lessonRows.map((r) => ({ lesson_id: r.lesson_id, score: r.score || 0 }));
  const checkpointScore = certRow?.score || null;

  const allScores = lessonScores.map((l) => l.score);
  if (checkpointScore != null) allScores.push(checkpointScore);
  const courseAverage = allScores.length > 0
    ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
    : 0;

  return { lessons: lessonScores, checkpoint_score: checkpointScore, course_average: courseAverage };
}

export function getAssessmentsFromDb() {
  const db = getDb();
  const rows = db.prepare('SELECT data FROM assessments').all();
  return rows.map((r) => JSON.parse(r.data));
}

export function getLeagueExamFromDb(league, lang = 'en') {
  const db = getDb();
  const row = db.prepare('SELECT data FROM league_exams WHERE league = ? AND lang = ?').get(league, lang)
    || db.prepare('SELECT data FROM league_exams WHERE league = ? AND lang = ?').get(league, 'en');
  return row ? JSON.parse(row.data) : null;
}

export function saveLeagueExamToDb(id, league, lang, data) {
  const db = getDb();
  db.prepare(`
    INSERT INTO league_exams (id, league, lang, data)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET data = excluded.data
  `).run(id, league, lang, JSON.stringify(data));
}

export function promoteUserLeague(userId, newLeague, leagueTitle, score) {
  const db = getDb();
  const now = new Date().toISOString();
  const credential_id = 'LIT-LEAGUE-' + randomUUID().slice(0, 8).toUpperCase();

  db.transaction(() => {
    db.prepare('UPDATE users SET league = ?, updated_at = ? WHERE id = ?').run(newLeague, now, userId);
    db.prepare(`
      INSERT INTO league_certificates (credential_id, user_id, league, league_title, score, issued_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(credential_id, userId, newLeague, leagueTitle, score, now);
  })();

  return { credential_id, league: newLeague, league_title: leagueTitle, score, issued_date: now };
}

export function assertStoreWritable() {
  return getDbStatus();
}

export function getCommunityPosts() {
  const db = getDb();
  const rows = db.prepare(`
    SELECT cp.*, u.name as registered_user_name
    FROM community_posts cp
    LEFT JOIN users u ON cp.user_id = u.id
    ORDER BY cp.created_at DESC
  `).all();
  return rows.map((r) => ({
    ...r,
    user_name: r.registered_user_name || r.user_name,
    achievement_meta: r.achievement_meta ? JSON.parse(r.achievement_meta) : null,
  }));
}

export function createCommunityPost({ userId, userName, type, content, imageUrl = null, achievementMeta = null, language = 'en' }) {
  const db = getDb();
  const id = 'post_' + randomUUID();
  const createdAt = new Date().toISOString();
  const metaStr = achievementMeta ? JSON.stringify(achievementMeta) : null;

  // Query SQLite users table to ensure exact registered user details
  const userRow = db.prepare('SELECT name, preferred_language FROM users WHERE id = ?').get(userId);
  const actualUserName = userRow?.name || userName || 'Learner';
  const actualLanguage = language || userRow?.preferred_language || 'en';

  db.prepare(`
    INSERT INTO community_posts (id, user_id, user_name, type, content, image_url, achievement_meta, language, likes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, actualUserName, type, content, imageUrl, metaStr, actualLanguage, 0, createdAt);

  return {
    id,
    user_id: userId,
    user_name: actualUserName,
    type,
    content,
    image_url: imageUrl,
    achievement_meta: achievementMeta,
    language: actualLanguage,
    likes: 0,
    created_at: createdAt,
  };
}

export function likeCommunityPost(postId) {
  const db = getDb();
  const row = db.prepare('SELECT likes FROM community_posts WHERE id = ?').get(postId);
  if (!row) return null;
  const updatedLikes = (row.likes || 0) + 1;
  db.prepare('UPDATE community_posts SET likes = ? WHERE id = ?').run(updatedLikes, postId);
  return { id: postId, likes: updatedLikes };
}

export function deleteCommunityPost(postId, userId) {
  const db = getDb();
  const row = db.prepare('SELECT user_id FROM community_posts WHERE id = ?').get(postId);
  if (!row) {
    const err = new Error('Post not found');
    err.status = 404;
    throw err;
  }
  if (row.user_id !== userId) {
    const err = new Error('Unauthorized to delete this post');
    err.status = 403;
    throw err;
  }
  db.prepare('DELETE FROM community_posts WHERE id = ?').run(postId);
  return { success: true, id: postId };
}

