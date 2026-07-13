import { isStaging } from '../../../api/client';
import { fetchNotificationWsTokenApi } from '../api/notifications-ws.api';
import { bindNotificationWS, connectNotificationWS } from './notifications-ws';

const NOTIFICATION_WS_BASE_URL = 'wss://notification.360logistics.kz';

const DEFAULT_NOTIFICATION_WS_URL = isStaging
    ? `${NOTIFICATION_WS_BASE_URL}/staging/socket`
    : `${NOTIFICATION_WS_BASE_URL}/socket`;

function getNotificationWsConfig() {
    const notificationConfig =
        window.NotificationWS_Config || window.NotifWS_Config || {};

    return {
        wsUrl: normalizeNotificationWsUrl(
            notificationConfig.ws ||
                notificationConfig.wsUrl ||
                notificationConfig.url ||
                DEFAULT_NOTIFICATION_WS_URL,
        ),
    };
}

function normalizeNotificationWsUrl(value) {
    if (!value) {
        return DEFAULT_NOTIFICATION_WS_URL;
    }

    const hasProtocol = /^wss?:\/\//i.test(value);
    const url = new URL(hasProtocol ? value : `wss://${value}`);

    if (!url.pathname || url.pathname === '/') {
        url.pathname = '/socket';
    }

    return url.toString();
}

function getErrorMessage(error, fallbackMessage) {
    return error?.response?.data?.message || error?.message || fallbackMessage;
}

export function isNotificationWsConfigured() {
    const { wsUrl } = getNotificationWsConfig();

    return Boolean(wsUrl);
}

function isFalsyTokenResponse(response) {
    return (
        !response ||
        response.success === false ||
        response.status === false ||
        response.error
    );
}

export function openNotificationWsConnection({
    onOpen,
    onClose,
    onError,
    onAuthFailed,
    onNotification,
    onMessage,
}) {
    const abortController = new AbortController();

    let ws = null;
    let isClosed = false;
    let reconnectTimerId = null;
    let reconnectAttempt = 0;

    function clearReconnectTimer() {
        if (reconnectTimerId) {
            clearTimeout(reconnectTimerId);
            reconnectTimerId = null;
        }
    }

    function scheduleReconnect() {
        if (isClosed) {
            return;
        }

        clearReconnectTimer();

        const delay = Math.min(1000 * 2 ** reconnectAttempt, 30000);

        reconnectAttempt += 1;

        reconnectTimerId = setTimeout(() => {
            start();
        }, delay);
    }

    async function start() {
        try {
            const { wsUrl } = getNotificationWsConfig();

            if (!wsUrl) {
                console.info('NotificationWS config is not available');
                return;
            }

            const tokenResponse = await fetchNotificationWsTokenApi({
                signal: abortController.signal,
            });

            if (isClosed) {
                return;
            }

            if (isFalsyTokenResponse(tokenResponse)) {
                throw new Error(
                    tokenResponse?.message ||
                        'Notification WS token endpoint returned error',
                );
            }

            if (!tokenResponse?.token) {
                throw new Error('Notification WS token was not returned');
            }

            ws = connectNotificationWS({
                wsUrl,
                token: tokenResponse.token,
            });

            bindNotificationWS(ws, {
                onOpen: () => {
                    reconnectAttempt = 0;

                    onOpen?.();
                },

                onClose: (event) => {
                    onClose?.(event);

                    if (!isClosed) {
                        scheduleReconnect();
                    }
                },

                onError: (event) => {
                    onError?.(event);
                },

                onAuthFailed: (payload) => {
                    onAuthFailed?.(payload);

                    if (!isClosed) {
                        ws?.close();
                    }
                },

                onMessage,

                onNotification,
            });
        } catch (error) {
            if (error.name === 'AbortError' || isClosed) {
                return;
            }

            const message = getErrorMessage(
                error,
                'Failed to open NotificationWS connection',
            );

            console.error(message, error);
            onError?.(error);

            scheduleReconnect();
        }
    }

    start();

    return {
        close() {
            isClosed = true;
            abortController.abort();
            clearReconnectTimer();

            if (
                ws &&
                (ws.readyState === WebSocket.OPEN ||
                    ws.readyState === WebSocket.CONNECTING)
            ) {
                ws.close();
            }

            ws = null;
        },
    };
}
