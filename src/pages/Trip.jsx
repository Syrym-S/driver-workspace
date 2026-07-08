import { Box, CircularProgress, Alert, Button } from '@mui/material';

import { useParams } from 'react-router-dom';

import { useEffect, useState, useCallback } from 'react';

import Map from './Trip/components/Map';
import Tool from './Trip/components/Tool';
import Info from './Trip/components/Info';
import Document from './Trip/components/Document';

import { getLeadInfo } from './Trip/api/api';

import { useApp } from '../app/context';

import {
    submitStartLoading,
    submitStartUnloading,
} from './Trip/api/cargo-action.api';
import { StartLoadingModal } from './Tenders/components/tender-details/StartLoadingModal';
import { StartUnloadingModal } from './Trip/components/StartUnloadingModal';
import { startLead } from './MyTrips/api';
import {
    notificationDomainEventNames,
    subscribeToNotificationDomainEvent,
} from '../components/notifications/model/notification-domain-events';

const GEO_TRACKING_STATUSES = new Set([
    'started',
    'start_driver',
    'start_loading',
    'verification_loading',
    'start_unloading',
    'verification_unloading',
]);

function shouldTrackGeo(status) {
    return GEO_TRACKING_STATUSES.has(String(status || '').toLowerCase());
}

const Trip = ({ activeId = null }) => {
    const { id: routeId } = useParams();
    const id = activeId ?? routeId;

    const { openLead, setOpenLead } = useApp();

    const [documentsRefreshKey, setDocumentsRefreshKey] = useState(0);
    const [isStartLoadingModalOpen, setIsStartLoadingModalOpen] =
        useState(false);
    const [isStartLoadingSubmitting, setIsStartLoadingSubmitting] =
        useState(false);
    const [startLoadingError, setStartLoadingError] = useState('');
    const [isStartUnloadingModalOpen, setIsStartUnloadingModalOpen] =
        useState(false);
    const [isStartUnloadingSubmitting, setIsStartUnloadingSubmitting] =
        useState(false);
    const [startUnloadingError, setStartUnloadingError] = useState('');
    const [isStartLeadSubmitting, setIsStartLeadSubmitting] = useState(false);
    const [startLeadError, setStartLeadError] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const fetchInfo = useCallback(
        async ({ withLoader = true, refreshDocuments = false } = {}) => {
            if (!id) {
                return;
            }

            try {
                if (withLoader) {
                    setLoading(true);
                }

                setError(false);

                const res = await getLeadInfo({
                    lead_id: id,
                });

                setOpenLead(res?.data || null);

                if (refreshDocuments) {
                    setDocumentsRefreshKey((prev) => prev + 1);
                }
            } catch (e) {
                console.error(e);
                setError(true);
            } finally {
                if (withLoader) {
                    setLoading(false);
                }
            }
        },
        [id, setOpenLead],
    );

    function normalizeStatus(status) {
        return String(status || '').toLowerCase();
    }

    const isNotificationAboutCurrentTrip = useCallback(
        (notification) => {
            const notificationLeadId =
                notification?.lead_id ||
                notification?.leadId ||
                notification?.lead?.id ||
                '';

            if (notificationLeadId) {
                return String(notificationLeadId) === String(id);
            }

            const link = String(notification?.link || '');

            if (link) {
                return link.includes(String(id));
            }

            return true;
        },
        [id],
    );

    async function handleStartLead() {
        if (!id) {
            return false;
        }

        try {
            setIsStartLeadSubmitting(true);
            setStartLeadError('');

            await startLead(id);

            await fetchInfo();

            return true;
        } catch (error) {
            setStartLeadError(
                error.response?.data?.message ||
                    error.message ||
                    'Не удалось отправить статус "Водитель выехал"',
            );

            return false;
        } finally {
            setIsStartLeadSubmitting(false);
        }
    }

    function handleOpenStartLoadingModal() {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        setStartLoadingError('');
        setIsStartLoadingModalOpen(true);
    }

    function handleCloseStartLoadingModal() {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        setIsStartLoadingModalOpen(false);
        setStartLoadingError('');
    }

    function handleOpenStartUnloadingModal() {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        setStartUnloadingError('');
        setIsStartUnloadingModalOpen(true);
    }

    function handleCloseStartUnloadingModal() {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        setIsStartUnloadingModalOpen(false);
        setStartUnloadingError('');
    }

    async function handleSubmitStartUnloading({ documents }) {
        const leadId = id;
        const leadStatus = normalizeStatus(openLead?.status);

        if (!leadId || !documents?.length) {
            return false;
        }

        try {
            setIsStartUnloadingSubmitting(true);
            setStartUnloadingError('');

            await submitStartUnloading({
                leadId,
                documents,
                shouldStartUnloading: leadStatus === 'verification_loading',
            });

            setDocumentsRefreshKey((prev) => prev + 1);

            await fetchInfo({
                withLoader: false,
                refreshDocuments: false,
            });

            setIsStartUnloadingModalOpen(false);

            return true;
        } catch (error) {
            setStartUnloadingError(
                error.response?.data?.message ||
                    error.message ||
                    'Не удалось подтвердить начало разгрузки',
            );

            return false;
        } finally {
            setIsStartUnloadingSubmitting(false);
        }
    }

    async function handleSubmitStartLoading({ documents }) {
        const leadId = id;
        const leadStatus = normalizeStatus(openLead?.status);

        if (!leadId || !documents?.length) {
            return false;
        }

        try {
            setIsStartLoadingSubmitting(true);
            setStartLoadingError('');

            await submitStartLoading({
                leadId,
                documents,
                shouldStartLoading: leadStatus === 'start_driver',
            });

            setDocumentsRefreshKey((prev) => prev + 1);

            await fetchInfo();

            setIsStartLoadingModalOpen(false);

            return true;
        } catch (error) {
            setStartLoadingError(
                error.response?.data?.message ||
                    error.message ||
                    'Не удалось подтвердить начало погрузки',
            );

            return false;
        } finally {
            setIsStartLoadingSubmitting(false);
        }
    }

    useEffect(() => {
        if (id) {
            fetchInfo({ withLoader: true });
        }

        return () => {
            setOpenLead(null);
        };
    }, [id, fetchInfo, setOpenLead]);

    useEffect(() => {
        if (!id) {
            return undefined;
        }

        function handleShippingChanged(event) {
            const notification = event.detail;

            if (!isNotificationAboutCurrentTrip(notification)) {
                return;
            }

            fetchInfo({
                withLoader: false,
                refreshDocuments: true,
            });
        }

        return subscribeToNotificationDomainEvent(
            notificationDomainEventNames.shippingChanged,
            handleShippingChanged,
        );
    }, [id, fetchInfo, isNotificationAboutCurrentTrip]);

    useEffect(() => {
        if (!id) {
            return undefined;
        }

        function handleLeadChanged(event) {
            const notification = event.detail;

            if (!isNotificationAboutCurrentTrip(notification)) {
                return;
            }

            fetchInfo({
                withLoader: false,
                refreshDocuments: false,
            });
        }

        return subscribeToNotificationDomainEvent(
            notificationDomainEventNames.leadsChanged,
            handleLeadChanged,
        );
    }, [id, fetchInfo, isNotificationAboutCurrentTrip]);

    // LOADING
    if (loading) {
        return (
            <Box
                display='flex'
                justifyContent='center'
                alignItems='center'
                minHeight='60vh'
            >
                <CircularProgress />
            </Box>
        );
    }

    // ERROR
    if (error) {
        return (
            <Box p={2}>
                <Alert
                    severity='error'
                    action={
                        <Button
                            color='inherit'
                            size='small'
                            onClick={fetchInfo}
                        >
                            Повторить
                        </Button>
                    }
                >
                    Не удалось загрузить информацию о рейсе.
                </Alert>
            </Box>
        );
    }

    return (
        <>
            <Box
                sx={{
                    p: 2,
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: '1fr',
                    '@media (min-width: 900px)': {
                        gridTemplateColumns:
                            'minmax(0, 2fr) minmax(300px, 380px)',
                        gridTemplateAreas: `
                        "map document"
                        "tool document"
                        "info document"
                    `,
                    },
                }}
            >
                {/* MAP */}
                <Box sx={{ gridArea: { md: 'map' } }}>
                    <Map tripId={id} />
                </Box>

                {/* TOOL */}
                <Box sx={{ gridArea: { md: 'tool' } }}>
                    <Tool
                        tripId={id}
                        isCargoActionLoading={
                            isStartLoadingSubmitting ||
                            isStartUnloadingSubmitting
                        }
                        isStartLeadLoading={isStartLeadSubmitting}
                        startLeadError={startLeadError}
                        onStartLead={handleStartLead}
                        onOpenStartLoading={handleOpenStartLoadingModal}
                        onOpenStartUnloading={handleOpenStartUnloadingModal}
                    />
                </Box>

                {/* INFO */}
                <Box sx={{ gridArea: { md: 'info' } }}>
                    <Info tripId={id} />
                </Box>

                {/* DOCUMENT */}
                <Box
                    sx={{
                        gridArea: { md: 'document' },
                        position: { md: 'sticky' },
                        top: 16,
                        height: 'fit-content',
                    }}
                >
                    <Document tripId={id} refreshKey={documentsRefreshKey} />
                </Box>
            </Box>

            <StartLoadingModal
                open={isStartLoadingModalOpen}
                isSubmitting={isStartLoadingSubmitting}
                error={startLoadingError}
                onClose={handleCloseStartLoadingModal}
                onSubmit={handleSubmitStartLoading}
            />

            <StartUnloadingModal
                open={isStartUnloadingModalOpen}
                isSubmitting={isStartUnloadingSubmitting}
                error={startUnloadingError}
                onClose={handleCloseStartUnloadingModal}
                onSubmit={handleSubmitStartUnloading}
            />
        </>
    );
};

export default Trip;
