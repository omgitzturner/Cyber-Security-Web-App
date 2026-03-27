const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// GET /api/leaderboard - global leaderboard
router.get('/', auth, async (req, res) => {
  try {
    const totalLessons = await pool.query('SELECT COUNT(*) FROM lessons');
    const total = parseInt(totalLessons.rows[0].count);

    const result = await pool.query(
      `SELECT u.id, u.full_name, u.department, u.role,
              COUNT(up.id) FILTER (WHERE up.status = 'completed') AS completed_lessons,
              ROUND(
                COUNT(up.id) FILTER (WHERE up.status = 'completed') * 100.0 / NULLIF($1, 0), 2
              ) AS completion_percentage
       FROM users u
       LEFT JOIN user_progress up ON u.id = up.user_id
       GROUP BY u.id, u.full_name, u.department, u.role
       ORDER BY completion_percentage DESC NULLS LAST, completed_lessons DESC`,
      [total]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Global leaderboard error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/leaderboard/reports/team/:dept - detailed team report
router.get('/reports/team/:dept', auth, roleCheck(['admin', 'manager']), async (req, res) => {
  const { dept } = req.params;
  try {
    const usersResult = await pool.query(
      'SELECT id, full_name, email, role FROM users WHERE department = $1',
      [dept]
    );

    const users = usersResult.rows;
    const report = await Promise.all(users.map(async (user) => {
      const progressResult = await pool.query(
        `SELECT up.lesson_id, up.status, up.quiz_score, up.quiz_attempts,
                up.summary_text, up.completed_at, l.title, l.track
         FROM user_progress up
         JOIN lessons l ON up.lesson_id = l.id
         WHERE up.user_id = $1
         ORDER BY l.track, l.order_index`,
        [user.id]
      );

      const totalLessons = await pool.query('SELECT COUNT(*) FROM lessons');
      const total = parseInt(totalLessons.rows[0].count);
      const completed = progressResult.rows.filter(r => r.status === 'completed').length;

      return {
        user,
        progress: progressResult.rows,
        stats: {
          totalLessons: total,
          completed,
          completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        },
      };
    }));

    res.json({ department: dept, members: report });
  } catch (err) {
    console.error('Team report error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/leaderboard/badges - get all available badges
router.get('/badges', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, description, badge_type, requirement_id, created_at FROM badges ORDER BY badge_type, id'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get all badges error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/leaderboard/badges/:userId - get user's earned badges
router.get('/badges/:userId', auth, async (req, res) => {
  const { userId } = req.params;
  const isSelf = req.user.id === parseInt(userId);
  const isAdminOrManager = ['admin', 'manager'].includes(req.user.role);

  if (!isSelf && !isAdminOrManager) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const result = await pool.query(
      `SELECT ub.id, ub.earned_at, b.name, b.description, b.badge_type, b.requirement_id
       FROM user_badges ub
       JOIN badges b ON ub.badge_id = b.id
       WHERE ub.user_id = $1
       ORDER BY ub.earned_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get user badges error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/leaderboard/:dept - department leaderboard
router.get('/:dept', auth, async (req, res) => {
  const { dept } = req.params;
  try {
    const totalLessons = await pool.query('SELECT COUNT(*) FROM lessons');
    const total = parseInt(totalLessons.rows[0].count);

    const result = await pool.query(
      `SELECT u.id, u.full_name, u.department, u.role,
              COUNT(up.id) FILTER (WHERE up.status = 'completed') AS completed_lessons,
              ROUND(
                COUNT(up.id) FILTER (WHERE up.status = 'completed') * 100.0 / NULLIF($1, 0), 2
              ) AS completion_percentage
       FROM users u
       LEFT JOIN user_progress up ON u.id = up.user_id
       WHERE u.department = $2
       GROUP BY u.id, u.full_name, u.department, u.role
       ORDER BY completion_percentage DESC NULLS LAST, completed_lessons DESC`,
      [total, dept]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Department leaderboard error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
