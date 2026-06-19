import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';

import { getMyTrips, startLead } from './MyTrips/api';
import TripsList from './MyTrips/components/TripsList';

const MyTrips = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [startingTripId, setStartingTripId] = useState(null);

    const fetchTrips = async (pageValue = page) => {
        try {
            setLoading(true);
            setError(null);

            const res = await getMyTrips({
                page: pageValue,
                per_page: 10,
            });

            setData(res);
        } catch (err) {
            setError(err?.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    async function handleStartLead(leadId) {
        try {
            setStartingTripId(leadId);
            setError(null);

            await startLead(leadId);
            await fetchTrips(page);

            return true;
        } catch (err) {
            setError(err?.response?.data || err.message);

            return false;
        } finally {
            setStartingTripId(null);
        }
    }

    useEffect(() => {
        fetchTrips(page);
    }, [page]);

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant='h5' sx={{ mb: 4 }}>
                Мои поездки
            </Typography>

            <Box>
                {loading && <CircularProgress />}

                {error && (
                    <Alert severity='error'>
                        {typeof error === 'string'
                            ? error
                            : JSON.stringify(error)}
                    </Alert>
                )}

                {!loading && !error && data && (
                    <TripsList
                        data={data}
                        page={page}
                        onChangePage={setPage}
                        onStartLead={handleStartLead}
                        startingTripId={startingTripId}
                    />
                )}
            </Box>
        </Box>
    );
};

export default MyTrips;
