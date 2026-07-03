export const DRIVER_GEO_INACTIVE_STATUSES = new Set([
    'add_driver',
    'finished',
    'cancelled',
]);

export function normalizeLeadStatus(status) {
    return String(status || '')
        .trim()
        .toLowerCase();
}

export function shouldTrackDriverGeo(status) {
    const normalizedStatus = normalizeLeadStatus(status);

    return Boolean(
        normalizedStatus && !DRIVER_GEO_INACTIVE_STATUSES.has(normalizedStatus),
    );
}

export function getGeoWsToken(lead) {
    return (
        lead?.geows?.token ||
        lead?.geows?.add_token ||
        lead?.geows?.addToken ||
        lead?.geows?.session ||
        ''
    );
}

export function normalizeActiveLeadResponse(response) {
    return (
        response?.data?.lead ||
        response?.data?.data ||
        response?.data ||
        response?.lead ||
        response?.result ||
        response ||
        null
    );
}

export function getLeadId(lead) {
    return (
        lead?.id ||
        lead?._id ||
        lead?.lead_id ||
        lead?.leadId ||
        lead?.index ||
        ''
    );
}

export function getDriverGeoWsTokenFromResponse(response) {
    return response?.token || response?.data?.token || '';
}
