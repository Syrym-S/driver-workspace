import { useEffect } from "react";
import {
    MapContainer,
    Marker,
    Polyline,
    Popup,
    TileLayer,
    Tooltip,
    useMap,
} from "react-leaflet";

export function TenderMapView({
    center,
    zoom,
    markers = [],
    route = null,
    routePoints = [],
}) {
    return (
        <MapContainer
            center={center}
            zoom={zoom}
            scrollWheelZoom
            style={{
                width: "100%",
                height: "100%",
            }}
        >
            <MapResizeHandler
                center={center}
                zoom={zoom}
                markersCount={markers.length}
                routePointsCount={routePoints.length}
            />

            <FitRouteBounds routePoints={routePoints} />

            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url='https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
            />

            {routePoints.length >= 2 && (
                <Polyline
                    positions={routePoints}
                    pathOptions={{
                        weight: 5,
                        opacity: 0.9,
                    }}
                >
                    <Tooltip sticky>
                        <div>
                            <b>Маршрут</b>

                            {route?.distanceMeters && (
                                <>
                                    <br />
                                    {(route.distanceMeters / 1000).toFixed(
                                        1,
                                    )}{" "}
                                    км
                                </>
                            )}

                            {route?.duration && (
                                <>
                                    <br />
                                    {Math.round(
                                        parseInt(route.duration, 10) / 60,
                                    )}{" "}
                                    мин
                                </>
                            )}
                        </div>
                    </Tooltip>
                </Polyline>
            )}

            {markers.map((marker) => (
                <Marker key={marker.id} position={marker.position}>
                    <Popup>
                        <strong>{marker.title}</strong>
                        <br />
                        {marker.description}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}

function MapResizeHandler({ center, zoom, markersCount, routePointsCount }) {
    const map = useMap();

    useEffect(() => {
        const invalidate = () => {
            map.invalidateSize();
        };

        const firstTimeoutId = setTimeout(invalidate, 0);
        const secondTimeoutId = setTimeout(invalidate, 250);
        const thirdTimeoutId = setTimeout(invalidate, 600);

        return () => {
            clearTimeout(firstTimeoutId);
            clearTimeout(secondTimeoutId);
            clearTimeout(thirdTimeoutId);
        };
    }, [map, center, zoom, markersCount, routePointsCount]);

    useEffect(() => {
        const container = map.getContainer();

        const resizeObserver = new ResizeObserver(() => {
            map.invalidateSize();
        });

        resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
        };
    }, [map]);

    return null;
}

function FitRouteBounds({ routePoints }) {
    const map = useMap();

    useEffect(() => {
        if (!routePoints || routePoints.length < 2) {
            return;
        }

        map.fitBounds(routePoints, {
            padding: [32, 32],
        });
    }, [map, routePoints]);

    return null;
}
