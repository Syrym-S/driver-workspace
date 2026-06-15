import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const TripsItem = ({ trip }) => {
  const from = trip.from_location?.trim();
  const to = trip.to_location?.trim();
  const navigate = useNavigate();

  const isNew = trip.status === 'new';

  const hangleTrip = (id) => {
    navigate(`/trip/${id}`);
  }

  // console.log("Trip:", trip);

  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        borderRadius: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
      }}
    >
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography fontWeight={600}>
          ID: {trip.id} — {from} → {to} ({trip.currency})
        </Typography>

        <Button
          variant="contained"
          color={isNew ? 'error' : 'primary'}
          size="small"
          onClick={() => hangleTrip(trip.id)}
        >
          {isNew ? 'Начать' : 'Посмотреть'}
        </Button>
      </Box>

      {/* CUSTOMER */}
      <Typography variant="body2" color="text.secondary">
        {trip?.customer}
      </Typography>

      {/* CARGO */}
      <Box display="flex" flexWrap="wrap">
        <Chip
          label={`Вес: ${trip.cargo?.weight_kg || 0} кг`}
          sx={{ mt: 0.5, mr: 0.5 }}
        />

        <Chip
          label={`Тип: ${trip.cargo?.type}`}
          sx={{ mt: 0.5, mr: 0.5 }}
        />

        <Chip
          label={`Цена: ${trip.transportation_price} ${trip.currency}`}
          sx={{
            borderRadius: 2,
            px: 1.5,
            fontWeight: 600,
            mt: 0.5,
            mr: 0.5,
          }}
          color="primary"
        />
      </Box>
    </Paper>
  );
};

export default TripsItem;