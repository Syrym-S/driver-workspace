import { useCallback, useEffect, useState } from 'react';
import { Alert, Box, CircularProgress, Stack, Typography } from '@mui/material';
import { fetchDriverTenders } from './Tenders/api/tenders.api';
import { mapDriverTendersListFromApi } from './Tenders/model/tender.adapter';
import { TendersPagination } from './Tenders/components/TendersPagination';
import { TenderDetailsModal } from './Tenders/components/tender-details/TenderDetailsModal';
import { TenderCard } from './Tenders/components/TenderCard';
import {
    notificationDomainEventNames,
    subscribeToNotificationDomainEvent,
} from '../components/notifications/model/notification-domain-events';

const PER_PAGE = 5;

export default function Tenders() {
    const [tenders, setTenders] = useState([]);
    const [page, setPage] = useState(1);
    const [perPage] = useState(PER_PAGE);
    const [count, setCount] = useState(0);

    const [openTender, setOpenTender] = useState(null);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const pagesCount = Math.max(1, Math.ceil(count / perPage));

    function handlePageChange(_, nextPage) {
        setPage(nextPage);
    }

    function handleOpenTender(tender) {
        setOpenTender(tender);
    }

    function handleCloseTender() {
        setOpenTender(null);
    }

    const loadTenders = useCallback(
        async (nextPage = page, { withLoader = true } = {}) => {
            try {
                if (withLoader) {
                    setIsLoading(true);
                }

                setError('');

                const response = await fetchDriverTenders({
                    page: nextPage,
                    limit: perPage,
                });

                const mappedResponse = mapDriverTendersListFromApi(response);

                setTenders(mappedResponse.tenders);
                setCount(mappedResponse.count);
                setPage(nextPage);
            } catch (loadError) {
                console.error(loadError);

                setError(
                    loadError.response?.data?.message ||
                        loadError.message ||
                        'Не удалось загрузить тендеры',
                );

                setTenders([]);
                setCount(0);
            } finally {
                if (withLoader) {
                    setIsLoading(false);
                }
            }
        },
        [page, perPage],
    );

    useEffect(() => {
        loadTenders(page, { withLoader: true });
    }, [loadTenders, page]);

    useEffect(() => {
        return subscribeToNotificationDomainEvent(
            notificationDomainEventNames.tendersChanged,
            () => {
                loadTenders(page, { withLoader: false });
            },
        );
    }, [loadTenders, page]);

    return (
        <Box
            sx={{
                maxWidth: 640,
                mx: 'auto',
                mt: 4,
            }}
        >
            {error && (
                <Alert severity='error' sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {isLoading && (
                <Box
                    sx={{
                        py: 4,
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <CircularProgress size={32} />
                </Box>
            )}

            {!isLoading && !error && tenders.length === 0 && (
                <Typography
                    color='text.secondary'
                    sx={{
                        py: 4,
                        textAlign: 'center',
                    }}
                >
                    Тендеры не найдены
                </Typography>
            )}

            {!isLoading && !error && tenders.length > 0 && (
                <>
                    <Stack spacing={2}>
                        {tenders.map((tender) => (
                            <TenderCard
                                key={tender.id}
                                tender={tender}
                                onOpen={handleOpenTender}
                            />
                        ))}
                    </Stack>

                    <TendersPagination
                        page={page}
                        count={pagesCount}
                        onChange={handlePageChange}
                    />
                </>
            )}

            <TenderDetailsModal
                open={Boolean(openTender)}
                tender={openTender}
                onClose={handleCloseTender}
            />
        </Box>
    );
}
