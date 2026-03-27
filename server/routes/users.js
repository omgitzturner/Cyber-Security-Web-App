const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// GET /api/users - list all users (admin only)
router.get('/', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, full_name, role, department, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('List users error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/departments/:dept/users - get users by department (admin/manager)
// Registered before /:id to avoid conflict
router.get('/departments/:dept/users', auth, roleCheck(['admin', 'manager']), async (req, res) => {
  const { dept } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, email, full_name, role, department, created_at FROM users WHERE department = $1 ORDER BY full_name',
      [dept]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get dept users error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/users - create new user (admin only)
router.post('/', auth, roleCheck(['admin']), async (req, res) => {
  const { email, password, full_name, role = 'employee', department } = req.body;

  if (!email || !password || !full_name) {
    return res.status(400).json({ error: 'email, password, and full_name are required' });
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role, department)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, full_name, role, department, created_at`,
      [email, password_hash, full_name, role, department || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/:id - get user by id (auth required)
router.get('/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, email, full_name, role, department, created_at FROM users WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/users/:id - update user (admin or self)
router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const isSelf = req.user.id === parseInt(id);
  const isAdmin = req.user.role === 'admin';

  if (!isSelf && !isAdmin) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { email, full_name, department, role, password } = req.body;

  try {
    const fields = [];
    const values = [];
    let idx = 1;

    if (email) { fields.push(`email = $${idx++}`); values.push(email); }
    if (full_name) { fields.push(`full_name = $${idx++}`); values.push(full_name); }
    if (department !== undefined) { fields.push(`department = $${idx++}`); values.push(department); }
    if (role && isAdmin) { fields.push(`role = $${idx++}`); values.push(role); }
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      fields.push(`password_hash = $${idx++}`);
      values.push(hash);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx}
       RETURNING id, email, full_name, role, department, created_at`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/users/:id - delete user (admin only)
router.delete('/:id', auth, roleCheck(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
