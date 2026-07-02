import { Box, Typography, Pagination } from '@mui/material';
import TripsItem from './TripsItem';

const TripsList = ({
    data,
    page,
    onChangePage,
    onStartLead,
    startingTripId,
    hasActiveTrip,
}) => {
    if (!data?.results?.length) {
        return <Typography>Нет поездок</Typography>;
    }

    console.log('smth');

    const totalPages = Math.ceil(data.count / data.perPage);

    return (
        <Box
            sx={{
                width: '100%',
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: {
                    xs: 1.5,
                    md: 2,
                },
            }}
        >
            {data.results.map((trip) => (
                <TripsItem
                    key={trip.id}
                    trip={trip}
                    onStartLead={onStartLead}
                    isStarting={startingTripId === trip.id}
                    hasActiveTrip={hasActiveTrip}
                />
            ))}

            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mt: {
                        xs: 2,
                        md: 3,
                    },
                    width: '100%',
                    overflowX: 'auto',
                    pb: 0.5,
                }}
            >
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, value) => onChangePage(value)}
                    size='small'
                />
            </Box>
        </Box>
    );
};

export default TripsList;
