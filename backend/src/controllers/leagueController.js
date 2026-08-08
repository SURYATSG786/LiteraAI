import { findUserById, getLeagueExamFromDb, promoteUserLeague, sanitizeUser, listUsers } from '../services/db.js';

const LEAGUES = ['bronze', 'silver', 'gold', 'ruby'];
const LEAGUE_RANKS = { bronze: 1, silver: 2, gold: 3, ruby: 4 };
const LEAGUE_TITLES = {
  bronze: 'Bronze League',
  silver: 'Silver League',
  gold: 'Gold League',
  ruby: 'Ruby League',
};

export function getLeaderboard(req, res) {
  try {
    const allUsers = listUsers();

    // Rank by League tier DESC, XP DESC, Gems DESC, Streak DESC
    const sorted = [...allUsers].sort((a, b) => {
      const rankA = LEAGUE_RANKS[a.league || 'bronze'] || 1;
      const rankB = LEAGUE_RANKS[b.league || 'bronze'] || 1;
      if (rankB !== rankA) return rankB - rankA;

      const xpA = a.xp || 0;
      const xpB = b.xp || 0;
      if (xpB !== xpA) return xpB - xpA;

      const gemsA = a.gems || 0;
      const gemsB = b.gems || 0;
      if (gemsB !== gemsA) return gemsB - gemsA;

      return (b.streak?.current || 0) - (a.streak?.current || 0);
    });

    const leaderboard = sorted.map((u, index) => ({
      rank: index + 1,
      id: u.id,
      name: u.name,
      league: u.league || 'bronze',
      league_title: LEAGUE_TITLES[u.league || 'bronze'] || 'Bronze League',
      xp: u.xp || 0,
      gems: u.gems || 0,
      streak: u.streak?.current || 0,
      is_current_user: u.id === req.user.id,
    }));

    res.json({ leaderboard });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export function getLeagueStatus(req, res) {
  try {
    const user = findUserById(req.user.id);
    const current = user.league || 'bronze';
    const currentIndex = LEAGUES.indexOf(current);
    const nextLeague = currentIndex < LEAGUES.length - 1 ? LEAGUES[currentIndex + 1] : null;

    res.json({
      current_league: current,
      current_title: LEAGUE_TITLES[current] || 'Bronze League',
      next_league: nextLeague,
      next_title: nextLeague ? LEAGUE_TITLES[nextLeague] : null,
      is_max_league: nextLeague === null,
      certificates: user.league_certificates || [],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export function getLeagueExam(req, res) {
  try {
    const user = findUserById(req.user.id);
    const current = user.league || 'bronze';
    const lang = user.preferred_language || 'en';

    const examData = getLeagueExamFromDb(current, lang);
    if (!examData) {
      return res.status(404).json({ error: `No advancement exam found for ${current} league` });
    }

    // Strip correct_index and explanation for client safety
    const publicQuestions = (examData.questions || []).map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      image: q.image || null,
    }));

    res.json({
      league: current,
      title: examData.title,
      target_league: examData.target_league,
      min_score_percent: examData.min_score_percent || 70,
      total_questions: publicQuestions.length,
      questions: publicQuestions,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export function submitLeagueExam(req, res) {
  try {
    const user = findUserById(req.user.id);
    const current = user.league || 'bronze';
    const lang = user.preferred_language || 'en';
    const { answers } = req.body || {};

    if (!Array.isArray(answers)) {
      return res.status(400).json({ error: 'Answers array is required' });
    }

    const examData = getLeagueExamFromDb(current, lang);
    if (!examData) {
      return res.status(404).json({ error: `Exam for ${current} league not found` });
    }

    const questions = examData.questions || [];
    let correct = 0;

    questions.forEach((q, idx) => {
      if (answers[idx] === q.correct_index) {
        correct += 1;
      }
    });

    const total = questions.length;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    const minScore = examData.min_score_percent || 70;
    const passed = score >= minScore;

    let cert = null;
    let newLeague = current;

    if (passed) {
      const nextIdx = LEAGUES.indexOf(current) + 1;
      if (nextIdx < LEAGUES.length) {
        newLeague = LEAGUES[nextIdx];
        const newTitle = LEAGUE_TITLES[newLeague];
        cert = promoteUserLeague(user.id, newLeague, newTitle, score);
      }
    }

    res.json({
      score,
      passed,
      min_score: minScore,
      correct,
      total,
      previous_league: current,
      new_league: newLeague,
      certificate: cert,
      user: sanitizeUser(findUserById(user.id)),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
