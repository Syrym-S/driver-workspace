const DEFAULT_MIN_ANGLE_DEGREES = 5;
const DEFAULT_MAX_SKIPPED_POINTS = 8;

function toRadians(value) {
    return (value * Math.PI) / 180;
}

function toDegrees(value) {
    return (value * 180) / Math.PI;
}

/**
 * Строим приближённый 2D-вектор между двумя geo-точками.
 * longitude дополнительно умножаем на cos(latitude), потому что
 * один градус долготы имеет разную "длину" на разных широтах.
 */
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

/**
 * Считаем угол между двумя направлениями через скалярное произведение.
 * Результат возвращаем в градусах, чтобы удобно сравнивать с порогом 5°.
 */
function getAngleBetweenVectors(firstVector, secondVector) {
    const firstLength = getVectorLength(firstVector);
    const secondLength = getVectorLength(secondVector);

    if (firstLength === 0 || secondLength === 0) {
        return 0;
    }

    const dotProduct =
        firstVector.x * secondVector.x + firstVector.y * secondVector.y;

    // Защита от floating point погрешностей: acos принимает значения только [-1, 1].
    const normalizedDotProduct = Math.min(
        1,
        Math.max(-1, dotProduct / (firstLength * secondLength)),
    );

    return toDegrees(Math.acos(normalizedDotProduct));
}

function isSameCoord(firstCoord, secondCoord) {
    return (
        firstCoord?.[0] === secondCoord?.[0] &&
        firstCoord?.[1] === secondCoord?.[1]
    );
}

/**
 * Упрощает маршрут перед отрисовкой на карте:
 *
 * Оставляет:
 * - первую и последнюю точки маршрута;
 * - точки, где локальный поворот >= minAngleDegrees;
 * - каждую maxSkippedPoints-ю пропущенную точку, чтобы маршрут не схлопнулся в прямую;
 */
export function simplifyRouteByAngle(
    coords,
    minAngleDegrees = DEFAULT_MIN_ANGLE_DEGREES,
    maxSkippedPoints = DEFAULT_MAX_SKIPPED_POINTS,
) {
    if (!Array.isArray(coords) || coords.length <= 2) {
        return coords;
    }

    const simplifiedCoords = [coords[0]];
    let skippedPointsCount = 0;

    for (let index = 1; index < coords.length - 1; index += 1) {
        const previousPoint = simplifiedCoords[simplifiedCoords.length - 1];
        const candidatePoint = coords[index];
        const nextPoint = coords[index + 1];

        const incomingVector = getProjectedVector(
            previousPoint,
            candidatePoint,
        );
        const outgoingVector = getProjectedVector(candidatePoint, nextPoint);

        const angle = getAngleBetweenVectors(incomingVector, outgoingVector);

        skippedPointsCount += 1;

        const shouldKeepPoint =
            angle >= minAngleDegrees || skippedPointsCount >= maxSkippedPoints;

        // Оставляем точку либо на заметном повороте, либо как контрольную точку после N пропусков
        if (shouldKeepPoint) {
            simplifiedCoords.push(candidatePoint);
            skippedPointsCount = 0;
        }
    }

    const lastPoint = coords[coords.length - 1];
    const lastSimplifiedPoint = simplifiedCoords[simplifiedCoords.length - 1];

    // Конец маршрута всегда должен остаться точным.
    if (!isSameCoord(lastSimplifiedPoint, lastPoint)) {
        simplifiedCoords.push(lastPoint);
    }

    return simplifiedCoords;
}
