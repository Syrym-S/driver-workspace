import { Box, Typography, Pagination } from '@mui/material';
import TripsItem from './TripsItem';

const TripsList = ({ data, page, onChangePage }) => {
    if (!data?.results?.length) {
        return <Typography>Нет поездок</Typography>;
    }

    const totalPages = Math.ceil(data.count / data.perPage);

    return (
        <Box display="flex" flexDirection="column" gap={2}>
            {data.results.map((trip) => (
                <TripsItem key={trip.id} trip={trip} />
            ))}

            {/* PAGINATION */}
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