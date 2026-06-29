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
            onClick={() => handleOpenTrip(trip.id)}
            sx={{
                p: {
                    xs: 2,
                    md: 3,
                },
                borderRadius: {
                    xs: 2.5,
                    md: 3,
                },
                display: 'flex',
                flexDirection: 'column',
                gap: {
                    xs: 1.75,
                    md: 2.5,
                },
                width: '100%',
                minWidth: 0,
                boxSizing: 'border-box',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                '&:hover': {
                    boxShadow: 3,
                },
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: {
                        xs: 1.5,
                        sm: 1,
                    },
                    minWidth: 0,
                }}
            >
                <Box
                    sx={{
                        width: '100%',
                        minWidth: 0,
                        display: 'grid',
                        gap: 0.75,
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: 12,
                            color: 'text.secondary',
                            lineHeight: 1.3,
                        }}
                    >
                        ID: {trip.id}
                    </Typography>

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                sm: 'auto minmax(0, 1fr)',
                            },
                            columnGap: 1,
                            rowGap: 0.25,
                            alignItems: 'baseline',
                            minWidth: 0,
                        }}
                    >
                        <Typography
                            component='span'
                            sx={{
                                fontSize: {
                                    xs: 12,
                                    sm: 13,
                                },
                                color: 'text.secondary',
                                flexShrink: 0,
                            }}
                        >
                            Откуда:
                        </Typography>

                        <Typography
                            component='span'
                            title={from}
                            sx={{
                                minWidth: 0,
                                fontSize: {
                                    xs: 13,
                                    sm: 14,
                                    md: 15,
                                },
                                lineHeight: 1.35,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                wordBreak: 'break-word',

                                display: {
                                    xs: '-webkit-box',
                                    sm: 'block',
                                },
                                WebkitLineClamp: {
                                    xs: 2,
                                    sm: 'unset',
                                },
                                WebkitBoxOrient: 'vertical',

                                whiteSpace: {
                                    xs: 'normal',
                                    sm: 'nowrap',
                                },
                            }}
                        >
                            {from}
                        </Typography>

                        <Typography
                            component='span'
                            sx={{
                                fontSize: {
                                    xs: 12,
                                    sm: 13,
                                },
                                color: 'text.secondary',
                                flexShrink: 0,
                            }}
                        >
                            Куда:
                        </Typography>

                        <Typography
                            component='span'
                            title={to}
                            sx={{
                                minWidth: 0,
                                fontSize: {
                                    xs: 13,
                                    sm: 14,
                                    md: 15,
                                },
                                lineHeight: 1.35,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                wordBreak: 'break-word',

                                display: {
                                    xs: '-webkit-box',
                                    sm: 'block',
                                },
                                WebkitLineClamp: {
                                    xs: 2,
                                    sm: 'unset',
                                },
                                WebkitBoxOrient: 'vertical',

                                whiteSpace: {
                                    xs: 'normal',
                                    sm: 'nowrap',
                                },
                            }}
                        >
                            {to}
                        </Typography>
                    </Box>

                    <Typography
                        sx={{
                            fontSize: 12,
                            color: 'text.secondary',
                            lineHeight: 1.3,
                        }}
                    >
                        Валюта: {trip.currency}
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        gap: 1,
                        flexShrink: 0,
                        width: {
                            xs: '100%',
                            sm: 'auto',
                        },
                        flexDirection: {
                            xs: 'column',
                            sm: 'row',
                        },
                    }}
                >
                    <Button
                        variant='outlined'
                        color='primary'
                        size='small'
                        onClick={(event) => {
                            event.stopPropagation();
                            handleOpenTrip(trip.id);
                        }}
                        sx={{
                            width: {
                                xs: '100%',
                                sm: 'auto',
                            },
                            whiteSpace: 'nowrap',
                            minWidth: {
                                xs: 0,
                                sm: 96,
                            },
                        }}
                    >
                        Посмотреть
                    </Button>

                    {canStartLead && (
                        <Button
                            variant='contained'
                            color='primary'
                            size='small'
                            onClick={(event) => {
                                event.stopPropagation();
                                handleStartLead();
                            }}
                            disabled={isStarting}
                            sx={{
                                width: {
                                    xs: '100%',
                                    sm: 'auto',
                                },
                                whiteSpace: 'nowrap',
                                minWidth: {
                                    xs: 0,
                                    sm: 132,
                                },
                            }}
                        >
                            {isStarting ? 'Отправляем...' : 'Водитель выехал'}
                        </Button>
                    )}
                </Box>
            </Box>

            <Typography
                variant='body2'
                color='text.secondary'
                sx={{
                    fontSize: {
                        xs: 13,
                        sm: 14,
                    },
                    wordBreak: 'break-word',
                }}
            >
                {trip?.customer}
            </Typography>

            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                    minWidth: 0,
                    '& .MuiChip-root': {
                        maxWidth: '100%',
                    },
                    '& .MuiChip-label': {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    },
                }}
            >
                <Chip label={`Статус: ${trip.status}`} />

                <Chip label={`Вес: ${trip.cargo?.weight_kg || 0} кг`} />

                <Chip label={`Тип: ${trip.cargo?.type}`} />

                <Chip
                    label={`Цена: ${trip.transportation_price} ${trip.currency}`}
                    color='primary'
                />
            </Box>
        </Paper>
    );
};

export default TripsItem;
