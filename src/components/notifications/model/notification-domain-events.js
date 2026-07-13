const NOTIFICATION_DOMAIN_EVENTS = {
    lead: 'leads:changed',
    tender: 'tenders:changed',
    factor: 'factorings:changed',
    shipping: 'shipping:changed',
};

const NOTIFICATION_TYPE_ALIASES = {
    leads: 'lead',
    tenders: 'tender',

    factoring: 'factor',
    factorings: 'factor',

    cargo: 'shipping',
    shipment: 'shipping',
    shipments: 'shipping',
};

const IGNORED_NOTIFICATION_TYPES = new Set(['total']);

function normalizeNotificationType(type) {
    return String(type || '')
        .trim()
        .toLowerCase()
        .replaceAll('-', '_')
        .replaceAll(' ', '_');
}

function resolveNotificationDomainType(type) {
    const normalizedType = normalizeNotificationType(type);

    if (!normalizedType || IGNORED_NOTIFICATION_TYPES.has(normalizedType)) {
        return '';
    }

    const firstTypePart = normalizedType.split('.')[0];

    return (
        NOTIFICATION_DOMAIN_EVENTS[normalizedType] && normalizedType
    ) || (
        NOTIFICATION_DOMAIN_EVENTS[firstTypePart] && firstTypePart
    ) || (
        NOTIFICATION_TYPE_ALIASES[normalizedType]
    ) || (
        NOTIFICATION_TYPE_ALIASES[firstTypePart]
    ) || '';
}

export function getNotificationDomainEventName(notification) {
    const possibleTypes = [
        notification?.type,
        notification?.queue,
        notification?.source,
        notification?.event,
        notification?.entity,
        notification?.domain,
    ];

    for (const possibleType of possibleTypes) {
        const domainType = resolveNotificationDomainType(possibleType);

        if (domainType && NOTIFICATION_DOMAIN_EVENTS[domainType]) {
            return NOTIFICATION_DOMAIN_EVENTS[domainType];
        }
    }

    return '';
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