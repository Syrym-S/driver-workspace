import { Box, CircularProgress, Alert, Button } from '@mui/material';

import { useParams } from 'react-router-dom';

import { useEffect, useState, useRef } from 'react';

import Map from './Trip/components/Map';
import Tool from './Trip/components/Tool';
import Info from './Trip/components/Info';
import Document from './Trip/components/Document';

import { getLeadInfo } from './Trip/api/api';

import { useApp } from '../app/context';

import { getBrowserLocation } from './Trip/api/geows';

import { connectGeoWS, bindGeoWS, sendGeoPoint } from './Trip/api/geows';
import {
    submitStartLoading,
    submitStartUnloading,
} from './Trip/api/cargo-action.api';
import { StartLoadingModal } from './Tenders/components/tender-details/StartLoadingModal';
import { StartUnloadingModal } from './Trip/components/StartUnloadingModal';

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
    const leadStatus = normalizeStatus(openLead?.status);

    const canStartLoading =
        leadStatus === 'start_driver' || leadStatus === 'start_loading';
    const canStartUnloading =
        leadStatus === 'verification_loading' ||
        leadStatus === 'start_unloading';

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const wsRef = useRef(null);
    const geoWatchRef = useRef(null);
    const lastPointRef = useRef(null);

    const fetchInfo = async () => {
        try {
            setLoading(true);
            setError(false);

            const res = await getLeadInfo({
                lead_id: id,
            });

            setOpenLead(res?.data || null);
        } catch (e) {
            console.error(e);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    function normalizeStatus(status) {
        return String(status || '').toLowerCase();
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

            await fetchInfo();

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
            fetchInfo();
        }

        return () => {
            setOpenLead(null);
        };
    }, [id]);

    useEffect(() => {
        if (openLead?.status !== 'started') {
            return;
        }

        const session = openLead?.geows?.session;

        const wsUrl = GeoWS_Config?.ws;

        const userId = GeoWS_Config?.user;

        if (!session || !wsUrl || !userId) {
            return;
        }

        const ws = connectGeoWS({
            wsUrl,
            token: session,
            userId,
        });

        wsRef.current = ws;

        bindGeoWS(ws, {
            onOpen: () => {
                console.log('GeoWS connected');
            },

            onClose: () => {
                console.log('GeoWS closed');
            },

            onError: (e) => {
                console.error(e);
            },
        });

        geoWatchRef.current = setInterval(async () => {
            try {
                const pos = await getBrowserLocation();

                // новые координаты
                const nextPoint = {
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                    altitude: pos.coords.altitude ?? 0,
                };

                // последние координаты
                const lastPoint = lastPointRef.current;

                // нет прошлой точки
                if (!lastPoint) {
                    sendGeoPoint(ws, nextPoint);

                    lastPointRef.current = nextPoint;

                    return;
                }

                // сравнение
                const samePoint =
                    lastPoint.latitude === nextPoint.latitude &&
                    lastPoint.longitude === nextPoint.longitude;

                // не отправляем дубль
                if (samePoint) {
                    return;
                }

                sendGeoPoint(ws, nextPoint);

                lastPointRef.current = nextPoint;
            } catch (e) {
                if (e?.code === 1) {
                    console.warn('Доступ к геолокации запрещён пользователем');

                    if (geoWatchRef.current) {
                        clearInterval(geoWatchRef.current);
                        geoWatchRef.current = null;
                    }

                    return;
                }

                console.error(e);
            }
        }, 5000);

        return () => {
            if (geoWatchRef.current) {
                clearInterval(geoWatchRef.current);
                geoWatchRef.current = null;
            }

            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }

            // очищаем последнюю точку
            lastPointRef.current = null;
        };
    }, [openLead?.status]);

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
                        gridTemplateColumns: '2fr 1fr',
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
