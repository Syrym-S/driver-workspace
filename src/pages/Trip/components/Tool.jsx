import {
  Alert,
  Button,
  Paper,
  Typography,
  Stack,
  CircularProgress,
} from '@mui/material';

import { useState } from 'react';

import { useApp } from '../../../app/context';

import {
  acceptLead,
  startLead,
} from '../api/api';

const Tool = ({ tripId }) => {
  const {
    openLead,
    setOpenLead,
  } = useApp();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleAccept = async () => {
    try {
      setLoading(true);
      setError(false);

      await acceptLead({
        lead_id: tripId,
      });

      setOpenLead((prev) => ({
        ...prev,
        status: 'accepted',
      }));

    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    try {
      setLoading(true);
      setError(false);

      await startLead({
        lead_id: tripId,
      });

      setOpenLead((prev) => ({
        ...prev,
        status: 'started',
      }));

    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 4,
      }}
    >
      <Typography
        variant="h6"
        fontWeight={700}
        mb={2}
      >
        Действия
      </Typography>

      <Stack spacing={2}>
        {/* ERROR */}
        {error && (
          <Alert severity="error">
            Не удалось выполнить действие.
            Попробуйте ещё раз.
          </Alert>
        )}

        {/* EMPTY */}
        {!openLead?.status && (
          <Alert severity="info">
            Для текущего рейса пока нет доступных действий.
          </Alert>
        )}

        {/* NEW */}
        {openLead?.status === 'new' && (
          <Button
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            onClick={handleAccept}
          >
            {loading
              ? <CircularProgress size={24} color="inherit" />
              : 'Принять рейс'}
          </Button>
        )}

        {/* ACCEPTED */}
        {openLead?.status === 'accepted' && (
          <Button
            variant="contained"
            color="success"
            size="large"
            disabled={loading}
            onClick={handleStart}
          >
            {loading
              ? <CircularProgress size={24} color="inherit" />
              : 'Начать поездку'}
          </Button>
        )}

        {/* STARTED */}
        {openLead?.status === 'started' && (
          <Alert severity="success">
            Поездка уже начата.
          </Alert>
        )}
      </Stack>
    </Paper>
  );
};

export default Tool;