import { useCallback, useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';

import { getMyTrips, startLead } from './MyTrips/api';
import TripsList from './MyTrips/components/TripsList';
import {
    notificationDomainEventNames,
    subscribeToNotificationDomainEvent,
} from '../components/notifications/model/notification-domain-events';

function normalizeStatus(status) {
    return String(status || '').toLowerCase();
}

function isDriverBusyTripStatus(status) {
    const normalizedStatus = normalizeStatus(status);

    return Boolean(
        normalizedStatus &&
        normalizedStatus !== 'add_driver' &&
        normalizedStatus !== 'finished',
    );
}

const MyTrips = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [startingTripId, setStartingTripId] = useState(null);

    const fetchTrips = useCallback(
        async (pageValue = page, { withLoader = true } = {}) => {
            try {
                if (withLoader) {
                    setLoading(true);
                }

                setError(null);

                const res = await getMyTrips({
                    page: pageValue,
                    per_page: 10,
                });

                setData(res);
            } catch (err) {
                setError(err?.response?.data || err.message);
            } finally {
                if (withLoader) {
                    setLoading(false);
                }
            }
        },
        [page],
    );

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
        fetchTrips(page, { withLoader: true });
    }, [fetchTrips, page]);

    useEffect(() => {
        const unsubscribeLeads = subscribeToNotificationDomainEvent(
            notificationDomainEventNames.leadsChanged,
            () => {
                fetchTrips(page, { withLoader: false });
            },
        );

        const unsubscribeShipping = subscribeToNotificationDomainEvent(
            notificationDomainEventNames.shippingChanged,
            () => {
                fetchTrips(page, { withLoader: false });
            },
        );

        return () => {
            unsubscribeLeads();
            unsubscribeShipping();
        };
    }, [fetchTrips, page]);

    const hasActiveTrip = Boolean(
        data?.results?.some((trip) => isDriverBusyTripStatus(trip.status)),
    );

    return (
        <Box
            sx={{
                width: '100%',
                boxSizing: 'border-box',
                p: {
                    xs: 1.5,
                    sm: 2,
                    md: 3,
                },
                overflow: 'hidden',
            }}
        >
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
                        hasActiveTrip={hasActiveTrip}
                    />
                )}
            </Box>
        </Box>
    );
};

export default MyTrips;
