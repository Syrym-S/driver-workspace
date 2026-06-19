import polyline from '@mapbox/polyline';

export function getRoutesFromGeneratedRoute(generatedRoute) {
    if (Array.isArray(generatedRoute?.routes)) {
        return generatedRoute.routes;
    }

    if (Array.isArray(generatedRoute?.data?.routes)) {
        return generatedRoute.data.routes;
    }

    return [];
}

export function getEncodedPolylineFromRoute(route) {
    return (
        route?.polyline?.encodedPolyline ||
        route?.polyline?.encoded_polyline ||
        route?.encodedPolyline ||
        ''
    );
}

export function decodeRoutePolyline(encodedPolyline) {
    if (!encodedPolyline) {
        return [];
    }

    return polyline.decode(encodedPolyline).map(([lat, lng]) => [lat, lng]);
}

function hasValue(value) {
    return value !== null && value !== undefined && value !== '';
}

function normalizeText(value) {
    return String(value ?? '').trim();
}

function getCoordinate(point, keys) {
    for (const key of keys) {
        if (!hasValue(point?.[key])) {
            continue;
        }

        const coordinate = Number(point[key]);

        if (!Number.isNaN(coordinate)) {
            return coordinate;
        }
    }

    return null;
}

function buildLocationText(location) {
    if (!location) {
        return '';
    }

    if (typeof location === 'string') {
        return normalizeText(location);
    }

    return Object.values(location)
        .filter((value) => {
            if (!hasValue(value)) {
                return false;
            }

            if (typeof value === 'object') {
                return false;
            }

            return normalizeText(value) !== '';
        })
        .map(normalizeText)
        .join(', ');
}

export function buildLeadRoutePayload(lead) {
    if (!lead?.id) {
        console.warn('Не хватает id лида для генерации маршрута:', lead);

        return null;
    }

    const route = lead?.raw?.route;

    const from = route?.from;
    const to = route?.to;

    const fromLat = getCoordinate(from, ['lat', 'latitude', 'from_lat']);
    const fromLon = getCoordinate(from, [
        'lng',
        'lon',
        'longitude',
        'from_lon',
    ]);
    const toLat = getCoordinate(to, ['lat', 'latitude', 'to_lat']);
    const toLon = getCoordinate(to, ['lng', 'lon', 'longitude', 'to_lon']);

    const hasCoordinates =
        hasValue(fromLat) &&
        hasValue(fromLon) &&
        hasValue(toLat) &&
        hasValue(toLon);

    if (hasCoordinates) {
        return {
            id: lead.id,
            lead_id: lead.id,
            from_lat: fromLat,
            from_lon: fromLon,
            to_lat: toLat,
            to_lon: toLon,
        };
    }

    const fromText =
        buildLocationText(from) || normalizeText(lead?.from_location);

    const toText = buildLocationText(to) || normalizeText(lead?.to_location);

    if (!fromText || !toText) {
        console.warn('Не хватает данных для генерации маршрута:', {
            id: lead.id,
            lead_id: lead.id,
            from,
            to,
            from_location: lead?.from_location,
            to_location: lead?.to_location,
        });

        return {
            id: lead.id,
            lead_id: lead.id,
        };
    }

    return {
        id: lead.id,
        lead_id: lead.id,
        from: fromText,
        to: toText,
    };
}

function getRouteLocationsFromLead(lead) {
    const route = lead?.raw?.route;

    return {
        from:
            route?.from ||
            lead?.from_location_raw ||
            lead?.raw?.from_location ||
            null,

        to:
            route?.to ||
            lead?.to_location_raw ||
            lead?.raw?.to_location ||
            null,
    };
}

function getPointFromLocation(location) {
    const lat = getCoordinate(location, ['lat', 'latitude']);
    const lon = getCoordinate(location, ['lng', 'lon', 'longitude']);

    if (!hasValue(lat) || !hasValue(lon)) {
        return null;
    }

    return [lat, lon];
}

export function buildPreviewRoutePointsFromLead(lead) {
    const { from, to } = getRouteLocationsFromLead(lead);

    const fromPoint = getPointFromLocation(from);
    const toPoint = getPointFromLocation(to);

    if (!fromPoint || !toPoint) {
        return [];
    }

    return [fromPoint, toPoint];
}
