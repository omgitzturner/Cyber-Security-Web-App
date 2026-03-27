import {
  Box, Typography, Chip, Divider, Button, Breadcrumbs,
  Paper, CircularProgress,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { NavigateNext, Timer, School } from '@mui/icons-material';

const TRACK_COLORS = {
  phishing: 'error',
  passwords: 'primary',
  data_protection: 'success',
  social_engineering: 'warning',
};

const TRACK_LABELS = {
  phishing: 'Phishing Awareness',
  passwords: 'Password Security',
  data_protection: 'Data Protection',
  social_engineering: 'Social Engineering',
};

export default function LessonViewer({ lesson, onStartQuiz, loading }) {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (!lesson) {
    return (
      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Typography color="text.secondary">Lesson not found.</Typography>
      </Box>
    );
  }

  const sections = lesson.content?.sections || [];

  return (
    <Box>
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 2 }}>
        <Link to="/dashboard" style={{ color: 'inherit', textDecoration: 'none' }}>
          Dashboard
        </Link>
        <Typography color="text.primary">{lesson.title}</Typography>
      </Breadcrumbs>

      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {lesson.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                icon={<School fontSize="small" />}
                label={TRACK_LABELS[lesson.track] || lesson.track}
                color={TRACK_COLORS[lesson.track] || 'default'}
                size="small"
              />
              {lesson.duration && (
                <Chip
                  icon={<Timer fontSize="small" />}
                  label={`${lesson.duration} min`}
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {sections.length > 0 ? (
          sections.map((section, idx) => (
            <Box key={idx} sx={{ mb: 3 }}>
              {section.title && (
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {section.title}
                </Typography>
              )}
              <Typography variant="body1" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {section.body || section.content || ''}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
            {lesson.content?.introduction || lesson.description || 'No content available.'}
          </Typography>
        )}

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            size="large"
            onClick={onStartQuiz}
            sx={{ fontWeight: 600, px: 4 }}
          >
            Start Quiz →
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
