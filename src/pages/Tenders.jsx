import { useEffect, useState } from 'react';
import { Alert, Box, CircularProgress, Stack, Typography } from '@mui/material';
import { fetchDriverTenders } from './Tenders/api/tenders.api';
import { mapDriverTendersListFromApi } from './Tenders/model/tender.adapter';
import { TendersPagination } from './Tenders/components/TendersPagination';
import { TenderDetailsModal } from './Tenders/components/tender-details/TenderDetailsModal';
import { TenderCard } from './Tenders/components/TenderCard';

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

    useEffect(() => {
        let isMounted = true;

        async function loadTenders() {
            try {
                setIsLoading(true);
                setError('');

                const response = await fetchDriverTenders({
                    page,
                    limit: perPage,
                });

                if (!isMounted) {
                    return;
                }

                const mappedResponse = mapDriverTendersListFromApi(response);

                setTenders(mappedResponse.tenders);
                setCount(mappedResponse.count);
            } catch (loadError) {
                console.error(loadError);

                if (!isMounted) {
                    return;
                }

                setError(
                    loadError.response?.data?.message ||
                        loadError.message ||
                        'Не удалось загрузить тендеры',
                );
                setTenders([]);
                setCount(0);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadTenders();

        return () => {
            isMounted = false;
        };
    }, [page, perPage]);

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
