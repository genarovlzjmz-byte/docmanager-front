import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box, TextField, Button, Typography, Alert, CircularProgress, InputAdornment, IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, Lock, Person } from '@mui/icons-material';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      toast.success('Bienvenido!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciales invalidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0f172a', p: 4 }}>
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 6 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: 2.5, background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: '#fff' }}>DM</Box>
            <Typography sx={{ fontWeight: 800, fontSize: 22, color: '#f1f5f9' }}>DocManager</Typography>
          </Box>
          <Typography variant="h4" sx={{ color: '#f1f5f9', mb: 1 }}>Iniciar sesion</Typography>
          <Typography sx={{ color: '#94a3b8', mb: 4 }}>Ingresa tus credenciales para acceder al sistema</Typography>
          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField fullWidth label="Usuario" value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })} sx={{ mb: 2.5 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ color: '#64748b' }} /></InputAdornment> }} />
            <TextField fullWidth label="Contrasena" type={showPassword ? 'text' : 'password'}
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} sx={{ mb: 3 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#64748b' }} /></InputAdornment>,
                endAdornment: <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#64748b' }}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton></InputAdornment>,
              }} />
            <Button type="submit" fullWidth variant="contained" size="large"
              disabled={loading || !form.username || !form.password}
              sx={{ py: 1.5, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', fontSize: '1rem',
                '&:hover': { background: 'linear-gradient(135deg, #818cf8, #6366f1)' } }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Iniciar sesion'}
            </Button>
          </form>
          <Box sx={{ mt: 4, p: 2.5, bgcolor: 'rgba(99,102,241,0.08)', borderRadius: 2, border: '1px solid rgba(99,102,241,0.15)' }}>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block', mb: 1 }}>Usuarios de prueba:</Typography>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
              admin / admin123 - editor / editor123 - viewer / viewer123
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box sx={{ flex: 1, display: { xs: 'none', md: 'flex' },
        background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 50%, #22c55e 100%)',
        alignItems: 'center', justifyContent: 'center', p: 6, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', inset: 0, opacity: 0.1,
          backgroundImage: 'radial-gradient(circle at 25% 25%, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <Box sx={{ textAlign: 'center', zIndex: 1 }}>
          <Typography variant="h3" sx={{ color: '#fff', fontWeight: 800, mb: 2 }}>Gestion de Documentos</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, maxWidth: 400, mx: 'auto' }}>
            Sube, organiza y administra todos tus documentos de manera segura y eficiente.
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', gap: 3, justifyContent: 'center' }}>
            {['PDF', 'DOC', 'XLS', 'PPT'].map((ext) => (
              <Box key={ext} sx={{ width: 64, height: 64, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, color: '#fff', fontSize: 14 }}>{ext}</Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
