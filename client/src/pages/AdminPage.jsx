import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Box, Tabs, Tab,
  IconButton, Menu, MenuItem, Divider,
} from '@mui/material';
import { AccountCircle, Logout } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext.jsx';
import AdminDashboard from '../components/Admin/AdminDashboard.jsx';
import UserManagement from '../components/Admin/UserManagement.jsx';
import LessonAssignment from '../components/Admin/LessonAssignment.jsx';
import TeamReports from '../components/Admin/TeamReports.jsx';

export default function AdminPage() {
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
          <Box component="img" src="/cybercy-logo.svg" alt="CyberCy" sx={{ height: 36, mr: 1.5 }} />
          <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
            CyberCy — Admin
          </Typography>
          <IconButton color="inherit" component={Link} to="/dashboard" sx={{ mr: 1 }}>
            <Typography variant="body2">Dashboard</Typography>
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
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ maxWidth: 1200, mx: 'auto', px: 2 }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Overview" />
          <Tab label="User Management" />
          <Tab label="Lesson Assignment" />
          <Tab label="Team Reports" />
        </Tabs>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        {tab === 0 && <AdminDashboard />}
        {tab === 1 && <UserManagement />}
        {tab === 2 && <LessonAssignment />}
        {tab === 3 && <TeamReports />}
      </Box>
    </Box>
  );
}
