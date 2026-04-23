import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { documentsApi } from '../api/client';
import {
  Box, Typography, TextField, Button, IconButton, Chip, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
} from '@mui/material';
import {
  Search, CloudUpload, Download, Delete, Edit, Description,
  PictureAsPdf, Image as ImageIcon, TableChart, Article,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

const typeIcon = (ct) => {
  if (!ct) return <Description />;
  if (ct.includes('pdf')) return <PictureAsPdf sx={{ color: '#ef4444' }} />;
  if (ct.includes('image')) return <ImageIcon sx={{ color: '#22c55e' }} />;
  if (ct.includes('sheet') || ct.includes('excel')) return <TableChart sx={{ color: '#22c55e' }} />;
  if (ct.includes('word') || ct.includes('document')) return <Article sx={{ color: '#3b82f6' }} />;
  return <Description sx={{ color: '#94a3b8' }} />;
};

const formatSize = (bytes) => {
  if (!bytes) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export default function DocumentsPage() {
  const { hasAnyRole } = useAuth();
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });

  const loadDocs = useCallback(async () => {
    setLoading(true);
    try {
      const params = search
        ? { name: search, page, size }
        : { page, size, sortBy: 'createdAt', sortDir: 'desc' };
      const { data } = search
        ? await documentsApi.search(params)
        : await documentsApi.getAll(params);
      const result = data.data;
      setDocs(result.content || []);
      setTotal(result.totalElements || 0);
    } catch {
      toast.error('Error al cargar documentos');
    } finally {
      setLoading(false);
    }
  }, [page, size, search]);

  useEffect(() => { loadDocs(); }, [loadDocs]);

  const handleDownload = async (id, name) => {
    try {
      const { data } = await documentsApi.download(id);
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Descarga iniciada');
    } catch {
      toast.error('Error al descargar');
    }
  };

  const handleDelete = async () => {
    try {
      await documentsApi.delete(deleteDialog.id);
      toast.success('Documento eliminado');
      setDeleteDialog({ open: false, id: null, name: '' });
      loadDocs();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4">Documentos</Typography>
          <Typography color="text.secondary">{total} documentos en total</Typography>
        </Box>
        {hasAnyRole('ADMIN', 'EDITOR') && (
          <Button variant="contained" startIcon={<CloudUpload />} onClick={() => navigate('/documents/upload')}>
            Subir Archivo
          </Button>
        )}
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ py: 2 }}>
          <TextField fullWidth placeholder="Buscar por nombre..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search sx={{ color: '#64748b' }} /></InputAdornment>,
            }}
            size="small"
          />
        </CardContent>
      </Card>

      <Card>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : docs.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Description sx={{ fontSize: 64, color: '#475569', mb: 2 }} />
            <Typography color="text.secondary">No se encontraron documentos</Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Tamaño</TableCell>
                    <TableCell>Categoría</TableCell>
                    <TableCell>Subido por</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {docs.map((doc) => (
                    <TableRow key={doc.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          {typeIcon(doc.contentType)}
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>{doc.originalName}</Typography>
                            {doc.description && (
                              <Typography variant="caption" color="text.secondary">{doc.description}</Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={doc.contentType?.split('/').pop() || 'N/A'} size="small"
                          sx={{ bgcolor: 'rgba(99,102,241,0.1)', color: '#818cf8', fontSize: 11 }} />
                      </TableCell>
                      <TableCell>{formatSize(doc.fileSize)}</TableCell>
                      <TableCell>{doc.category || '-'}</TableCell>
                      <TableCell>{doc.uploadedBy}</TableCell>
                      <TableCell>{new Date(doc.createdAt).toLocaleDateString('es-MX')}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleDownload(doc.id, doc.originalName)}
                          sx={{ color: '#06b6d4' }}><Download fontSize="small" /></IconButton>
                        {hasAnyRole('ADMIN', 'EDITOR') && (
                          <IconButton size="small" sx={{ color: '#f59e0b' }}><Edit fontSize="small" /></IconButton>
                        )}
                        {hasAnyRole('ADMIN') && (
                          <IconButton size="small" sx={{ color: '#ef4444' }}
                            onClick={() => setDeleteDialog({ open: true, id: doc.id, name: doc.originalName })}>
                            <Delete fontSize="small" />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination component="div" count={total} page={page} onPageChange={(_, p) => setPage(p)}
              rowsPerPage={size} onRowsPerPageChange={(e) => { setSize(parseInt(e.target.value)); setPage(0); }}
              rowsPerPageOptions={[5, 10, 25]} labelRowsPerPage="Filas:" />
          </>
        )}
      </Card>

      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null, name: '' })}>
        <DialogTitle>Eliminar documento</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de eliminar "{deleteDialog.name}"?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null, name: '' })}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
