import { useCallback, useEffect, useRef, useState } from 'react';
import { getActiveLead } from '../../../pages/Trip/api/api';
import {
    getDriverGeoWsTokenFromResponse,
    getLeadId,
    normalizeActiveLeadResponse,
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

export function GeoTrackingProvider({ children }) {
    const [activeLead, setActiveLead] = useState(null);

    const wsRef = useRef(null);
    const geoWatchRef = useRef(null);
    const lastPointRef = useRef(null);
    const currentTrackingLeadIdRef = useRef(null);
    const isClosedRef = useRef(false);

    const cleanupGeoConnection = useCallback(() => {
        if (geoWatchRef.current) {
            clearInterval(geoWatchRef.current);
            geoWatchRef.current = null;
        }

        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        lastPointRef.current = null;
        currentTrackingLeadIdRef.current = null;
    }, []);

    const sendCurrentGeoPoint = useCallback(async (ws) => {
        try {
            const pos = await getBrowserLocation();

            if (
                isClosedRef.current ||
                !ws ||
                ws.readyState !== WebSocket.OPEN
            ) {
                return;
            }

            const nextPoint = {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                altitude: pos.coords.altitude ?? 0,
            };

            const lastPoint = lastPointRef.current;

            if (lastPoint) {
                const samePoint =
                    lastPoint.latitude === nextPoint.latitude &&
                    lastPoint.longitude === nextPoint.longitude;

                if (samePoint) {
                    return;
                }
            }

            console.log('DriverGeoTracking send point:', nextPoint);

            const isSent = sendGeoPoint(ws, nextPoint);

            if (isSent !== false) {
                lastPointRef.current = nextPoint;
            }
        } catch (error) {
            if (error?.code === 1) {
                console.warn('Доступ к геолокации запрещён пользователем');

                if (geoWatchRef.current) {
                    clearInterval(geoWatchRef.current);
                    geoWatchRef.current = null;
                }

                return;
            }

            console.error('DriverGeoTracking geolocation error:', error);
        }
    }, []);

    const startGeoConnection = useCallback(
        async (leadId) => {
            try {
                const tokenResponse = await fetchLeadGeoWsToken(leadId);
                const token = getDriverGeoWsTokenFromResponse(tokenResponse);

                if (!token) {
                    console.warn('DriverGeoTracking token is missing:', {
                        leadId,
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

                cleanupGeoConnection();

                const ws = connectGeoWS({
                    wsUrl,
                    token,
                    userId,
                });

                wsRef.current = ws;
                currentTrackingLeadIdRef.current = String(leadId);

                bindGeoWS(ws, {
                    onOpen: () => {
                        console.log('DriverGeoTracking GeoWS connected');

                        sendCurrentGeoPoint(ws);

                        geoWatchRef.current = setInterval(() => {
                            sendCurrentGeoPoint(ws);
                        }, 5000);
                    },

                    onClose: () => {
                        console.log('DriverGeoTracking GeoWS closed');
                    },

                    onError: (error) => {
                        console.error('DriverGeoTracking GeoWS error:', error);
                    },

                    onAuthFailed: (payload) => {
                        console.error(
                            'DriverGeoTracking GeoWS auth failed:',
                            payload,
                        );
                    },
                });
            } catch (error) {
                console.error('Не удалось открыть DriverGeoTracking:', error);
                cleanupGeoConnection();
            }
        },
        [cleanupGeoConnection, sendCurrentGeoPoint],
    );

    const refreshTrackingState = useCallback(async () => {
        try {
            const activeLeadResponse = await getActiveLead();
            const lead = normalizeActiveLeadResponse(activeLeadResponse);

            const leadId = getLeadId(lead);
            const status = lead?.status;
            const shouldTrack = shouldTrackDriverGeo(status);

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

            if (
                currentTrackingLeadIdRef.current === String(leadId) &&
                wsRef.current
            ) {
                return;
            }

            await startGeoConnection(leadId);
        } catch (error) {
            console.warn(
                'DriverGeoTracking active lead not found, stop tracking',
                error,
            );

            setActiveLead(null);
            cleanupGeoConnection();
        }
    }, [cleanupGeoConnection, startGeoConnection]);

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
