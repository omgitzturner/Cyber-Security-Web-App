import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Box, IconButton, Menu,
  MenuItem, Divider, Tabs, Tab,
} from '@mui/material';
import { Security, AccountCircle, Logout } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext.jsx';
import TeamReports from '../components/Admin/TeamReports.jsx';
import Leaderboard from '../components/Employee/Leaderboard.jsx';

export default function ReportPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <Security sx={{ mr: 1.5 }} />
          <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
            Reports & Analytics
          </Typography>
          <IconButton color="inherit" component={Link} to="/dashboard" sx={{ mr: 1 }}>
            <Typography variant="body2">Dashboard</Typography>
          </IconButton>
          <IconButton color="inherit" component={Link} to="/admin" sx={{ mr: 1 }}>
            <Typography variant="body2">Admin</Typography>
          </IconButton>
          <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <AccountCircle />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled>
              <Typography variant="body2">{user?.full_name}</Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <Logout fontSize="small" sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ maxWidth: 1200, mx: 'auto', px: 2 }}>
          <Tab label="Team Reports" />
          <Tab label="Leaderboard" />
        </Tabs>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        {tab === 0 && <TeamReports />}
        {tab === 1 && <Leaderboard />}
      </Box>
    </Box>
  );
}
