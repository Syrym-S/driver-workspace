import { create } from 'zustand';

export const REALTIME_NOTIFICATION_TOAST_OPEN_EVENT =
    'realtime-notification-toast:open';

function createNotificationId() {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function logNotification(notification) {
    const logPayload = {
        title: notification.title,
        message: notification.message,
        meta: notification.meta,
    };

    if (notification.type === 'error') {
        console.error('[notification:error]', logPayload);
        return;
    }

    if (notification.type === 'warning') {
        console.warn('[notification:warning]', logPayload);
        return;
    }

    console.log(`[notification:${notification.type}]`, logPayload);
}

export const useNotificationsStore = create((set) => ({
    notifications: [],

    addNotification: ({
        type = 'success',
        title = '',
        message,
        meta = null,
        autoCloseMs = 5000,
    }) => {
        const notification = {
            id: createNotificationId(),
            type,
            title,
            message,
            meta,
            autoCloseMs,
            createdAt: Date.now(),
        };

        logNotification(notification);

        set((state) => ({
            notifications: [notification, ...state.notifications],
        }));

        return notification.id;
    },

    removeNotification: (id) => {
        set((state) => ({
            notifications: state.notifications.filter(
                (notification) => notification.id !== id,
            ),
        }));
    },

    clearNotifications: () => {
        set({ notifications: [] });
    },
}));

export function notifyError(message, meta) {
    return useNotificationsStore.getState().addNotification({
        type: 'error',
        message,
        meta,
    });
}

export function notifyWarning(message, meta) {
    return useNotificationsStore.getState().addNotification({
        type: 'warning',
        message,
        meta,
    });
}

export function notifySuccess(message, meta) {
    return useNotificationsStore.getState().addNotification({
        type: 'success',
        message,
        meta,
    });
}

export function notifyRealtimeNotification(notification) {
    if (!notification?.message && !notification?.theme) {
        return null;
    }

    return useNotificationsStore.getState().addNotification({
        type: 'info',
        title: notification.theme || 'Новое уведомление',
        message: notification.message || 'У вас новое уведомление',
        autoCloseMs: 8000,
        meta: {
            source: 'realtime-notification',
            notification,
        },
    });
}
