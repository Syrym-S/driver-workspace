const DEFAULT_MIN_ANGLE_DEGREES = 5;

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
 * Упрощает маршрут перед отрисовкой:
 * оставляет первую/последнюю точки и промежуточные точки,
 * где направление маршрута меняется минимум на minAngleDegrees.
 */
export function simplifyRouteByAngle(
    coords,
    minAngleDegrees = DEFAULT_MIN_ANGLE_DEGREES,
) {
    if (!Array.isArray(coords) || coords.length <= 2) {
        return coords;
    }

    const simplifiedCoords = [coords[0]];

    // anchorPoint — последняя точка, которую мы уже оставили на маршруте.
    let anchorPoint = coords[0];

    // candidatePoint — текущая точка-кандидат: оставить её или пропустить.
    let candidatePoint = coords[1];

    for (let index = 2; index < coords.length; index++) {
        const nextPoint = coords[index];

        const candidateVector = getProjectedVector(anchorPoint, candidatePoint);
        const nextVector = getProjectedVector(anchorPoint, nextPoint);

        const angle = getAngleBetweenVectors(candidateVector, nextVector);

        // Если угол заметный, candidatePoint влияет на форму линии — оставляем.
        if (angle >= minAngleDegrees) {
            simplifiedCoords.push(candidatePoint);
            anchorPoint = candidatePoint;
        }

        candidatePoint = nextPoint;
    }

    const lastPoint = coords[coords.length - 1];
    const lastSimplifiedPoint = simplifiedCoords[simplifiedCoords.length - 1];

    // Конец маршрута всегда должен остаться точным.
    if (!isSameCoord(lastSimplifiedPoint, lastPoint)) {
        simplifiedCoords.push(lastPoint);
    }

    return simplifiedCoords;
}
