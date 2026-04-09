import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Box, Grid, Card, CardContent,
  Button, LinearProgress, Chip, Avatar, IconButton, Menu,
  MenuItem, Divider, CircularProgress, Alert, Paper,
} from '@mui/material';
import {
  AccountCircle, Logout, School, EmojiEvents,
  CheckCircle, Assignment, TrendingUp,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext.jsx';
import { progressAPI, assignmentsAPI, leaderboardAPI } from '../../services/api.js';

const TRACK_META = {
  phishing: { label: 'Phishing Awareness', color: '#e53935' },
  passwords: { label: 'Password Security', color: '#1e88e5' },
  data_protection: { label: 'Data Protection', color: '#43a047' },
  social_engineering: { label: 'Social Engineering', color: '#fb8c00' },
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [badges, setBadges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [progressRes, assignRes, badgesRes, lbRes] = await Promise.allSettled([
          progressAPI.getUserProgress(user.id),
          assignmentsAPI.getAssignments(user.id),
          leaderboardAPI.getUserBadges(user.id),
          leaderboardAPI.getLeaderboard(),
        ]);
        if (progressRes.status === 'fulfilled') setProgress(progressRes.value.data || []);
        if (assignRes.status === 'fulfilled') setAssignments(assignRes.value.data || []);
        if (badgesRes.status === 'fulfilled') setBadges(badgesRes.value.data || []);
        if (lbRes.status === 'fulfilled') setLeaderboard(lbRes.value.data || []);
      } catch {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const completedLessons = progress.filter((p) => p.status === 'completed').length;
  const totalLessons = progress.length;
  const overallPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const trackStats = Object.keys(TRACK_META).map((track) => {
    const trackProgress = progress.filter((p) => p.track === track);
    const completed = trackProgress.filter((p) => p.status === 'completed').length;
    const total = trackProgress.length;
    return { track, completed, total, pct: total > 0 ? Math.round((completed / total) * 100) : 0 };
  });

  const myRank = leaderboard.findIndex((e) => e.user_id === user?.id || e.id === user?.id) + 1;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <Box component="img" src="/cybercy-logo.svg" alt="CyberCy" sx={{ height: 36, mr: 1.5 }} />
          <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
            CyberCy
          </Typography>
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <Button color="inherit" component={Link} to="/admin" sx={{ mr: 1 }}>
              Admin
            </Button>
          )}
          <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <AccountCircle />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled>
              <Typography variant="body2">{user?.full_name}</Typography>
            </MenuItem>
            <MenuItem disabled>
              <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <Logout fontSize="small" sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={700}>
            Welcome back, {user?.full_name?.split(' ')[0] || 'User'}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {user?.department} · {user?.role}
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <CircularProgress size={48} />
          </Box>
        ) : (
          <>
            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {[
                { icon: <School />, label: 'Total Lessons', value: totalLessons, color: '#1565c0' },
                { icon: <CheckCircle />, label: 'Completed', value: completedLessons, color: '#43a047' },
                { icon: <TrendingUp />, label: 'Overall Progress', value: `${overallPct}%`, color: '#fb8c00' },
                { icon: <EmojiEvents />, label: 'Badges Earned', value: badges.length, color: '#9c27b0' },
              ].map(({ icon, label, value, color }) => (
                <Grid item xs={12} sm={6} md={3} key={label}>
                  <Card sx={{ textAlign: 'center', p: 1, borderTop: `4px solid ${color}` }}>
                    <CardContent>
                      <Avatar sx={{ bgcolor: color, mx: 'auto', mb: 1 }}>{icon}</Avatar>
                      <Typography variant="h4" fontWeight={700}>{value}</Typography>
                      <Typography variant="body2" color="text.secondary">{label}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Track Progress */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Training Track Progress
              </Typography>
              <Grid container spacing={2}>
                {trackStats.map(({ track, completed, total, pct }) => (
                  <Grid item xs={12} sm={6} key={track}>
                    <Box sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={500}>
                          {TRACK_META[track].label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {completed}/{total} ({pct}%)
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          bgcolor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': { bgcolor: TRACK_META[track].color },
                        }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            <Grid container spacing={3}>
              {/* Assigned Lessons */}
              <Grid item xs={12} md={7}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    <Assignment sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Assigned Lessons
                  </Typography>
                  {assignments.length === 0 ? (
                    <Typography color="text.secondary">No assignments yet.</Typography>
                  ) : (
                    assignments.map((a) => {
                      const lessonProgress = progress.find((p) => p.lesson_id === a.lesson_id);
                      const isCompleted = lessonProgress?.status === 'completed';
                      return (
                        <Box
                          key={a.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            py: 1.5,
                            borderBottom: '1px solid #f0f0f0',
                          }}
                        >
                          <Box>
                            <Typography variant="body1" fontWeight={500}>
                              {a.lesson_title || a.lesson?.title || `Lesson ${a.lesson_id}`}
                            </Typography>
                            {a.due_date && (
                              <Typography variant="caption" color="text.secondary">
                                Due: {new Date(a.due_date).toLocaleDateString()}
                              </Typography>
                            )}
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {isCompleted ? (
                              <Chip label="Completed" color="success" size="small" />
                            ) : (
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => navigate(`/lesson/${a.lesson_id}`)}
                              >
                                {lessonProgress ? 'Continue' : 'Start'}
                              </Button>
                            )}
                          </Box>
                        </Box>
                      );
                    })
                  )}
                </Paper>
              </Grid>

              {/* Leaderboard Snapshot */}
              <Grid item xs={12} md={5}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    <EmojiEvents sx={{ mr: 1, verticalAlign: 'middle', color: '#fb8c00' }} />
                    Leaderboard
                  </Typography>
                  {myRank > 0 && (
                    <Chip
                      label={`Your Rank: #${myRank}`}
                      color="primary"
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  )}
                  {leaderboard.slice(0, 5).map((entry, idx) => {
                    const isMe = entry.user_id === user?.id || entry.id === user?.id;
                    return (
                      <Box
                        key={entry.user_id || entry.id || idx}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          py: 1,
                          px: isMe ? 1 : 0,
                          borderRadius: 1,
                          bgcolor: isMe ? 'primary.50' : 'transparent',
                          borderBottom: '1px solid #f0f0f0',
                        }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          sx={{ width: 28, color: idx === 0 ? '#fb8c00' : 'text.secondary' }}
                        >
                          #{idx + 1}
                        </Typography>
                        <Typography variant="body2" fontWeight={isMe ? 700 : 400} sx={{ flexGrow: 1 }}>
                          {entry.full_name || entry.name}
                          {isMe && ' (You)'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {entry.completion_percentage ?? entry.score ?? 0}%
                        </Typography>
                      </Box>
                    );
                  })}
                  {leaderboard.length === 0 && (
                    <Typography color="text.secondary">No leaderboard data yet.</Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </Box>
  );
}
