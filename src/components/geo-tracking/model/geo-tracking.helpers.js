export const DRIVER_GEO_INACTIVE_STATUSES = new Set([
    'add_driver',
    'finished',
    'cancelled',
]);

export const DRIVER_GEO_TRACKING_INTERVAL_MS = 30_000;

// Кэшируем точки локально, чтобы не потерять координаты,
// если WS временно закрыт или страница была перезагружена до отправки.
const DRIVER_GEO_TRACKING_STORAGE_KEY = 'driver_geo_tracking_points';

// Минимальный угол отклонения: если маршрут почти прямой,
// промежуточную точку можно не отправлять.
const DEFAULT_MIN_TRACKING_ANGLE_DEGREES = 5;

// Даже если угол маленький, периодически сохраняем точку,
// чтобы длинный прямой маршрут не схлопнулся в одну линию.
const DEFAULT_MAX_SKIPPED_TRACKING_POINTS = 8;

// Ограничиваем размер localStorage, чтобы кэш не рос бесконечно.
const MAX_CACHED_TRACKING_POINTS = 100;

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

function normalizeNumber(value) {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    const numberValue = Number(value);

    return Number.isFinite(numberValue) ? numberValue : null;
}

export function isValidGeoTrackingPoint(point) {
    const latitude = normalizeNumber(point?.latitude);
    const longitude = normalizeNumber(point?.longitude);

    return Boolean(
        latitude !== null &&
        longitude !== null &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180,
    );
}

export function normalizeGeoTrackingPoint(point) {
    if (!isValidGeoTrackingPoint(point)) {
        return null;
    }

    return {
        latitude: Number(point.latitude),
        longitude: Number(point.longitude),
        altitude: normalizeNumber(point.altitude) ?? 0,
        recordedAt: point.recordedAt || new Date().toISOString(),
    };
}

export function isSameGeoTrackingPoint(firstPoint, secondPoint) {
    if (
        !isValidGeoTrackingPoint(firstPoint) ||
        !isValidGeoTrackingPoint(secondPoint)
    ) {
        return false;
    }

    return (
        Number(firstPoint.latitude) === Number(secondPoint.latitude) &&
        Number(firstPoint.longitude) === Number(secondPoint.longitude)
    );
}

function toRadians(value) {
    return (value * Math.PI) / 180;
}

function toDegrees(value) {
    return (value * 180) / Math.PI;
}

function toCoord(point) {
    return [Number(point.latitude), Number(point.longitude)];
}

// Строим приближённый 2D-вектор между двумя geo-точками.
// longitude умножаем на cos(latitude), потому что длина градуса долготы
// зависит от широты.
function getProjectedVector(from, to) {
    const [fromLat, fromLng] = from;
    const [toLat, toLng] = to;

    const avgLat = toRadians((fromLat + toLat) / 2);

    return {
        x: (toLng - fromLng) * Math.cos(avgLat),
        y: toLat - fromLat,
    };
}

function getVectorLength(vector) {
    return Math.sqrt(vector.x ** 2 + vector.y ** 2);
}

// Считаем угол между двумя направлениями через скалярное произведение.
// Возвращаем градусы, чтобы сравнивать с порогом DEFAULT_MIN_TRACKING_ANGLE_DEGREES.
function getAngleBetweenVectors(firstVector, secondVector) {
    const firstLength = getVectorLength(firstVector);
    const secondLength = getVectorLength(secondVector);

    if (firstLength === 0 || secondLength === 0) {
        return 0;
    }

    const dotProduct =
        firstVector.x * secondVector.x + firstVector.y * secondVector.y;

    const normalizedDotProduct = Math.min(
        1,
        Math.max(-1, dotProduct / (firstLength * secondLength)),
    );

    return toDegrees(Math.acos(normalizedDotProduct));
}

// Streaming-версия упрощения маршрута.
// Для проверки угла нужны три точки:
// previousPoint — последняя сохранённая точка,
// candidatePoint — точка-кандидат,
// nextPoint — новая координата.
//
// Если угол между previous → candidate и candidate → next меньше порога,
// candidate пропускаем. Если угол заметный — сохраняем candidate.
export function getGeoTrackingAngleDecision({
    previousPoint,
    candidatePoint,
    nextPoint,
    skippedPointsCount = 0,
    minAngleDegrees = DEFAULT_MIN_TRACKING_ANGLE_DEGREES,
    maxSkippedPoints = DEFAULT_MAX_SKIPPED_TRACKING_POINTS,
} = {}) {
    const normalizedPreviousPoint = normalizeGeoTrackingPoint(previousPoint);
    const normalizedCandidatePoint = normalizeGeoTrackingPoint(candidatePoint);
    const normalizedNextPoint = normalizeGeoTrackingPoint(nextPoint);

    // Без candidate или nextPoint угол посчитать невозможно,
    // поэтому точку не сохраняем и не ломаем tracking.
    if (!normalizedCandidatePoint || !normalizedNextPoint) {
        return {
            shouldKeep: false,
            skippedPointsCount,
            angle: null,
        };
    }

    // Для первой валидной точки ещё нет предыдущего направления,
    // поэтому сохраняем её без проверки угла.
    if (!normalizedPreviousPoint) {
        return {
            shouldKeep: true,
            skippedPointsCount: 0,
            angle: null,
        };
    }

    const incomingVector = getProjectedVector(
        toCoord(normalizedPreviousPoint),
        toCoord(normalizedCandidatePoint),
    );

    const outgoingVector = getProjectedVector(
        toCoord(normalizedCandidatePoint),
        toCoord(normalizedNextPoint),
    );

    const angle = getAngleBetweenVectors(incomingVector, outgoingVector);
    const nextSkippedPointsCount = skippedPointsCount + 1;

    const shouldKeep =
        angle >= minAngleDegrees || nextSkippedPointsCount >= maxSkippedPoints;

    return {
        shouldKeep,
        angle,
        skippedPointsCount: shouldKeep ? 0 : nextSkippedPointsCount,
    };
}

function getLocalStorage() {
    if (typeof window === 'undefined' || !window.localStorage) {
        return null;
    }

    return window.localStorage;
}

// Читаем cached points только для текущего leadId.
// Если в localStorage лежат точки от другого рейса,
// очищаем кэш, чтобы не отправить координаты не в тот lead.
function readCachedGeoTrackingPayload() {
    const storage = getLocalStorage();

    if (!storage) {
        return null;
    }

    const rawValue = storage.getItem(DRIVER_GEO_TRACKING_STORAGE_KEY);

    if (!rawValue) {
        return null;
    }

    try {
        return JSON.parse(rawValue);
    } catch {
        storage.removeItem(DRIVER_GEO_TRACKING_STORAGE_KEY);
        return null;
    }
}

export function readCachedGeoTrackingPoints(leadId) {
    const payload = readCachedGeoTrackingPayload();

    if (!payload || typeof payload !== 'object') {
        return [];
    }

    if (payload.leadId && leadId && String(payload.leadId) !== String(leadId)) {
        clearCachedGeoTrackingPoints();
        return [];
    }

    return (payload.points || [])
        .map(normalizeGeoTrackingPoint)
        .filter(Boolean);
}

// Перед записью в localStorage нормализуем точки и ограничиваем их количество.
// Защита от битых данных и бесконечного роста кэша.
export function writeCachedGeoTrackingPoints(leadId, points) {
    const storage = getLocalStorage();

    if (!storage || !leadId) {
        return [];
    }

    const normalizedPoints = (points || [])
        .map(normalizeGeoTrackingPoint)
        .filter(Boolean)
        .slice(-MAX_CACHED_TRACKING_POINTS);

    if (!normalizedPoints.length) {
        clearCachedGeoTrackingPoints(leadId);
        return [];
    }

    storage.setItem(
        DRIVER_GEO_TRACKING_STORAGE_KEY,
        JSON.stringify({
            leadId: String(leadId),
            points: normalizedPoints,
        }),
    );

    return normalizedPoints;
}

export function appendCachedGeoTrackingPoint(leadId, point) {
    const normalizedPoint = normalizeGeoTrackingPoint(point);

    if (!leadId || !normalizedPoint) {
        return [];
    }

    const previousPoints = readCachedGeoTrackingPoints(leadId);
    const nextPoints = [...previousPoints, normalizedPoint];

    return writeCachedGeoTrackingPoints(leadId, nextPoints);
}

// Очищаем кэш только после успешной отправки.
// Если указан leadId, не трогаем кэш другого рейса.
export function clearCachedGeoTrackingPoints(leadId) {
    const storage = getLocalStorage();

    if (!storage) {
        return;
    }

    if (leadId) {
        const payload = readCachedGeoTrackingPayload();

        if (payload?.leadId && String(payload.leadId) !== String(leadId)) {
            return;
        }
    }

    storage.removeItem(DRIVER_GEO_TRACKING_STORAGE_KEY);
}
