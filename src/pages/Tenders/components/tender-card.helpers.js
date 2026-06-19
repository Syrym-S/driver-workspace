export const tenderStatusLabels = {
    new: 'Новый',
    active: 'Активный',
    closed: 'Закрыт',
    cancelled: 'Отменён',
};

export function normalizeStatus(status) {
    return String(status || '').toLowerCase();
}

export const tenderStatusStyles = {
    new: {
        borderColor: 'primary.main',
        color: 'primary.main',
        backgroundColor: 'rgba(33, 150, 243, 0.04)',
    },
    active: {
        borderColor: 'success.main',
        color: 'success.main',
        backgroundColor: 'rgba(46, 125, 50, 0.06)',
    },
    closed: {
        borderColor: 'grey.400',
        color: 'text.secondary',
        backgroundColor: 'grey.100',
    },
    cancelled: {
        borderColor: 'error.main',
        color: 'error.main',
        backgroundColor: 'rgba(211, 47, 47, 0.06)',
    },
};

export function hasValue(value) {
    return value !== null && value !== undefined && value !== '';
}

export function formatMoney(amount, currency = 'KZT') {
    if (!hasValue(amount)) {
        return 'Не указано';
    }

    return `${Number(amount).toLocaleString('ru-RU')} ${currency}`;
}

export function getDriverTenderPrice(tender) {
    const price =
        tender.transportation_price ??
        tender.lead?.transportation_price ??
        tender.forwarder?.transportation_price;

    const currency =
        tender.transportation_currency ||
        tender.lead?.transportation_currency ||
        tender.forwarder?.transportation_currency ||
        tender.currency ||
        'KZT';

    return formatMoney(price, currency);
}

export function getTimeLeft(endDateTime, status) {
    if (status === 'cancelled') return 'Отменён';
    if (status === 'closed') return 'Завершён';

    if (!endDateTime) return 'Не указано';

    const endDate = new Date(endDateTime);
    const endTime = endDate.getTime();

    if (Number.isNaN(endTime)) return 'Некорректная дата';

    const diffMs = endTime - Date.now();

    if (diffMs <= 0) return 'Завершён';

    const totalMinutes = Math.floor(diffMs / 1000 / 60);
    const days = Math.floor(totalMinutes / 60 / 24);
    const hours = Math.floor((totalMinutes - days * 24 * 60) / 60);
    const minutes = totalMinutes % 60;

    if (days > 0) {
        return `${days} д ${hours} ч`;
    }

    if (hours > 0) {
        return `${hours} ч ${minutes} мин`;
    }

    return `${minutes} мин`;
}
