export const NOTIFICATION_WS_MESSAGE_TYPES = {
    ERROR: 'error',
    NOTIFICATION: 'notification',
    NOTIFICATION_CREATED: 'notification.created',
    CREATED: 'created',
    PING: 'ping',
    PONG: 'pong',
};

const IS_NOTIFICATION_WS_DEBUG = false;

function debugNotificationWS(...args) {
    if (IS_NOTIFICATION_WS_DEBUG) {
        console.log(...args);
    }
}

export function connectNotificationWS({ wsUrl, token }) {
    if (!wsUrl) {
        throw new Error('Notification WS URL not configured');
    }

    if (!token) {
        throw new Error('Notification WS token missing');
    }

    const url = new URL(wsUrl);

    url.searchParams.set('token', token);

    return new WebSocket(url.toString());
}

function isAccessAllowedPayload(payload) {
    return String(payload?.message || '').toLowerCase() === 'access allowed';
}

export function bindNotificationWS(ws, handlers = {}) {
    const {
        onOpen,
        onClose,
        onError,
        onAuthFailed,
        onNotification,
        onMessage,
    } = handlers;

    ws.onopen = () => {
        debugNotificationWS('[NotificationWS opened]');
        onOpen?.();
    };

    ws.onerror = (event) => {
        console.error('[NotificationWS error]', event);
        onError?.(event);
    };

    ws.onclose = (event) => {
        debugNotificationWS('[NotificationWS closed]', event);
        onClose?.(event);
    };

    ws.onmessage = (event) => {
        let payload = null;

        try {
            payload = JSON.parse(event.data);
        } catch (error) {
            console.error('[NotificationWS parse error]', error);
            onError?.(error);
            return;
        }

        debugNotificationWS('[NotificationWS message]', payload);

        if (isAccessAllowedPayload(payload)) {
            onMessage?.(payload);
            return;
        }

        if (isAuthFailedPayload(payload)) {
            onAuthFailed?.(payload);
            return;
        }

        onMessage?.(payload);

        const notification = extractNotificationFromWsPayload(payload);

        if (notification) {
            onNotification?.(notification, payload);
        }
    };
}

function isAuthFailedPayload(payload) {
    if (!payload || payload.type !== NOTIFICATION_WS_MESSAGE_TYPES.ERROR) {
        return false;
    }

    const message = String(payload.message || '').toLowerCase();

    return (
        message.includes('auth') ||
        message.includes('token') ||
        message.includes('invalid') ||
        message.includes('unauthorized')
    );
}

export function extractNotificationFromWsPayload(payload) {
    if (!payload) {
        return null;
    }

    if (isNotificationPayload(payload)) {
        return normalizeWsNotification(payload);
    }

    if (
        payload.notification &&
        typeof payload.notification === 'object' &&
        isNotificationPayload(payload.notification)
    ) {
        return normalizeWsNotification(payload.notification);
    }

    if (
        payload.data &&
        typeof payload.data === 'object' &&
        isNotificationPayload(payload.data)
    ) {
        return normalizeWsNotification(payload.data);
    }

    if (
        payload.data?.notification &&
        typeof payload.data.notification === 'object' &&
        isNotificationPayload(payload.data.notification)
    ) {
        return normalizeWsNotification(payload.data.notification);
    }

    if (
        payload.result &&
        typeof payload.result === 'object' &&
        isNotificationPayload(payload.result)
    ) {
        return normalizeWsNotification(payload.result);
    }

    return null;
}

function isNotificationPayload(payload) {
    return Boolean(payload?.theme && payload?.message);
}

function normalizeWsNotification(notification) {
    const fallbackId = [
        notification.type,
        notification.link,
        notification.theme,
        notification.message,
    ]
        .filter(Boolean)
        .join('|');

    return {
        id: notification.id || fallbackId || Date.now(),
        theme: notification.theme,
        message: notification.message,
        link: notification.link || '',
        type: notification.type || '',
        queue: notification.queue || notification.source || '',
        is_viewed: false,
        created_at: notification.created_at || new Date().toISOString(),
        ...notification,
    };
}
