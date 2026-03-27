const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// GET /api/progress/:userId - overall progress with completion stats
router.get('/:userId', auth, async (req, res) => {
  const { userId } = req.params;
  const isSelf = req.user.id === parseInt(userId);
  const isAdminOrManager = ['admin', 'manager'].includes(req.user.role);

  if (!isSelf && !isAdminOrManager) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const totalLessons = await pool.query('SELECT COUNT(*) FROM lessons');
    const progressResult = await pool.query(
      `SELECT up.*, l.title, l.track, l.order_index
       FROM user_progress up
       JOIN lessons l ON up.lesson_id = l.id
       WHERE up.user_id = $1
       ORDER BY l.track, l.order_index`,
      [userId]
    );

    const total = parseInt(totalLessons.rows[0].count);
    const completed = progressResult.rows.filter(r => r.status === 'completed').length;
    const inProgress = progressResult.rows.filter(r => r.status === 'in_progress').length;

    res.json({
      userId: parseInt(userId),
      totalLessons: total,
      completed,
      inProgress,
      notStarted: total - completed - inProgress,
      completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      lessons: progressResult.rows,
    });
  } catch (err) {
    console.error('Get progress error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/progress/:userId/lessons/:lessonId - specific lesson progress
router.get('/:userId/lessons/:lessonId', auth, async (req, res) => {
  const { userId, lessonId } = req.params;
  const isSelf = req.user.id === parseInt(userId);
  const isAdminOrManager = ['admin', 'manager'].includes(req.user.role);

  if (!isSelf && !isAdminOrManager) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const result = await pool.query(
      `SELECT up.*, l.title, l.track FROM user_progress up
       JOIN lessons l ON up.lesson_id = l.id
       WHERE up.user_id = $1 AND up.lesson_id = $2`,
      [userId, lessonId]
    );

    if (result.rows.length === 0) {
      return res.json({ userId: parseInt(userId), lessonId: parseInt(lessonId), status: 'not_started' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get lesson progress error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/progress/:userId/lessons/:lessonId/start - start or resume lesson
router.post('/:userId/lessons/:lessonId/start', auth, async (req, res) => {
  const { userId, lessonId } = req.params;
  const isSelf = req.user.id === parseInt(userId);
  const isAdmin = req.user.role === 'admin';

  if (!isSelf && !isAdmin) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO user_progress (user_id, lesson_id, status)
       VALUES ($1, $2, 'in_progress')
       ON CONFLICT (user_id, lesson_id)
       DO UPDATE SET status = CASE
         WHEN user_progress.status = 'completed' THEN 'completed'
         ELSE 'in_progress'
       END
       RETURNING *`,
      [userId, lessonId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Start lesson error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/progress/:userId/lessons/:lessonId/quiz - get quiz questions
router.get('/:userId/lessons/:lessonId/quiz', auth, async (req, res) => {
  const { userId, lessonId } = req.params;
  const isSelf = req.user.id === parseInt(userId);
  const isAdminOrManager = ['admin', 'manager'].includes(req.user.role);

  if (!isSelf && !isAdminOrManager) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const result = await pool.query(
      'SELECT id, lesson_id, questions, passing_score FROM quizzes WHERE lesson_id = $1',
      [lessonId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found for this lesson' });
    }

    // Strip correct_answer from questions before sending to client
    const quiz = result.rows[0];
    const sanitizedQuestions = quiz.questions.map(({ correct_answer, explanation, ...q }) => q);
    res.json({ ...quiz, questions: sanitizedQuestions });
  } catch (err) {
    console.error('Get quiz error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/progress/:userId/lessons/:lessonId/quiz - submit quiz answers
router.put('/:userId/lessons/:lessonId/quiz', auth, async (req, res) => {
  const { userId, lessonId } = req.params;
  const isSelf = req.user.id === parseInt(userId);
  const isAdmin = req.user.role === 'admin';

  if (!isSelf && !isAdmin) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { answers } = req.body;
  if (!Array.isArray(answers)) {
    return res.status(400).json({ error: 'answers must be an array' });
  }

  try {
    const quizResult = await pool.query(
      'SELECT id, questions, passing_score FROM quizzes WHERE lesson_id = $1',
      [lessonId]
    );

    if (quizResult.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found for this lesson' });
    }

    const quiz = quizResult.rows[0];
    const questions = quiz.questions;
    const passingScore = quiz.passing_score;

    let correct = 0;
    const results = questions.map((q, idx) => {
      const userAnswer = answers[idx] !== undefined ? answers[idx] : null;
      const isCorrect = userAnswer === q.correct_answer;
      if (isCorrect) correct++;
      return {
        questionId: q.id,
        correct: isCorrect,
        correct_answer: q.correct_answer,
        explanation: q.explanation || null,
      };
    });

    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= passingScore;

    // Update or create progress record
    const progressResult = await pool.query(
      `INSERT INTO user_progress (user_id, lesson_id, status, quiz_score, quiz_attempts)
       VALUES ($1, $2, 'in_progress', $3, 1)
       ON CONFLICT (user_id, lesson_id)
       DO UPDATE SET
         quiz_score = GREATEST(user_progress.quiz_score, $3),
         quiz_attempts = user_progress.quiz_attempts + 1,
         status = CASE WHEN user_progress.status = 'completed' THEN 'completed' ELSE 'in_progress' END
       RETURNING *`,
      [userId, lessonId, score]
    );

    const progress = progressResult.rows[0];

    // Award quiz badge if passed
    if (passed) {
      const badgeResult = await pool.query(
        `SELECT b.id FROM badges b
         WHERE b.badge_type = 'lesson' AND b.requirement_id = $1`,
        [lessonId]
      );

      if (badgeResult.rows.length > 0) {
        const badgeId = badgeResult.rows[0].id;
        await pool.query(
          `INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [userId, badgeId]
        );
      }
    }

    res.json({ score, passed, passingScore, results, progress });
  } catch (err) {
    console.error('Submit quiz error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/progress/:userId/lessons/:lessonId/summary - save summary text
router.put('/:userId/lessons/:lessonId/summary', auth, async (req, res) => {
  const { userId, lessonId } = req.params;
  const isSelf = req.user.id === parseInt(userId);
  const isAdmin = req.user.role === 'admin';

  if (!isSelf && !isAdmin) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { summary_text } = req.body;
  if (!summary_text) {
    return res.status(400).json({ error: 'summary_text is required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO user_progress (user_id, lesson_id, status, summary_text)
       VALUES ($1, $2, 'in_progress', $3)
       ON CONFLICT (user_id, lesson_id)
       DO UPDATE SET summary_text = $3
       RETURNING *`,
      [userId, lessonId, summary_text]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Save summary error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/progress/:userId/lessons/:lessonId/complete - mark lesson complete
router.put('/:userId/lessons/:lessonId/complete', auth, async (req, res) => {
  const { userId, lessonId } = req.params;
  const isSelf = req.user.id === parseInt(userId);
  const isAdmin = req.user.role === 'admin';

  if (!isSelf && !isAdmin) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    // Verify quiz passed and summary submitted
    const progressCheck = await pool.query(
      'SELECT quiz_score, summary_text FROM user_progress WHERE user_id = $1 AND lesson_id = $2',
      [userId, lessonId]
    );

    if (progressCheck.rows.length === 0) {
      return res.status(400).json({ error: 'No progress record found. Start the lesson first.' });
    }

    const progress = progressCheck.rows[0];
    const quizCheck = await pool.query(
      'SELECT passing_score FROM quizzes WHERE lesson_id = $1',
      [lessonId]
    );
    const passingScore = quizCheck.rows.length > 0 ? quizCheck.rows[0].passing_score : 80;

    if (!progress.quiz_score || progress.quiz_score < passingScore) {
      return res.status(400).json({ error: 'Quiz must be passed before completing the lesson' });
    }
    if (!progress.summary_text) {
      return res.status(400).json({ error: 'Summary must be submitted before completing the lesson' });
    }

    const result = await pool.query(
      `UPDATE user_progress SET status = 'completed', completed_at = NOW()
       WHERE user_id = $1 AND lesson_id = $2
       RETURNING *`,
      [userId, lessonId]
    );

    const updatedProgress = result.rows[0];

    // Get lesson track
    const lessonResult = await pool.query('SELECT track FROM lessons WHERE id = $1', [lessonId]);
    const track = lessonResult.rows[0].track;

    // Check if all lessons in track are complete -> award track badge
    const trackLessons = await pool.query(
      'SELECT id FROM lessons WHERE track = $1',
      [track]
    );
    const trackLessonIds = trackLessons.rows.map(r => r.id);
    const completedInTrack = await pool.query(
      `SELECT COUNT(*) FROM user_progress
       WHERE user_id = $1 AND lesson_id = ANY($2) AND status = 'completed'`,
      [userId, trackLessonIds]
    );

    if (parseInt(completedInTrack.rows[0].count) === trackLessonIds.length) {
      const trackBadgeByName = await pool.query(
        `SELECT id FROM badges WHERE badge_type = 'track' AND name ILIKE $1`,
        [`%${track}%`]
      );
      if (trackBadgeByName.rows.length > 0) {
        await pool.query(
          `INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [userId, trackBadgeByName.rows[0].id]
        );
      }
    }

    // Check if ALL lessons are complete -> award master badge
    const allLessons = await pool.query('SELECT COUNT(*) FROM lessons');
    const totalCompleted = await pool.query(
      `SELECT COUNT(*) FROM user_progress WHERE user_id = $1 AND status = 'completed'`,
      [userId]
    );

    if (parseInt(totalCompleted.rows[0].count) === parseInt(allLessons.rows[0].count)) {
      const masterBadge = await pool.query(
        `SELECT id FROM badges WHERE badge_type = 'master'`
      );
      if (masterBadge.rows.length > 0) {
        await pool.query(
          `INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [userId, masterBadge.rows[0].id]
        );
      }
    }

    res.json({ message: 'Lesson completed', progress: updatedProgress });
  } catch (err) {
    console.error('Complete lesson error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
