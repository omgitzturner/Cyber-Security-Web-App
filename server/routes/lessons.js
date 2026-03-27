const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// GET /api/lessons - get all lessons (auth required)
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, track, duration_minutes, order_index FROM lessons ORDER BY track, order_index'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('List lessons error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/lessons/track/:track - get lessons by track (auth required)
// Must be before /:id
router.get('/track/:track', auth, async (req, res) => {
  const { track } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, title, track, duration_minutes, order_index FROM lessons WHERE track = $1 ORDER BY order_index',
      [track]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get lessons by track error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/lessons/:id - get full lesson with content (auth required)
router.get('/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, title, track, content, duration_minutes, order_index, created_at FROM lessons WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get lesson error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/lessons - create lesson (admin only)
router.post('/', auth, roleCheck(['admin']), async (req, res) => {
  const { title, track, content, duration_minutes, order_index } = req.body;

  if (!title || !track || !content) {
    return res.status(400).json({ error: 'title, track, and content are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO lessons (title, track, content, duration_minutes, order_index)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, title, track, duration_minutes, order_index, created_at`,
      [title, track, JSON.stringify(content), duration_minutes || null, order_index || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create lesson error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/lessons/:id - update lesson (admin only)
router.put('/:id', auth, roleCheck(['admin']), async (req, res) => {
  const { id } = req.params;
  const { title, track, content, duration_minutes, order_index } = req.body;

  try {
    const fields = [];
    const values = [];
    let idx = 1;

    if (title) { fields.push(`title = $${idx++}`); values.push(title); }
    if (track) { fields.push(`track = $${idx++}`); values.push(track); }
    if (content) { fields.push(`content = $${idx++}`); values.push(JSON.stringify(content)); }
    if (duration_minutes !== undefined) { fields.push(`duration_minutes = $${idx++}`); values.push(duration_minutes); }
    if (order_index !== undefined) { fields.push(`order_index = $${idx++}`); values.push(order_index); }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE lessons SET ${fields.join(', ')} WHERE id = $${idx}
       RETURNING id, title, track, duration_minutes, order_index, created_at`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update lesson error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
