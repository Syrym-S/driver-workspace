const NOTIFICATION_DOMAIN_EVENTS = {
    lead: 'leads:changed',
    tender: 'tenders:changed',
    factor: 'factorings:changed',
    shipping: 'shipping:changed',
};

const IGNORED_NOTIFICATION_TYPES = new Set(['total']);

function normalizeNotificationType(type) {
    return String(type || '')
        .trim()
        .toLowerCase();
}

export function getNotificationDomainEventName(notification) {
    const type = normalizeNotificationType(notification?.type);

    if (!type || IGNORED_NOTIFICATION_TYPES.has(type)) {
        return '';
    }

    return NOTIFICATION_DOMAIN_EVENTS[type] || '';
}

export function publishNotificationDomainEvent(notification) {
    const eventName = getNotificationDomainEventName(notification);

    if (!eventName) {
        return false;
    }

    window.dispatchEvent(
        new CustomEvent(eventName, {
            detail: notification,
        }),
    );

    return true;
}

export function subscribeToNotificationDomainEvent(eventName, handler) {
    if (!eventName || typeof handler !== 'function') {
        return () => {};
    }

    window.addEventListener(eventName, handler);

    return () => {
        window.removeEventListener(eventName, handler);
    };
}

export const notificationDomainEventNames = {
    leadsChanged: NOTIFICATION_DOMAIN_EVENTS.lead,
    tendersChanged: NOTIFICATION_DOMAIN_EVENTS.tender,
    factoringsChanged: NOTIFICATION_DOMAIN_EVENTS.factor,
    shippingChanged: NOTIFICATION_DOMAIN_EVENTS.shipping,
};
