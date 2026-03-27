const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// POST /api/assignments - create assignment (admin/manager)
router.post('/', auth, roleCheck(['admin', 'manager']), async (req, res) => {
  const { lesson_id, assigned_to_user_id, assigned_to_department, deadline } = req.body;

  if (!lesson_id || (!assigned_to_user_id && !assigned_to_department)) {
    return res.status(400).json({ error: 'lesson_id and either assigned_to_user_id or assigned_to_department are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO lesson_assignments (lesson_id, assigned_to_user_id, assigned_to_department, assigned_by, deadline)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [lesson_id, assigned_to_user_id || null, assigned_to_department || null, req.user.id, deadline || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create assignment error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/assignments/all - get all assignments (admin only)
// Must be before /:assignmentId
router.get('/all', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT la.*, l.title AS lesson_title, l.track,
              u.full_name AS assigned_to_name,
              ab.full_name AS assigned_by_name
       FROM lesson_assignments la
       JOIN lessons l ON la.lesson_id = l.id
       LEFT JOIN users u ON la.assigned_to_user_id = u.id
       JOIN users ab ON la.assigned_by = ab.id
       ORDER BY la.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get all assignments error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/assignments/:userId - get assignments for a user (including department)
router.get('/:userId', auth, async (req, res) => {
  const { userId } = req.params;
  const isSelf = req.user.id === parseInt(userId);
  const isAdminOrManager = ['admin', 'manager'].includes(req.user.role);

  if (!isSelf && !isAdminOrManager) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    // Get user's department
    const userResult = await pool.query('SELECT department FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const department = userResult.rows[0].department;

    const result = await pool.query(
      `SELECT la.*, l.title AS lesson_title, l.track, l.duration_minutes,
              ab.full_name AS assigned_by_name
       FROM lesson_assignments la
       JOIN lessons l ON la.lesson_id = l.id
       JOIN users ab ON la.assigned_by = ab.id
       WHERE la.assigned_to_user_id = $1
          OR (la.assigned_to_department = $2 AND la.assigned_to_user_id IS NULL)
       ORDER BY la.deadline ASC NULLS LAST, la.created_at DESC`,
      [userId, department]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get user assignments error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/assignments/:assignmentId - update assignment deadline
router.put('/:assignmentId', auth, roleCheck(['admin', 'manager']), async (req, res) => {
  const { assignmentId } = req.params;
  const { deadline } = req.body;

  if (!deadline) {
    return res.status(400).json({ error: 'deadline is required' });
  }

  try {
    const result = await pool.query(
      `UPDATE lesson_assignments SET deadline = $1 WHERE id = $2 RETURNING *`,
      [deadline, assignmentId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update assignment error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/assignments/:assignmentId - delete assignment
router.delete('/:assignmentId', auth, roleCheck(['admin', 'manager']), async (req, res) => {
  const { assignmentId } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM lesson_assignments WHERE id = $1 RETURNING id',
      [assignmentId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    res.json({ message: 'Assignment deleted successfully' });
  } catch (err) {
    console.error('Delete assignment error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
