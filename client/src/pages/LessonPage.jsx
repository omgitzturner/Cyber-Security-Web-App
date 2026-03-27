import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box, Typography, CircularProgress, Alert, Button,
  Paper, Chip,
} from '@mui/material';
import { CheckCircle, EmojiEvents } from '@mui/icons-material';
import { lessonsAPI, progressAPI } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import LessonViewer from '../components/Employee/LessonViewer.jsx';
import Quiz from '../components/Employee/Quiz.jsx';
import Summarization from '../components/Employee/Summarization.jsx';

const STAGES = { VIEWING: 'viewing', QUIZ: 'quiz', SUMMARY: 'summary', COMPLETED: 'completed' };

export default function LessonPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [stage, setStage] = useState(STAGES.VIEWING);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [earnedBadge, setEarnedBadge] = useState(null);
  const [quizScore, setQuizScore] = useState(null);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const [lessonRes, quizRes] = await Promise.allSettled([
          lessonsAPI.getLesson(id),
          progressAPI.getQuiz(id),
        ]);
        if (lessonRes.status === 'fulfilled') {
          setLesson(lessonRes.value.data);
        } else {
          setError('Lesson not found.');
        }
        if (quizRes.status === 'fulfilled') {
          setQuiz(quizRes.value.data);
        }
      } catch {
        setError('Failed to load lesson.');
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [id]);

  useEffect(() => {
    if (lesson && user) {
      progressAPI.startLesson(user.id, id).catch(() => {});
    }
  }, [lesson, user, id]);

  const handleStartQuiz = () => setStage(STAGES.QUIZ);

  const handleQuizPassed = async (score) => {
    setQuizScore(score);
    try {
      await progressAPI.submitQuiz({ user_id: user.id, lesson_id: id, score, passed: true });
    } catch {}
    setStage(STAGES.SUMMARY);
  };

  const handleComplete = async () => {
    try {
      const res = await progressAPI.completeLesson({ user_id: user.id, lesson_id: id });
      if (res.data?.badge) setEarnedBadge(res.data.badge);
    } catch {}
    setStage(STAGES.COMPLETED);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={56} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 8, p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button component={Link} to="/dashboard" variant="outlined">← Back to Dashboard</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
        {stage === STAGES.VIEWING && (
          <LessonViewer lesson={lesson} onStartQuiz={handleStartQuiz} loading={false} />
        )}

        {stage === STAGES.QUIZ && (
          <Box>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Quiz: {lesson?.title}
            </Typography>
            {quizScore !== null && (
              <Chip label={`Last score: ${quizScore}%`} color="primary" sx={{ mb: 2 }} />
            )}
            <Quiz
              quizData={quiz}
              lessonId={id}
              userId={user?.id}
              onPassed={handleQuizPassed}
              onFailed={() => {}}
            />
          </Box>
        )}

        {stage === STAGES.SUMMARY && (
          <Box>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Summarize: {lesson?.title}
            </Typography>
            <Summarization
              lesson={lesson}
              lessonId={id}
              userId={user?.id}
              onComplete={handleComplete}
            />
          </Box>
        )}

        {stage === STAGES.COMPLETED && (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Lesson Complete! 🎉
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              You have successfully completed <strong>{lesson?.title}</strong>.
            </Typography>
            {earnedBadge && (
              <Box sx={{ mb: 3, p: 2, bgcolor: 'warning.50', borderRadius: 2, display: 'inline-block' }}>
                <EmojiEvents sx={{ fontSize: 40, color: '#fb8c00', mb: 1 }} />
                <Typography variant="h6" fontWeight={600}>
                  Badge Earned: {earnedBadge.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {earnedBadge.description}
                </Typography>
              </Box>
            )}
            <Box>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/dashboard')}
                sx={{ mr: 2 }}
              >
                Back to Dashboard
              </Button>
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
