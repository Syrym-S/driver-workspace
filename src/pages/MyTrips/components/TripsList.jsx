import { Box, Typography, Pagination, useMediaQuery } from '@mui/material';
import TripsItem from './TripsItem';

const TripsList = ({
    data,
    page,
    onChangePage,
    onStartLead,
    startingTripId,
    hasActiveTrip,
}) => {
    const isSmallMobile = useMediaQuery('(max-width: 375px)');

    if (!data?.results?.length) {
        return <Typography>Нет поездок</Typography>;
    }

    const perPage = data.perPage || data.per_page || data.limit || 10;
    const totalPages = Math.max(1, Math.ceil((data.count || 0) / perPage));

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
                    mt: 3,
                    display: 'flex',
                    justifyContent: 'center',
                    width: '100%',
                    overflowX: 'auto',
                    pb: 0.5,
                }}
            >
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(event, value) => onChangePage(value)}
                    color='primary'
                    shape='rounded'
                    size={isSmallMobile ? 'small' : 'medium'}
                    siblingCount={isSmallMobile ? 0 : 1}
                    boundaryCount={1}
                />
            </Box>
        </Box>
    );
};

export default TripsList;
