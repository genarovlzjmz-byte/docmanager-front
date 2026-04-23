import { useState, useEffect } from 'react';
import { usersApi } from '../api/client';
import {
  Box, Typography, Button, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, FormControl, InputLabel, Select, MenuItem,
  Switch, FormControlLabel, CircularProgress,
} from '@mui/material';
import { Add, Edit, Delete, PersonOff, PersonOutline } from '@mui/icons-material';
import toast from 'react-hot-toast';

const ROLES = ['ADMIN', 'EDITOR', 'VIEWER'];
const roleColor = { ADMIN: 'error', EDITOR: 'primary', VIEWER: 'default' };

const emptyForm = { username: '', email: '', password: '', fullName: '', role: 'VIEWER' };

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, mode: 'create', id: null });
  const [form, setForm] = useState(emptyForm);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data } = await usersApi.getAll();
      setUsers(data.data || []);
    } catch { toast.error('Error al cargar usuarios'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadUsers(); }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setDialog({ open: true, mode: 'create', id: null });
  };

  const openEdit = (user) => {
    setForm({ username: user.username, email: user.email, fullName: user.fullName, role: user.role, password: '' });
    setDialog({ open: true, mode: 'edit', id: user.id });
  };

  const handleSave = async () => {
    try {
      if (dialog.mode === 'create') {
        await usersApi.create(form);
        toast.success('Usuario creado');
      } else {
        const { password, username, ...updateData } = form;
        await usersApi.update(dialog.id, updateData);
        toast.success('Usuario actualizado');
      }
      setDialog({ open: false, mode: 'create', id: null });
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar');
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await usersApi.update(user.id, { active: !user.active });
      toast.success(user.active ? 'Usuario desactivado' : 'Usuario activado');
      loadUsers();
    } catch { toast.error('Error al actualizar'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este usuario?')) return;
    try {
      await usersApi.delete(id);
      toast.success('Usuario eliminado');
      loadUsers();
    } catch { toast.error('Error al eliminar'); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4">Usuarios</Typography>
          <Typography color="text.secondary">Gestion de usuarios del sistema</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}>Nuevo Usuario</Button>
      </Box>

      <Card>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Usuario</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{u.username}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.fullName}</TableCell>
                    <TableCell><Chip label={u.role} size="small" color={roleColor[u.role]} /></TableCell>
                    <TableCell>
                      <Chip label={u.active ? 'Activo' : 'Inactivo'} size="small"
                        sx={{ bgcolor: u.active ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                          color: u.active ? '#22c55e' : '#ef4444' }} />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleToggleActive(u)} sx={{ color: u.active ? '#f59e0b' : '#22c55e' }}>
                        {u.active ? <PersonOff fontSize="small" /> : <PersonOutline fontSize="small" />}
                      </IconButton>
                      <IconButton size="small" onClick={() => openEdit(u)} sx={{ color: '#06b6d4' }}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(u.id)} sx={{ color: '#ef4444' }}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialog.open} onClose={() => setDialog({ ...dialog, open: false })} maxWidth="sm" fullWidth>
        <DialogTitle>{dialog.mode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'}</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <TextField fullWidth label="Username" value={form.username} disabled={dialog.mode === 'edit'}
            onChange={(e) => setForm({ ...form, username: e.target.value })} sx={{ mb: 2 }} />
          <TextField fullWidth label="Email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} sx={{ mb: 2 }} />
          <TextField fullWidth label="Nombre completo" value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })} sx={{ mb: 2 }} />
          {dialog.mode === 'create' && (
            <TextField fullWidth label="Password" type="password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} sx={{ mb: 2 }} />
          )}
          <FormControl fullWidth>
            <InputLabel>Rol</InputLabel>
            <Select value={form.role} label="Rol" onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ROLES.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog({ ...dialog, open: false })}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            {dialog.mode === 'create' ? 'Crear' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
