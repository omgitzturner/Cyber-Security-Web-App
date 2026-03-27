import { useState } from 'react';
import {
  Box, Typography, Paper, Button, Radio, RadioGroup,
  FormControlLabel, FormControl, LinearProgress, Chip,
  Alert, Divider, CircularProgress,
} from '@mui/material';
import { CheckCircle, Cancel, Replay } from '@mui/icons-material';
import { progressAPI } from '../../services/api.js';

export default function Quiz({ quizData, lessonId, userId, onPassed, onFailed }) {
  const questions = quizData?.questions || [];
  const [currentIdx, setCurrentIdx] = useState(0);
  // answers stored as index (int) for MC, boolean for T/F
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const handleAnswer = (value) => {
    const q = questions[currentIdx];
    const type = q.type || (q.options ? 'multiple_choice' : 'true_false');
    let parsed;
    if (type === 'true_false') {
      parsed = value === 'true';
    } else {
      // value is the option string; store index
      parsed = q.options ? q.options.indexOf(value) : parseInt(value, 10);
    }
    setAnswers((prev) => ({ ...prev, [currentIdx]: parsed }));
  };

  const handleSubmit = async () => {
    // Build answers array in order
    const answersArray = questions.map((_, idx) => (answers[idx] !== undefined ? answers[idx] : null));
    setSubmitting(true);
    setError('');
    try {
      const res = await progressAPI.submitQuiz(userId, lessonId, answersArray);
      const { score: backendScore, passed: backendPassed, results: backendResults } = res.data;
      setScore(backendScore);
      setPassed(backendPassed);
      setResults(backendResults || []);
      setSubmitted(true);
      if (backendPassed && onPassed) onPassed(backendScore);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentIdx(0);
    setSubmitted(false);
    setScore(0);
    setPassed(false);
    setResults([]);
    setError('');
    if (onFailed) onFailed();
  };

  if (questions.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No quiz questions available.</Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => onPassed && onPassed(100)}>
          Continue to Summary
        </Button>
      </Paper>
    );
  }

  if (submitted) {
    return (
      <Paper sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          {passed ? (
            <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 1 }} />
          ) : (
            <Cancel sx={{ fontSize: 64, color: 'error.main', mb: 1 }} />
          )}
          <Typography variant="h4" fontWeight={700}>
            {passed ? 'Quiz Passed! 🎉' : 'Quiz Failed'}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
            Score: {score}% ({passed ? 'Pass' : 'Need 80% to pass'})
          </Typography>
          <LinearProgress
            variant="determinate"
            value={score}
            color={passed ? 'success' : 'error'}
            sx={{ height: 12, borderRadius: 6, mt: 2, mx: 'auto', maxWidth: 300 }}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" fontWeight={600} gutterBottom>
          Answer Review
        </Typography>
        {questions.map((q, idx) => {
          const result = results[idx];
          const isCorrect = result?.correct ?? false;
          const correctAnswer = result?.correct_answer;
          const userAnswerRaw = answers[idx];
          const type = q.type || (q.options ? 'multiple_choice' : 'true_false');
          const userAnswerDisplay = type === 'true_false'
            ? (userAnswerRaw === true ? 'True' : userAnswerRaw === false ? 'False' : 'Not answered')
            : (q.options && userAnswerRaw !== null && userAnswerRaw !== undefined
                ? q.options[userAnswerRaw] ?? 'Not answered'
                : 'Not answered');
          const correctAnswerDisplay = type === 'true_false'
            ? (correctAnswer === true ? 'True' : 'False')
            : (q.options && correctAnswer !== null && correctAnswer !== undefined
                ? q.options[correctAnswer] ?? String(correctAnswer)
                : String(correctAnswer));
          return (
            <Box
              key={idx}
              sx={{
                mb: 2, p: 2, borderRadius: 1,
                bgcolor: isCorrect ? 'success.50' : 'error.50',
                border: `1px solid ${isCorrect ? '#a5d6a7' : '#ef9a9a'}`,
              }}
            >
              <Typography variant="body1" fontWeight={500} gutterBottom>
                Q{idx + 1}: {q.question}
              </Typography>
              <Typography variant="body2" color={isCorrect ? 'success.main' : 'error.main'}>
                Your answer: {userAnswerDisplay} {isCorrect ? '✓' : '✗'}
              </Typography>
              {!isCorrect && (
                <Typography variant="body2" color="success.main">
                  Correct answer: {correctAnswerDisplay}
                </Typography>
              )}
              {result?.explanation && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                  {result.explanation}
                </Typography>
              )}
            </Box>
          );
        })}

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
          {!passed && (
            <Button variant="outlined" startIcon={<Replay />} onClick={handleRetake}>
              Retake Quiz
            </Button>
          )}
          {passed && (
            <Button variant="contained" size="large" onClick={() => onPassed && onPassed(score)} sx={{ fontWeight: 600 }}>
              Continue to Summary →
            </Button>
          )}
        </Box>
      </Paper>
    );
  }

  const question = questions[currentIdx];
  const questionType = question.type || (question.options ? 'multiple_choice' : 'true_false');
  // Display value for radio group
  const currentAnswerRaw = answers[currentIdx];
  let currentDisplayValue = '';
  if (currentAnswerRaw !== undefined) {
    if (questionType === 'true_false') {
      currentDisplayValue = currentAnswerRaw === true ? 'true' : 'false';
    } else {
      currentDisplayValue = question.options ? (question.options[currentAnswerRaw] ?? '') : '';
    }
  }

  return (
    <Paper sx={{ p: 4 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Question {currentIdx + 1} of {questions.length}
          </Typography>
          <Chip
            label={questionType === 'true_false' ? 'True/False' : 'Multiple Choice'}
            size="small"
            variant="outlined"
          />
        </Box>
        <LinearProgress
          variant="determinate"
          value={((currentIdx + 1) / questions.length) * 100}
          sx={{ height: 6, borderRadius: 3 }}
        />
      </Box>

      <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
        {question.question}
      </Typography>

      <FormControl component="fieldset" fullWidth>
        <RadioGroup
          value={currentDisplayValue}
          onChange={(e) => handleAnswer(e.target.value)}
        >
          {questionType === 'true_false' ? (
            <>
              <FormControlLabel
                value="true"
                control={<Radio />}
                label="True"
                sx={{
                  mb: 1, p: 1, borderRadius: 1, border: '1px solid #e0e0e0',
                  bgcolor: currentDisplayValue === 'true' ? 'primary.50' : 'transparent',
                }}
              />
              <FormControlLabel
                value="false"
                control={<Radio />}
                label="False"
                sx={{
                  mb: 1, p: 1, borderRadius: 1, border: '1px solid #e0e0e0',
                  bgcolor: currentDisplayValue === 'false' ? 'primary.50' : 'transparent',
                }}
              />
            </>
          ) : (
            (question.options || []).map((option, i) => (
              <FormControlLabel
                key={i}
                value={option}
                control={<Radio />}
                label={option}
                sx={{
                  mb: 1, p: 1, borderRadius: 1, border: '1px solid #e0e0e0',
                  bgcolor: currentDisplayValue === option ? 'primary.50' : 'transparent',
                }}
              />
            ))
          )}
        </RadioGroup>
      </FormControl>

      {answers[currentIdx] === undefined && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Please select an answer before proceeding.
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="outlined"
          onClick={() => setCurrentIdx((i) => i - 1)}
          disabled={currentIdx === 0}
        >
          ← Previous
        </Button>
        {currentIdx < questions.length - 1 ? (
          <Button
            variant="contained"
            onClick={() => setCurrentIdx((i) => i + 1)}
            disabled={answers[currentIdx] === undefined}
          >
            Next →
          </Button>
        ) : (
          <Button
            variant="contained"
            color="success"
            onClick={handleSubmit}
            disabled={answers[currentIdx] === undefined || submitting}
            sx={{ fontWeight: 600 }}
          >
            {submitting ? <CircularProgress size={20} color="inherit" /> : 'Submit Quiz'}
          </Button>
        )}
      </Box>
    </Paper>
  );
}
