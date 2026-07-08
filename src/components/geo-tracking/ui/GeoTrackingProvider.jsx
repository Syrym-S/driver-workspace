import { useCallback, useEffect, useRef, useState } from 'react';
import { getActiveLead, getLeadInfo } from '../../../pages/Trip/api/api';
import {
    appendCachedGeoTrackingPoint,
    clearCachedGeoTrackingPoints,
    DRIVER_GEO_TRACKING_INTERVAL_MS,
    getDriverGeoWsTokenFromResponse,
    getGeoTrackingAngleDecision,
    getLeadId,
    isSameGeoTrackingPoint,
    isValidGeoTrackingPoint,
    normalizeActiveLeadResponse,
    normalizeGeoTrackingPoint,
    readCachedGeoTrackingPoints,
    shouldTrackDriverGeo,
} from '../model/geo-tracking.helpers';
import {
    bindGeoWS,
    connectGeoWS,
    fetchLeadGeoWsToken,
    getBrowserLocation,
    sendGeoPoint,
} from '../../../pages/Trip/api/geows';
import {
    notificationDomainEventNames,
    subscribeToNotificationDomainEvent,
} from '../../notifications/model/notification-domain-events';

function isWebSocketOpen(ws) {
    return ws?.readyState === WebSocket.OPEN;
}

function isWebSocketActive(ws) {
    return (
        ws?.readyState === WebSocket.OPEN ||
        ws?.readyState === WebSocket.CONNECTING
    );
}

function buildGeoPointFromPosition(position) {
    return normalizeGeoTrackingPoint({
        latitude: position?.coords?.latitude,
        longitude: position?.coords?.longitude,
        altitude: position?.coords?.altitude ?? 0,
    });
}

function isActiveLeadNotFoundError(error) {
    return (
        error?.response?.status === 404 ||
        error?.status === 404
    );
}

export function GeoTrackingProvider({ children }) {
    const [activeLead, setActiveLead] = useState(null);

    const wsRef = useRef(null);
    const geoWatchRef = useRef(null);
    const lastPointRef = useRef(null);
    const pendingPointRef = useRef(null);
    const skippedPointsCountRef = useRef(0);
    const currentTrackingLeadIdRef = useRef(null);
    const startingLeadIdRef = useRef(null);
    const isClosedRef = useRef(false);

    const stopGeoWatch = useCallback(() => {
        if (geoWatchRef.current) {
            clearInterval(geoWatchRef.current);
            geoWatchRef.current = null;
        }
    }, []);

    const cleanupGeoConnection = useCallback(() => {
        stopGeoWatch();

        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        lastPointRef.current = null;
        pendingPointRef.current = null;
        skippedPointsCountRef.current = 0;
        currentTrackingLeadIdRef.current = null;
        startingLeadIdRef.current = null;
    }, [stopGeoWatch]);

    const flushCachedGeoPoints = useCallback((ws, leadId) => {
        const normalizedLeadId = String(leadId || '');

        if (!normalizedLeadId || !isWebSocketOpen(ws)) {
            return false;
        }

        const cachedPoints = readCachedGeoTrackingPoints(normalizedLeadId);

        if (!cachedPoints.length) {
            return false;
        }

        for (const point of cachedPoints) {
            if (!isWebSocketOpen(ws)) {
                return false;
            }

            const isSent = sendGeoPoint(ws, point);

            if (isSent === false) {
                return false;
            }

            lastPointRef.current = point;
        }

        clearCachedGeoTrackingPoints(normalizedLeadId);
        pendingPointRef.current = null;
        skippedPointsCountRef.current = 0;

        return true;
    }, []);

    const resolvePointToCommit = useCallback((nextPoint) => {
        const normalizedNextPoint = normalizeGeoTrackingPoint(nextPoint);

        if (!normalizedNextPoint) {
            return null;
        }

        const lastPoint = lastPointRef.current;

        if (!lastPoint || !isValidGeoTrackingPoint(lastPoint)) {
            pendingPointRef.current = null;
            skippedPointsCountRef.current = 0;
            return normalizedNextPoint;
        }

        if (isSameGeoTrackingPoint(lastPoint, normalizedNextPoint)) {
            return null;
        }

        const pendingPoint = pendingPointRef.current;

        if (!pendingPoint || !isValidGeoTrackingPoint(pendingPoint)) {
            pendingPointRef.current = normalizedNextPoint;
            skippedPointsCountRef.current = 0;
            return null;
        }

        const decision = getGeoTrackingAngleDecision({
            previousPoint: lastPoint,
            candidatePoint: pendingPoint,
            nextPoint: normalizedNextPoint,
            skippedPointsCount: skippedPointsCountRef.current,
        });

        pendingPointRef.current = normalizedNextPoint;
        skippedPointsCountRef.current = decision.skippedPointsCount;

        if (!decision.shouldKeep) {
            return null;
        }

        return pendingPoint;
    }, []);

    const sendCurrentGeoPoint = useCallback(
        async (ws, leadId) => {
            const normalizedLeadId = String(leadId || '');

            if (!normalizedLeadId || isClosedRef.current) {
                return;
            }

            try {
                const pos = await getBrowserLocation();

                if (isClosedRef.current) {
                    return;
                }

                const nextPoint = buildGeoPointFromPosition(pos);
                const pointToCommit = resolvePointToCommit(nextPoint);

                if (!pointToCommit) {
                    return;
                }

                appendCachedGeoTrackingPoint(normalizedLeadId, pointToCommit);
                lastPointRef.current = pointToCommit;

                if (!isWebSocketOpen(ws)) {
                    return;
                }

                flushCachedGeoPoints(ws, normalizedLeadId);
            } catch (error) {
                if (error?.code === 1) {
                    console.warn('Доступ к геолокации запрещён пользователем');
                    stopGeoWatch();
                    return;
                }

                console.error('DriverGeoTracking geolocation error:', error);
            }
        },
        [flushCachedGeoPoints, resolvePointToCommit, stopGeoWatch],
    );

    const startGeoConnection = useCallback(
        async (leadId) => {
            const normalizedLeadId = String(leadId || '');

            if (!normalizedLeadId) {
                return;
            }

            if (startingLeadIdRef.current === normalizedLeadId) {
                return;
            }

            if (
                currentTrackingLeadIdRef.current === normalizedLeadId &&
                isWebSocketActive(wsRef.current)
            ) {
                return;
            }

            cleanupGeoConnection();
            startingLeadIdRef.current = normalizedLeadId;

            try {
                const tokenResponse =
                    await fetchLeadGeoWsToken(normalizedLeadId);
                const token = getDriverGeoWsTokenFromResponse(tokenResponse);

                if (
                    isClosedRef.current ||
                    startingLeadIdRef.current !== normalizedLeadId
                ) {
                    return;
                }

                if (!token) {
                    console.warn('DriverGeoTracking token is missing:', {
                        leadId: normalizedLeadId,
                        tokenResponse,
                    });

                    cleanupGeoConnection();
                    return;
                }

                const wsUrl = window.GeoWS_Config?.ws;
                const userId =
                    window.APP_DATA?.user_id ||
                    window.APP_DATA?.userId ||
                    window.GeoWS_Config?.user ||
                    window.GeoWS_Config?.user_id;

                if (!wsUrl || !userId) {
                    console.warn('DriverGeoTracking GeoWS config is missing:', {
                        hasWsUrl: Boolean(wsUrl),
                        hasUserId: Boolean(userId),
                    });

                    cleanupGeoConnection();
                    return;
                }

                if (
                    isClosedRef.current ||
                    startingLeadIdRef.current !== normalizedLeadId
                ) {
                    return;
                }

                const ws = connectGeoWS({
                    wsUrl,
                    token,
                    userId,
                });

                wsRef.current = ws;
                currentTrackingLeadIdRef.current = normalizedLeadId;
                startingLeadIdRef.current = null;

                bindGeoWS(ws, {
                    onOpen: () => {
                        console.log('DriverGeoTracking GeoWS connected');

                        const hasSentCachedPoints = flushCachedGeoPoints(
                            ws,
                            normalizedLeadId,
                        );

                        if (!hasSentCachedPoints) {
                            sendCurrentGeoPoint(ws, normalizedLeadId);
                        }

                        stopGeoWatch();

                        geoWatchRef.current = setInterval(() => {
                            sendCurrentGeoPoint(ws, normalizedLeadId);
                        }, DRIVER_GEO_TRACKING_INTERVAL_MS);
                    },

                    onClose: () => {
                        console.log('DriverGeoTracking GeoWS closed');
                        stopGeoWatch();
                    },

                    onError: (error) => {
                        console.error('DriverGeoTracking GeoWS error:', error);
                        stopGeoWatch();
                    },

                    onAuthFailed: (payload) => {
                        console.error(
                            'DriverGeoTracking GeoWS auth failed:',
                            payload,
                        );

                        stopGeoWatch();

                        if (isWebSocketActive(ws)) {
                            ws.close();
                        }
                    },
                });
            } catch (error) {
                console.error('Не удалось открыть DriverGeoTracking:', error);
                cleanupGeoConnection();
            } finally {
                if (startingLeadIdRef.current === normalizedLeadId) {
                    startingLeadIdRef.current = null;
                }
            }
        },
        [
            cleanupGeoConnection,
            flushCachedGeoPoints,
            sendCurrentGeoPoint,
            stopGeoWatch,
        ],
    );

    const resolveActualActiveLead = useCallback(async (activeLeadResponse) => {
        const activeLead = normalizeActiveLeadResponse(activeLeadResponse);
        const activeLeadId = getLeadId(activeLead);
        const activeStatus = activeLead?.status;

        if (!activeLeadId) {
            return {
                lead: activeLead,
                leadId: '',
                status: activeStatus,
                shouldTrack: false,
            };
        }

        if (shouldTrackDriverGeo(activeStatus)) {
            return {
                lead: activeLead,
                leadId: activeLeadId,
                status: activeStatus,
                shouldTrack: true,
            };
        }

        try {
            const leadInfoResponse = await getLeadInfo({
                lead_id: activeLeadId,
            });

            console.log(
                'DriverGeoTracking lead info raw response:',
                leadInfoResponse,
            );
            console.log(
                'DriverGeoTracking lead info response.data:',
                leadInfoResponse?.data,
            );

            console.log('DriverGeoTracking fallback request:', {
                activeLeadId,
                activeLead,
            });

            const detailedLead = normalizeActiveLeadResponse(leadInfoResponse);
            const detailedLeadId = getLeadId(detailedLead) || activeLeadId;
            const detailedStatus = detailedLead?.status || activeStatus;
            const shouldTrack = shouldTrackDriverGeo(detailedStatus);

            console.log('DriverGeoTracking status fallback:', {
                leadId: detailedLeadId,
                activeStatus,
                detailedStatus,
                shouldTrack,
            });

            return {
                lead: detailedLead || activeLead,
                leadId: detailedLeadId,
                status: detailedStatus,
                shouldTrack,
            };
        } catch (error) {
            console.warn('DriverGeoTracking status fallback failed:', error);

            return {
                lead: activeLead,
                leadId: activeLeadId,
                status: activeStatus,
                shouldTrack: false,
            };
        }
    }, []);

    const refreshTrackingState = useCallback(async () => {
        try {
            const activeLeadResponse = await getActiveLead();

            const { lead, leadId, status, shouldTrack } =
                await resolveActualActiveLead(activeLeadResponse);

            setActiveLead(lead);

            console.log('DriverGeoTracking refresh:', {
                leadId,
                status,
                shouldTrack,
            });

            if (!leadId || !shouldTrack) {
                cleanupGeoConnection();
                return;
            }

            const normalizedLeadId = String(leadId);

            if (
                currentTrackingLeadIdRef.current === normalizedLeadId &&
                isWebSocketActive(wsRef.current)
            ) {
                return;
            }

            if (startingLeadIdRef.current === normalizedLeadId) {
                return;
            }

            await startGeoConnection(leadId);
        } catch (error) {
            if (isActiveLeadNotFoundError(error)) {
                setActiveLead(null);
                cleanupGeoConnection();
                return;
            }

            console.warn(
                'DriverGeoTracking failed to refresh active lead, stop tracking',
                error,
            );

            setActiveLead(null);
            cleanupGeoConnection();
        }
    }, [cleanupGeoConnection, resolveActualActiveLead, startGeoConnection]);

    useEffect(() => {
        isClosedRef.current = false;

        refreshTrackingState();

        return () => {
            isClosedRef.current = true;
            cleanupGeoConnection();
        };
    }, [refreshTrackingState, cleanupGeoConnection]);

    useEffect(() => {
        const unsubscribeShipping = subscribeToNotificationDomainEvent(
            notificationDomainEventNames.shippingChanged,
            () => {
                refreshTrackingState();
            },
        );

        const unsubscribeLeads = subscribeToNotificationDomainEvent(
            notificationDomainEventNames.leadsChanged,
            () => {
                refreshTrackingState();
            },
        );

        return () => {
            unsubscribeShipping();
            unsubscribeLeads();
        };
    }, [refreshTrackingState]);

    return children;
}
