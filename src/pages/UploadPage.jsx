import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { documentsApi } from '../api/client';
import {
  Box, Typography, TextField, Button, Card, CardContent, LinearProgress, MenuItem, Select,
  FormControl, InputLabel,
} from '@mui/material';
import { CloudUpload, CheckCircle, InsertDriveFile } from '@mui/icons-material';
import toast from 'react-hot-toast';

const CATEGORIES = ['Contrato', 'Factura', 'Reporte', 'Manual', 'Presentación', 'Otro'];

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);

  const onDrop = useCallback((accepted) => {
    if (accepted.length > 0) {
      setFile(accepted[0]);
      setSuccess(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 10 * 1024 * 1024,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'text/plain': ['.txt'],
    },
  });

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);
    if (category) formData.append('category', category);

    try {
      await documentsApi.upload(formData);
      setProgress(100);
      setSuccess(true);
      toast.success('Documento subido exitosamente');
      setTimeout(() => navigate('/documents'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al subir el archivo');
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 0.5 }}>Subir Documento</Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Arrastra un archivo o haz clic para seleccionar
      </Typography>

      {/* Dropzone */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : success ? '#22c55e' : 'rgba(148,163,184,0.3)',
              borderRadius: 3,
              p: 6,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              bgcolor: isDragActive ? 'rgba(99,102,241,0.05)' : 'transparent',
              '&:hover': { borderColor: 'primary.light', bgcolor: 'rgba(99,102,241,0.03)' },
            }}
          >
            <input {...getInputProps()} />
            {success ? (
              <CheckCircle sx={{ fontSize: 56, color: '#22c55e', mb: 2 }} />
            ) : (
              <CloudUpload sx={{ fontSize: 56, color: isDragActive ? '#6366f1' : '#475569', mb: 2 }} />
            )}
            <Typography variant="h6" sx={{ mb: 1, color: success ? '#22c55e' : 'text.primary' }}>
              {success ? 'Archivo subido exitosamente' : isDragActive ? 'Suelta el archivo aqui' : 'Arrastra tu archivo aqui'}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG, GIF, TXT - Max 10MB
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Selected file info */}
      {file && !success && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <InsertDriveFile sx={{ color: '#6366f1', fontSize: 32 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{file.name}</Typography>
                <Typography variant="caption" color="text.secondary">{formatSize(file.size)}</Typography>
              </Box>
              <Button size="small" color="error" onClick={() => setFile(null)}>Remover</Button>
            </Box>
            {uploading && <LinearProgress variant="determinate" value={progress} sx={{ borderRadius: 2 }} />}
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      {file && !success && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Metadata</Typography>
            <TextField fullWidth label="Descripcion (opcional)" value={description}
              onChange={(e) => setDescription(e.target.value)} sx={{ mb: 2 }} multiline rows={2} />
            <FormControl fullWidth>
              <InputLabel>Categoria</InputLabel>
              <Select value={category} label="Categoria" onChange={(e) => setCategory(e.target.value)}>
                <MenuItem value="">Sin categoria</MenuItem>
                {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {file && !success && (
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={() => navigate('/documents')}>Cancelar</Button>
          <Button variant="contained" onClick={handleUpload} disabled={uploading} startIcon={<CloudUpload />}>
            {uploading ? 'Subiendo...' : 'Subir Documento'}
          </Button>
        </Box>
      )}
    </Box>
  );
}
