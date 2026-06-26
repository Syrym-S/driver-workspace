export function normalizeNotificationsResponse(response) {
    if (Array.isArray(response)) {
        return response;
    }

    if (Array.isArray(response?.results)) {
        return response.results;
    }

    if (Array.isArray(response?.data)) {
        return response.data;
    }

    if (Array.isArray(response?.data?.results)) {
        return response.data.results;
    }

    if (Array.isArray(response?.notifications)) {
        return response.notifications;
    }

    if (Array.isArray(response?.items)) {
        return response.items;
    }

    return [];
}

export function normalizeNotificationDetailsResponse(response) {
    if (!response) {
        return null;
    }

    if (response?.result && typeof response.result === 'object') {
        return response.result;
    }

    if (response?.data && typeof response.data === 'object') {
        return response.data;
    }

    if (response?.notification && typeof response.notification === 'object') {
        return response.notification;
    }

    return response;
}

export function getNotificationId(notification) {
    return notification?.id || '';
}

export function getNotificationTitle(notification) {
    return notification?.theme || 'Уведомление';
}

export function getNotificationDescription(notification) {
    return notification?.message || 'Нет описания';
}

export function getNotificationCreatedAt(notification) {
    return notification?.created_at || '';
}

export function getNotificationLink(notification) {
    return notification?.link || '';
}

export function isNotificationUnread(notification) {
    return notification?.is_viewed === false;
}

export function formatNotificationDate(value) {
    if (!value) {
        return 'Дата не указана';
    }

    let dateValue = value;

    if (typeof value === 'object') {
        dateValue = value.date || value.datetime || value.value || '';

        if (!dateValue) {
            return 'Дата не указана';
        }
    }

    const normalizedValue =
        typeof dateValue === 'string' ? dateValue.replace(' ', 'T') : dateValue;

    const date = new Date(normalizedValue);

    if (Number.isNaN(date.getTime())) {
        return String(dateValue || 'Дата не указана');
    }

    return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
