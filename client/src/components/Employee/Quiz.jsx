import { useState } from 'react';
import {
  Box, Typography, Paper, Button, Radio, RadioGroup,
  FormControlLabel, FormControl, LinearProgress, Chip,
  Alert, Divider,
} from '@mui/material';
import { CheckCircle, Cancel, Replay } from '@mui/icons-material';

export default function Quiz({ quizData, lessonId, userId, onPassed, onFailed }) {
  const questions = quizData?.questions || [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);

  const handleAnswer = (value) => {
    setAnswers((prev) => ({ ...prev, [currentIdx]: value }));
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      const userAnswer = answers[idx];
      const correctAnswer = q.correct_answer ?? q.answer ?? q.correct;
      if (userAnswer !== undefined && String(userAnswer) === String(correctAnswer)) {
        correct++;
      }
    });
    const pct = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    setScore(pct);
    const didPass = pct >= 80;
    setPassed(didPass);
    setSubmitted(true);
    if (didPass && onPassed) onPassed(pct);
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentIdx(0);
    setSubmitted(false);
    setScore(0);
    setPassed(false);
    if (onFailed) onFailed();
  };

  if (questions.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No quiz questions available.</Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={onPassed}>
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
          const userAnswer = answers[idx];
          const correctAnswer = q.correct_answer ?? q.answer ?? q.correct;
          const isCorrect = String(userAnswer) === String(correctAnswer);
          return (
            <Box
              key={idx}
              sx={{
                mb: 2,
                p: 2,
                borderRadius: 1,
                bgcolor: isCorrect ? 'success.50' : 'error.50',
                border: `1px solid ${isCorrect ? '#a5d6a7' : '#ef9a9a'}`,
              }}
            >
              <Typography variant="body1" fontWeight={500} gutterBottom>
                Q{idx + 1}: {q.question}
              </Typography>
              <Typography variant="body2" color={isCorrect ? 'success.main' : 'error.main'}>
                Your answer: {userAnswer ?? 'Not answered'} {isCorrect ? '✓' : '✗'}
              </Typography>
              {!isCorrect && (
                <Typography variant="body2" color="success.main">
                  Correct answer: {String(correctAnswer)}
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
            <Button variant="contained" size="large" onClick={onPassed} sx={{ fontWeight: 600 }}>
              Continue to Summary →
            </Button>
          )}
        </Box>
      </Paper>
    );
  }

  const question = questions[currentIdx];
  const questionType = question.type || (question.options ? 'multiple_choice' : 'true_false');

  return (
    <Paper sx={{ p: 4 }}>
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
          value={answers[currentIdx] ?? ''}
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
                  bgcolor: answers[currentIdx] === 'true' ? 'primary.50' : 'transparent',
                }}
              />
              <FormControlLabel
                value="false"
                control={<Radio />}
                label="False"
                sx={{
                  mb: 1, p: 1, borderRadius: 1, border: '1px solid #e0e0e0',
                  bgcolor: answers[currentIdx] === 'false' ? 'primary.50' : 'transparent',
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
                  bgcolor: answers[currentIdx] === option ? 'primary.50' : 'transparent',
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
            disabled={answers[currentIdx] === undefined}
            sx={{ fontWeight: 600 }}
          >
            Submit Quiz
          </Button>
        )}
      </Box>
    </Paper>
  );
}
