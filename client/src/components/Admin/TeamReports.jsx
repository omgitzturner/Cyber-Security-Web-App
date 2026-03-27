import { useState, useEffect } from 'react';
import {
  Box, Typography, FormControl, InputLabel, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, CircularProgress, Alert, LinearProgress, Chip,
} from '@mui/material';
import { leaderboardAPI } from '../../services/api.js';

const DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];

export default function TeamReports() {
  const [department, setDepartment] = useState('Engineering');
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await leaderboardAPI.getTeamReport(department);
        setReport(res.data || []);
      } catch {
        setError('Failed to load team report.');
        setReport([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [department]);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Typography variant="h6" fontWeight={600}>Team Progress Report</Typography>
        <FormControl size="small" sx={{ minWidth: 180 }}>
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
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.100' }}>
              <TableRow>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell align="center"><strong>Assigned</strong></TableCell>
                <TableCell align="center"><strong>Completed</strong></TableCell>
                <TableCell><strong>Progress</strong></TableCell>
                <TableCell align="center"><strong>Avg Score</strong></TableCell>
                <TableCell align="center"><strong>Badges</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {report.map((row, idx) => {
                const assigned = row.lessons_assigned ?? row.total ?? 0;
                const completed = row.lessons_completed ?? row.completed ?? 0;
                const pct = assigned > 0 ? Math.round((completed / assigned) * 100) : 0;
                const avgScore = row.avg_quiz_score ?? row.avg_score ?? 0;
                const badges = row.badge_count ?? row.badges ?? 0;

                return (
                  <TableRow key={row.user_id || row.id || idx} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>{row.full_name || row.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{row.email}</Typography>
                    </TableCell>
                    <TableCell align="center">{assigned}</TableCell>
                    <TableCell align="center">{completed}</TableCell>
                    <TableCell sx={{ minWidth: 160 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={pct}
                          sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                          color={pct >= 80 ? 'success' : pct >= 50 ? 'warning' : 'error'}
                        />
                        <Typography variant="caption">{pct}%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${Math.round(avgScore)}%`}
                        size="small"
                        color={avgScore >= 80 ? 'success' : avgScore >= 60 ? 'warning' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="center">{badges} 🏅</TableCell>
                  </TableRow>
                );
              })}
              {report.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary">No data for this department.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
