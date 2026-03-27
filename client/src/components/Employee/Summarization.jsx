import { useState } from 'react';
import {
  Box, Typography, TextField, Button, Paper, Alert,
  LinearProgress, Chip,
} from '@mui/material';
import { Edit, CheckCircle } from '@mui/icons-material';
import { progressAPI } from '../../services/api.js';

const MIN_CHARS = 50;

export default function Summarization({ lesson, lessonId, userId, onComplete }) {
  const [summary, setSummary] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const prompt = lesson?.content?.summary_prompt || 'Write a brief summary of what you learned in this lesson.';
  const charCount = summary.length;
  const isValid = charCount >= MIN_CHARS;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    setError('');
    try {
      await progressAPI.submitSummary({ user_id: userId, lesson_id: lessonId, summary });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Edit sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h5" fontWeight={700}>
          Lesson Summary
        </Typography>
      </Box>

      <Box sx={{ bgcolor: 'primary.50', p: 2, borderRadius: 1, mb: 3, borderLeft: '4px solid', borderColor: 'primary.main' }}>
        <Typography variant="body1" color="text.secondary" fontStyle="italic">
          {prompt}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {submitted ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Summary Submitted!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Great work! You have completed the reading and quiz for this lesson.
          </Typography>
          <Button
            variant="contained"
            size="large"
            color="success"
            onClick={onComplete}
            sx={{ fontWeight: 600, px: 4 }}
          >
            Complete Lesson 🎉
          </Button>
        </Box>
      ) : (
        <>
          <TextField
            multiline
            rows={8}
            fullWidth
            placeholder="Write your summary here..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            sx={{ mb: 1 }}
            disabled={loading}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Chip
              label={`${charCount} characters`}
              size="small"
              color={isValid ? 'success' : 'default'}
              variant="outlined"
            />
            {!isValid && (
              <Typography variant="caption" color="text.secondary">
                Minimum {MIN_CHARS} characters required ({MIN_CHARS - charCount} more needed)
              </Typography>
            )}
          </Box>

          <LinearProgress
            variant="determinate"
            value={Math.min((charCount / MIN_CHARS) * 100, 100)}
            color={isValid ? 'success' : 'primary'}
            sx={{ height: 6, borderRadius: 3, mb: 3 }}
          />

          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={!isValid || loading}
            sx={{ fontWeight: 600 }}
          >
            {loading ? 'Submitting...' : 'Submit Summary'}
          </Button>
        </>
      )}
    </Paper>
  );
}
