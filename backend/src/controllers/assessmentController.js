import { findUserById, updateUser } from '../services/db.js';
import { getAssessmentQuestions, scoreAssessment, getRecommendedCourse, publicCourseSummary } from '../services/courses.js';

export function getAssessment(req, res) {
  try {
    const user = findUserById(req.user.id);
    const questions = getAssessmentQuestions(
      user.education_level,
      user.preferred_language
    );
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export function submitAssessment(req, res) {
  try {
    const user = findUserById(req.user.id);
    const answers = req.body.answers || [];
    const result = scoreAssessment(
      user.education_level,
      answers
    );
    const updated = updateUser(user.id, {
      assessment_score: result.score,
      current_path: result.path,
    });
    const recommendedFull = getRecommendedCourse(result.score);
    const recommended_course = publicCourseSummary(
      recommendedFull,
      user.preferred_language
    );
    res.json({
      score: result.score,
      path: result.path,
      user: updated,
      recommended_course,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
