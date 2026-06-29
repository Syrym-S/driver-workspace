import { useEffect, useState } from 'react';
import {
    Alert,
    Box,
    CircularProgress,
    Dialog,
    DialogContent,
} from '@mui/material';

import { TenderDetailsActions } from './TenderDetailsActions';
import { TenderDetailsContent } from './TenderDetailsContent';
import { TenderDetailsHeader } from './TenderDetailsHeader';
import { TenderDetailsMap } from './TenderDetailsMap';
import {
    cancelDriverTenderBet,
    createDriverTenderBet,
    fetchDriverTenderById,
} from '../../api/tenders.api';
import { mapDriverTenderFromApi } from '../../model/tender.adapter';
import {
    buildPreviewRoutePointsFromLead,
    decodeRoutePolyline,
    getEncodedPolylineFromRoute,
    getRoutesFromGeneratedRoute,
} from './tender-route.helpers';
import { generateTenderRoute } from '../../api/routing.api';

export function TenderDetailsModal({ open, tender, onClose }) {
    const [route, setRoute] = useState(null);
    const [routePoints, setRoutePoints] = useState([]);
    const [isRouteLoading, setIsRouteLoading] = useState(false);

    const [openTenderDetails, setOpenTenderDetails] = useState(tender);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState('');
    const [actionError, setActionError] = useState('');
    const [isActionLoading, setIsActionLoading] = useState(false);

    function handleClose() {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        setRoute(null);
        setRoutePoints([]);
        setIsRouteLoading(false);
        setOpenTenderDetails(null);
        setDetailsError('');
        setActionError('');

        onClose?.();
    }

    async function handleCreateBet({ amount, currency, comment }) {
        if (!openTenderDetails?.id) {
            return false;
        }

        try {
            setIsActionLoading(true);
            setActionError('');

            await createDriverTenderBet({
                tender_id: openTenderDetails.id,
                amount,
                currency,
                comment,
            });

            const response = await fetchDriverTenderById(openTenderDetails.id);
            setOpenTenderDetails(mapDriverTenderFromApi(response));

            return true;
        } catch (error) {
            setActionError(
                error.response?.data?.message ||
                    error.message ||
                    'Не удалось поставить ставку',
            );

            return false;
        } finally {
            setIsActionLoading(false);
        }
    }

    async function handleCancelBet(betIndex) {
        if (
            !openTenderDetails?.id ||
            betIndex === null ||
            betIndex === undefined
        ) {
            return false;
        }

        try {
            setIsActionLoading(true);
            setActionError('');

            await cancelDriverTenderBet({
                tender_id: openTenderDetails.id,
                bet_index: betIndex,
            });

            const response = await fetchDriverTenderById(openTenderDetails.id);
            setOpenTenderDetails(mapDriverTenderFromApi(response));

            return true;
        } catch (error) {
            setActionError(
                error.response?.data?.message ||
                    error.message ||
                    'Не удалось отменить ставку',
            );

            return false;
        } finally {
            setIsActionLoading(false);
        }
    }

    useEffect(() => {
        let isMounted = true;

        async function loadTenderDetails() {
            if (!open || !tender?.id) {
                return;
            }

            try {
                setIsDetailsLoading(true);
                setDetailsError('');
                setActionError('');

                const response = await fetchDriverTenderById(tender.id);

                if (!isMounted) {
                    return;
                }

                setOpenTenderDetails(mapDriverTenderFromApi(response));
            } catch (error) {
                console.error(error);

                if (!isMounted) {
                    return;
                }

                setDetailsError(
                    error.response?.data?.message ||
                        error.message ||
                        'Не удалось загрузить детали тендера',
                );
            } finally {
                if (isMounted) {
                    setIsDetailsLoading(false);
                }
            }
        }

        loadTenderDetails();

        return () => {
            isMounted = false;
        };
    }, [open, tender?.id]);

    useEffect(() => {
        let isMounted = true;

        async function loadTenderRoute() {
            const lead = openTenderDetails?.lead;
            const tenderId = openTenderDetails?.id;

            if (!open || !tenderId || !lead?.id) {
                setRoute(null);
                setRoutePoints([]);
                setIsRouteLoading(false);
                return;
            }

            const fallbackRoutePoints = buildPreviewRoutePointsFromLead(lead);

            try {
                setIsRouteLoading(true);
                setRoute(null);
                setRoutePoints([]);

                const generatedRoute = await generateTenderRoute(tenderId);

                if (!isMounted || !generatedRoute) {
                    return;
                }

                const routes = getRoutesFromGeneratedRoute(generatedRoute);
                const mainRoute = routes[0];

                if (!mainRoute) {
                    setRoutePoints(fallbackRoutePoints);
                    return;
                }

                const encodedPolyline = getEncodedPolylineFromRoute(mainRoute);
                const decodedPoints = decodeRoutePolyline(encodedPolyline);

                if (!decodedPoints.length) {
                    setRoutePoints(fallbackRoutePoints);
                    return;
                }

                setRoute(mainRoute);
                setRoutePoints(decodedPoints);
            } catch (error) {
                console.error(
                    'Не удалось построить preview-маршрут тендера:',
                    error,
                );

                if (!isMounted) {
                    return;
                }

                setRoute(null);
                setRoutePoints(fallbackRoutePoints);
            } finally {
                if (isMounted) {
                    setIsRouteLoading(false);
                }
            }
        }

        loadTenderRoute();

        return () => {
            isMounted = false;
        };
    }, [open, openTenderDetails?.id, openTenderDetails?.lead]);

    const currentTender = openTenderDetails || tender;

    if (!currentTender) {
        return null;
    }

    const leadForMap = currentTender.lead;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth='md'
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 4,
                    },
                },
            }}
        >
            <TenderDetailsHeader tender={currentTender} />

            <DialogContent
                sx={{
                    px: {
                        xs: 1.5,
                        sm: 2,
                        md: 3,
                    },
                    overflowX: 'hidden',
                }}
            >
                {detailsError && (
                    <Alert severity='error' sx={{ mb: 2 }}>
                        {detailsError}
                    </Alert>
                )}

                {actionError && (
                    <Alert severity='error' sx={{ mb: 2 }}>
                        {actionError}
                    </Alert>
                )}

                {isDetailsLoading ? (
                    <Box
                        sx={{
                            py: 5,
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <CircularProgress size={32} />
                    </Box>
                ) : (
                    <>
                        {leadForMap && (
                            <TenderDetailsMap
                                lead={leadForMap}
                                route={route}
                                routePoints={routePoints}
                                isRouteLoading={isRouteLoading}
                            />
                        )}

                        <TenderDetailsContent
                            tender={currentTender}
                            isActionLoading={isActionLoading}
                            onCreateBet={handleCreateBet}
                            onCancelBet={handleCancelBet}
                        />
                    </>
                )}
            </DialogContent>

            <TenderDetailsActions
                tender={currentTender}
                isActionLoading={isActionLoading}
                onClose={handleClose}
            />
        </Dialog>
    );
}
