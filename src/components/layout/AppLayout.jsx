import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, IconButton, Avatar, Menu, MenuItem, Divider, Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon, Description as DocIcon, People as PeopleIcon,
  Menu as MenuIcon, Logout as LogoutIcon, ChevronLeft, CloudUpload,
} from '@mui/icons-material';

const DRAWER_WIDTH = 260;

const navItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: ['ADMIN', 'EDITOR', 'VIEWER'] },
  { label: 'Documentos', icon: <DocIcon />, path: '/documents', roles: ['ADMIN', 'EDITOR', 'VIEWER'] },
  { label: 'Subir Archivo', icon: <CloudUpload />, path: '/documents/upload', roles: ['ADMIN', 'EDITOR'] },
  { label: 'Usuarios', icon: <PeopleIcon />, path: '/users', roles: ['ADMIN'] },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleColor = { ADMIN: 'error', EDITOR: 'primary', VIEWER: 'default' };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar */}
      <Drawer
        variant="persistent"
        open={drawerOpen}
        sx={{
          width: drawerOpen ? DRAWER_WIDTH : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            transition: 'width 0.3s',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: 2,
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 14, color: '#fff',
            }}>
              DM
            </Box>
            <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 800 }}>
              DocManager
            </Typography>
          </Box>
          <IconButton onClick={() => setDrawerOpen(false)} size="small" sx={{ color: 'text.secondary' }}>
            <ChevronLeft />
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: 'rgba(148,163,184,0.1)' }} />

        <List sx={{ px: 1, mt: 1 }}>
          {navItems
            .filter((item) => item.roles.includes(user?.role))
            .map((item) => {
              const active = location.pathname === item.path;
              return (
                <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    sx={{
                      borderRadius: 2,
                      bgcolor: active ? 'rgba(99,102,241,0.15)' : 'transparent',
                      color: active ? 'primary.light' : 'text.secondary',
                      '&:hover': { bgcolor: 'rgba(99,102,241,0.1)' },
                    }}
                  >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 600 : 400 }} />
                  </ListItemButton>
                </ListItem>
              );
            })}
        </List>
      </Drawer>

      {/* Main content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'background.paper',
            borderBottom: '1px solid rgba(148,163,184,0.1)',
          }}
        >
          <Toolbar>
            {!drawerOpen && (
              <IconButton onClick={() => setDrawerOpen(true)} sx={{ mr: 2, color: 'text.primary' }}>
                <MenuIcon />
              </IconButton>
            )}
            <Box sx={{ flexGrow: 1 }} />
            <Chip label={user?.role} size="small" color={roleColor[user?.role] || 'default'} sx={{ mr: 2 }} />
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14, fontWeight: 700 }}>
                {user?.fullName?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{ sx: { minWidth: 200, mt: 1 } }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2">{user?.fullName}</Typography>
                <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
              </Box>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                Cerrar sesión
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 3, flexGrow: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
