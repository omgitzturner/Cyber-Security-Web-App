import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Stepper, Step, StepLabel,
  FormGroup, FormControlLabel, Checkbox, Radio, RadioGroup,
  FormControl, FormLabel, Select, MenuItem, InputLabel,
  TextField, Alert, CircularProgress, Paper, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
} from '@mui/material';
import { lessonsAPI, usersAPI, assignmentsAPI } from '../../services/api.js';

const STEPS = ['Select Lessons', 'Choose Recipients', 'Set Deadline'];
const TRACKS = ['phishing', 'passwords', 'data_protection', 'social_engineering'];
const DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];

export default function LessonAssignment() {
  const [activeStep, setActiveStep] = useState(0);
  const [lessons, setLessons] = useState([]);
  const [users, setUsers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedLessons, setSelectedLessons] = useState([]);
  const [recipientType, setRecipientType] = useState('user');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lessonsRes, usersRes, assignRes] = await Promise.allSettled([
          lessonsAPI.getLessons(),
          usersAPI.getUsers(),
          assignmentsAPI.getAllAssignments(),
        ]);
        if (lessonsRes.status === 'fulfilled') setLessons(lessonsRes.value.data || []);
        if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data || []);
        if (assignRes.status === 'fulfilled') setAssignments(assignRes.value.data || []);
      } catch {
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleLesson = (id) => {
    setSelectedLessons((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (activeStep === 0 && selectedLessons.length === 0) {
      setError('Please select at least one lesson.');
      return;
    }
    if (activeStep === 1) {
      if (recipientType === 'user' && !selectedUser) {
        setError('Please select a user.');
        return;
      }
      if (recipientType === 'department' && !selectedDept) {
        setError('Please select a department.');
        return;
      }
    }
    setError('');
    setActiveStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    if (!deadline) {
      setError('Please select a deadline.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const recipientIds = recipientType === 'user'
        ? [selectedUser]
        : users.filter((u) => u.department === selectedDept).map((u) => u.id);

      await Promise.all(
        selectedLessons.flatMap((lessonId) =>
          recipientIds.map((userId) =>
            assignmentsAPI.createAssignment({ lesson_id: lessonId, user_id: userId, due_date: deadline })
          )
        )
      );

      setSuccess(`Successfully assigned ${selectedLessons.length} lesson(s) to ${recipientIds.length} user(s).`);
      setActiveStep(0);
      setSelectedLessons([]);
      setSelectedUser('');
      setSelectedDept('');
      setDeadline('');
      const res = await assignmentsAPI.getAllAssignments();
      setAssignments(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Assignment failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {STEPS.map((label) => (
            <Step key={label}><StepLabel>{label}</StepLabel></Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>Select Lessons to Assign</Typography>
            {TRACKS.map((track) => {
              const trackLessons = lessons.filter((l) => l.track === track);
              if (trackLessons.length === 0) return null;
              return (
                <Box key={track} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, textTransform: 'capitalize' }}>
                    {track.replace('_', ' ')}
                  </Typography>
                  <FormGroup>
                    {trackLessons.map((lesson) => (
                      <FormControlLabel
                        key={lesson.id}
                        control={
                          <Checkbox
                            checked={selectedLessons.includes(lesson.id)}
                            onChange={() => toggleLesson(lesson.id)}
                          />
                        }
                        label={`${lesson.title} (${lesson.duration || '?'} min)`}
                      />
                    ))}
                  </FormGroup>
                </Box>
              );
            })}
          </Box>
        )}

        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>Choose Recipients</Typography>
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormLabel>Assign to:</FormLabel>
              <RadioGroup value={recipientType} onChange={(e) => setRecipientType(e.target.value)}>
                <FormControlLabel value="user" control={<Radio />} label="Specific User" />
                <FormControlLabel value="department" control={<Radio />} label="Entire Department" />
              </RadioGroup>
            </FormControl>

            {recipientType === 'user' ? (
              <FormControl fullWidth sx={{ mt: 1 }}>
                <InputLabel>Select User</InputLabel>
                <Select value={selectedUser} label="Select User" onChange={(e) => setSelectedUser(e.target.value)}>
                  {users.map((u) => (
                    <MenuItem key={u.id} value={u.id}>{u.full_name} ({u.email})</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <FormControl fullWidth sx={{ mt: 1 }}>
                <InputLabel>Select Department</InputLabel>
                <Select value={selectedDept} label="Select Department" onChange={(e) => setSelectedDept(e.target.value)}>
                  {DEPARTMENTS.map((d) => (
                    <MenuItem key={d} value={d}>{d}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        )}

        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>Set Deadline</Typography>
            <TextField
              label="Deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: new Date().toISOString().split('T')[0] }}
              fullWidth
              sx={{ maxWidth: 320 }}
            />
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>Summary:</Typography>
              <Typography variant="body2">Lessons: {selectedLessons.length} selected</Typography>
              <Typography variant="body2">
                Recipients: {recipientType === 'user' ? users.find((u) => u.id === selectedUser)?.full_name || '—' : `${selectedDept} department`}
              </Typography>
              <Typography variant="body2">Deadline: {deadline || '—'}</Typography>
            </Box>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
          {activeStep > 0 && (
            <Button variant="outlined" onClick={() => setActiveStep((s) => s - 1)}>Back</Button>
          )}
          {activeStep < STEPS.length - 1 ? (
            <Button variant="contained" onClick={handleNext}>Next</Button>
          ) : (
            <Button variant="contained" color="success" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Assigning...' : 'Assign Lessons'}
            </Button>
          )}
        </Box>
      </Paper>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" fontWeight={600} gutterBottom>Assignment History</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead sx={{ bgcolor: 'grey.100' }}>
            <TableRow>
              <TableCell><strong>Lesson</strong></TableCell>
              <TableCell><strong>User</strong></TableCell>
              <TableCell><strong>Due Date</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assignments.slice(0, 20).map((a) => (
              <TableRow key={a.id} hover>
                <TableCell>{a.lesson_title || `Lesson ${a.lesson_id}`}</TableCell>
                <TableCell>{a.user_name || `User ${a.user_id}`}</TableCell>
                <TableCell>{a.due_date ? new Date(a.due_date).toLocaleDateString() : '—'}</TableCell>
                <TableCell>
                  <Chip
                    label={a.status || 'pending'}
                    size="small"
                    color={a.status === 'completed' ? 'success' : a.status === 'in_progress' ? 'warning' : 'default'}
                  />
                </TableCell>
              </TableRow>
            ))}
            {assignments.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography color="text.secondary">No assignments yet.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
