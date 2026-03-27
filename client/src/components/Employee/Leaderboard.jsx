import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Select, MenuItem, FormControl,
  InputLabel, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress, Chip, Alert,
} from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';
import { leaderboardAPI } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

const DEPARTMENTS = ['All', 'Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];

export default function Leaderboard() {
  const { user } = useAuth();
  const [department, setDepartment] = useState('All');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError('');
      try {
        const res = department === 'All'
          ? await leaderboardAPI.getLeaderboard()
          : await leaderboardAPI.getDeptLeaderboard(department);
        setEntries(res.data || []);
      } catch {
        setError('Failed to load leaderboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [department]);

  const getRankChip = (idx) => {
    if (idx === 0) return <Chip label="🥇 1st" color="warning" size="small" />;
    if (idx === 1) return <Chip label="🥈 2nd" size="small" />;
    if (idx === 2) return <Chip label="🥉 3rd" size="small" />;
    return <Typography variant="body2">#{idx + 1}</Typography>;
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          <EmojiEvents sx={{ mr: 1, verticalAlign: 'middle', color: '#fb8c00' }} />
          Leaderboard
        </Typography>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Department</InputLabel>
          <Select value={department} label="Department" onChange={(e) => setDepartment(e.target.value)}>
            {DEPARTMENTS.map((d) => (
              <MenuItem key={d} value={d}>{d}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Rank</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Department</strong></TableCell>
                <TableCell align="center"><strong>Completion %</strong></TableCell>
                <TableCell align="center"><strong>Badges</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map((entry, idx) => {
                const isMe = entry.user_id === user?.id || entry.id === user?.id;
                return (
                  <TableRow
                    key={entry.user_id || entry.id || idx}
                    sx={{
                      bgcolor: isMe ? 'primary.50' : 'transparent',
                      fontWeight: isMe ? 700 : 400,
                    }}
                  >
                    <TableCell>{getRankChip(idx)}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={isMe ? 700 : 400}>
                        {entry.full_name || entry.name}
                        {isMe && <Chip label="You" size="small" color="primary" sx={{ ml: 1 }} />}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {entry.department || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${entry.completion_percentage ?? entry.score ?? 0}%`}
                        size="small"
                        color={
                          (entry.completion_percentage ?? entry.score ?? 0) >= 80 ? 'success' :
                          (entry.completion_percentage ?? entry.score ?? 0) >= 50 ? 'warning' : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {entry.badge_count ?? entry.badges ?? 0} 🏅
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
              {entries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary">No entries found.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}
