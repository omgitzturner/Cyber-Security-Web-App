import { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Chip,
  CircularProgress, Alert, Paper,
} from '@mui/material';
import { EmojiEvents, Lock } from '@mui/icons-material';
import { leaderboardAPI } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

const BADGE_EMOJIS = {
  phishing: '🎣',
  passwords: '🔐',
  data_protection: '🛡️',
  social_engineering: '🎭',
  master: '🏆',
  default: '🏅',
};

export default function BadgeDisplay() {
  const { user } = useAuth();
  const [allBadges, setAllBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetchBadges = async () => {
      try {
        const [allRes, userRes] = await Promise.allSettled([
          leaderboardAPI.getAllBadges(),
          leaderboardAPI.getUserBadges(user.id),
        ]);
        if (allRes.status === 'fulfilled') setAllBadges(allRes.value.data || []);
        if (userRes.status === 'fulfilled') setUserBadges(userRes.value.data || []);
      } catch {
        setError('Failed to load badges.');
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, [user]);

  const earnedIds = new Set(userBadges.map((b) => b.badge_id || b.id));

  const getEarnedDate = (badgeId) => {
    const earned = userBadges.find((b) => (b.badge_id || b.id) === badgeId);
    return earned?.earned_at || earned?.created_at;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        <EmojiEvents sx={{ mr: 1, verticalAlign: 'middle', color: '#fb8c00' }} />
        My Badges
      </Typography>

      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ mb: 2 }}>
        <Chip
          label={`${earnedIds.size} / ${allBadges.length} badges earned`}
          color="primary"
          variant="outlined"
        />
      </Box>

      <Grid container spacing={2}>
        {allBadges.map((badge) => {
          const isEarned = earnedIds.has(badge.id);
          const earnedDate = getEarnedDate(badge.id);
          const isMaster = badge.name?.toLowerCase().includes('master');
          const emoji = BADGE_EMOJIS[badge.track] || (isMaster ? BADGE_EMOJIS.master : BADGE_EMOJIS.default);

          return (
            <Grid item xs={12} sm={6} md={4} key={badge.id}>
              <Card
                sx={{
                  opacity: isEarned ? 1 : 0.5,
                  border: isMaster && isEarned ? '2px solid #fb8c00' : '1px solid #e0e0e0',
                  bgcolor: isMaster && isEarned ? 'warning.50' : 'background.paper',
                  transition: 'all 0.2s',
                }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h2" sx={{ mb: 1 }}>
                    {isEarned ? emoji : <Lock sx={{ fontSize: 48, color: 'text.disabled' }} />}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {badge.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {badge.description}
                  </Typography>
                  {isEarned ? (
                    <Chip
                      label={earnedDate ? `Earned ${new Date(earnedDate).toLocaleDateString()}` : 'Earned'}
                      size="small"
                      color={isMaster ? 'warning' : 'success'}
                    />
                  ) : (
                    <Chip label="Locked" size="small" variant="outlined" />
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
        {allBadges.length === 0 && (
          <Grid item xs={12}>
            <Typography color="text.secondary" textAlign="center">
              No badges available yet.
            </Typography>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
}
