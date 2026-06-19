import { Box, Typography, Paper, Chip, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function normalizeStatus(status) {
    return String(status || '').toLowerCase();
}

const TripsItem = ({ trip, onStartLead, isStarting = false }) => {
    const from = trip.from_location?.trim();
    const to = trip.to_location?.trim();
    const navigate = useNavigate();

    const status = normalizeStatus(trip.status);
    const canStartLead = status === 'add_driver';

    const handleOpenTrip = (id) => {
        navigate(`/trip/${id}`);
    };

    async function handleStartLead() {
        await onStartLead?.(trip.id);
    }

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
            <Box
                display='flex'
                justifyContent='space-between'
                alignItems='center'
            >
                <Typography fontWeight={600}>
                    ID: {trip.id} — {from} → {to} ({trip.currency})
                </Typography>

                {canStartLead ? (
                    <Button
                        variant='contained'
                        color='primary'
                        size='small'
                        onClick={handleStartLead}
                        disabled={isStarting}
                    >
                        {isStarting ? 'Отправляем...' : 'Водитель выехал'}
                    </Button>
                ) : (
                    <Button
                        variant='contained'
                        color='primary'
                        size='small'
                        onClick={() => handleOpenTrip(trip.id)}
                    >
                        Посмотреть
                    </Button>
                )}
            </Box>

            <Typography variant='body2' color='text.secondary'>
                {trip?.customer}
            </Typography>

            <Box display='flex' flexWrap='wrap'>
                <Chip
                    label={`Статус: ${trip.status}`}
                    sx={{ mt: 0.5, mr: 0.5 }}
                />

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
                    color='primary'
                />
            </Box>
        </Paper>
    );
};

export default TripsItem;
