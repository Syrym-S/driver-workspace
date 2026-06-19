import { Box, Typography, Pagination } from '@mui/material';
import TripsItem from './TripsItem';

const TripsList = ({
    data,
    page,
    onChangePage,
    onStartLead,
    startingTripId,
}) => {
    if (!data?.results?.length) {
        return <Typography>Нет поездок</Typography>;
    }

    console.log('smth');

    const totalPages = Math.ceil(data.count / data.perPage);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
            }}
        >
            {data.results.map((trip) => (
                <TripsItem
                    key={trip.id}
                    trip={trip}
                    onStartLead={onStartLead}
                    isStarting={startingTripId === trip.id}
                />
            ))}

            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mt: 3,
                    width: '100%',
                }}
            >
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, value) => onChangePage(value)}
                />
            </Box>
        </Box>
    );
};

export default TripsList;
