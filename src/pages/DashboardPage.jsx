import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, CircularProgress } from '@mui/material';
import { Description, People, Storage, TrendingUp } from '@mui/icons-material';
import { dashboardApi } from '../api/client';

const statCards = [
  { key: 'totalDocuments', label: 'Documentos', icon: <Description />, color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
  { key: 'totalUsers', label: 'Usuarios', icon: <People />, color: '#06b6d4', bg: 'rgba(6,182,212,0.15)' },
  { key: 'totalStorageFormatted', label: 'Almacenamiento', icon: <Storage />, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getStats()
      .then(({ data }) => setStats(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 0.5 }}>Dashboard</Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>Resumen general del sistema</Typography>

      <Grid container spacing={3}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={4} key={card.key}>
            <Card sx={{ position: 'relative', overflow: 'hidden' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: card.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
                    {card.icon}
                  </Box>
                  <TrendingUp sx={{ color: '#22c55e', fontSize: 20 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: card.color }}>
                  {stats?.[card.key] ?? 0}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>{card.label}</Typography>
              </CardContent>
              <Box sx={{
                position: 'absolute', top: -20, right: -20, width: 120, height: 120,
                borderRadius: '50%', bgcolor: card.bg, opacity: 0.5,
              }} />
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
