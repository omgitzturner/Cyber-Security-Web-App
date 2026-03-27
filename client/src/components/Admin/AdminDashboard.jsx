import { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Avatar,
  Button, CircularProgress, Alert, Paper, Chip,
} from '@mui/material';
import {
  People, School, TrendingUp, Assignment,
  PersonAdd, MenuBook,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { usersAPI, lessonsAPI, assignmentsAPI, progressAPI } from '../../services/api.js';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, lessons: 0, assignments: 0, avgCompletion: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, lessonsRes, assignRes] = await Promise.allSettled([
          usersAPI.getUsers(),
          lessonsAPI.getLessons(),
          assignmentsAPI.getAllAssignments(),
        ]);
        const users = usersRes.status === 'fulfilled' ? (usersRes.value.data || []) : [];
        const lessons = lessonsRes.status === 'fulfilled' ? (lessonsRes.value.data || []) : [];
        const assignments = assignRes.status === 'fulfilled' ? (assignRes.value.data || []) : [];

        setStats({
          users: users.length,
          lessons: lessons.length,
          assignments: assignments.length,
          avgCompletion: 0,
        });

        const recent = assignments
          .filter((a) => a.status === 'completed')
          .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
          .slice(0, 5);
        setRecentActivity(recent);
      } catch {
        setError('Failed to load admin stats.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { icon: <People />, label: 'Total Users', value: stats.users, color: '#1565c0' },
    { icon: <MenuBook />, label: 'Total Lessons', value: stats.lessons, color: '#43a047' },
    { icon: <Assignment />, label: 'Assignments', value: stats.assignments, color: '#fb8c00' },
    { icon: <TrendingUp />, label: 'Avg Completion', value: `${stats.avgCompletion}%`, color: '#9c27b0' },
  ];

  return (
    <Box>
      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {statCards.map(({ icon, label, value, color }) => (
              <Grid item xs={12} sm={6} md={3} key={label}>
                <Card sx={{ borderTop: `4px solid ${color}` }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ bgcolor: color, mx: 'auto', mb: 1 }}>{icon}</Avatar>
                    <Typography variant="h4" fontWeight={700}>{value}</Typography>
                    <Typography variant="body2" color="text.secondary">{label}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Recent Completions
                </Typography>
                {recentActivity.length === 0 ? (
                  <Typography color="text.secondary">No recent activity.</Typography>
                ) : (
                  recentActivity.map((a, idx) => (
                    <Box key={idx} sx={{ py: 1.5, borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">
                        {a.user_name || `User ${a.user_id}`} completed{' '}
                        <strong>{a.lesson_title || `Lesson ${a.lesson_id}`}</strong>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(a.updated_at || a.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  ))
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Button variant="outlined" startIcon={<PersonAdd />} fullWidth>
                    Create User
                  </Button>
                  <Button variant="outlined" startIcon={<Assignment />} fullWidth>
                    Assign Lesson
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<TrendingUp />}
                    fullWidth
                    component={Link}
                    to="/reports"
                  >
                    View Reports
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}
