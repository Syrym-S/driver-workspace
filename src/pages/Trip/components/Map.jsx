import { useCallback, useEffect, useState } from 'react';
import {
    Paper,
    Typography,
    CircularProgress,
    Alert,
    Button,
    Box,
} from '@mui/material';

import {
    MapContainer,
    TileLayer,
    Polyline,
    Tooltip,
    Marker,
    useMap,
} from 'react-leaflet';

import L from 'leaflet';
import polyline from '@mapbox/polyline';

import { generateRoute } from '../api/api';
import { simplifyRouteByAngle } from '../components/route.helpers';

// decode polyline
const decodePolyline = (encoded) => {
    return polyline.decode(encoded).map(([lat, lng]) => [lat, lng]);
};

// авто fitBounds
const FitBounds = ({ coords }) => {
    const map = useMap();

    useEffect(() => {
        if (coords.length) {
            map.fitBounds(L.latLngBounds(coords), { padding: [30, 30] });
        }
    }, [coords, map]);

    return null;
};

// иконки
const startIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [28, 28],
});

const endIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [28, 28],
});

const SHOULD_SIMPLIFY_ROUTE = true;

const Map = ({ tripId }) => {
    const [coords, setCoords] = useState([]);
    const [route, setRoute] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const fetchRoute = useCallback(async () => {
        try {
            setLoading(true);
            setError(false);

            const res = await generateRoute({ id: tripId });
            const routeData = res?.routes?.[0];

            if (routeData?.polyline?.encodedPolyline) {
                const decoded = decodePolyline(
                    routeData.polyline.encodedPolyline,
                );

                const nextCoords = SHOULD_SIMPLIFY_ROUTE
                    ? simplifyRouteByAngle(decoded, 5, 8)
                    : decoded;

                // console.log("route coords:", {
                //     original: decoded.length,
                //     rendered: nextCoords.length,
                // });

                setCoords(nextCoords);
                setRoute(routeData);
            }
        } catch (err) {
            console.error(err);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [tripId]);

    useEffect(() => {
        if (!tripId) {
            return;
        }

        let isCancelled = false;

        queueMicrotask(() => {
            if (!isCancelled) {
                fetchRoute();
            }
        });

        return () => {
            isCancelled = true;
        };
    }, [tripId, fetchRoute]);

    return (
        <Paper
            sx={{
                borderRadius: 3,
                overflow: 'hidden', // важно
            }}
        >
            {/* HEADER */}
            <Box sx={{ p: 2 }}>
                <Typography variant='h6'>Карта маршрута</Typography>
            </Box>

            {/* LOADING */}
            {loading && (
                <Box sx={{ p: 2 }}>
                    <CircularProgress />
                </Box>
            )}

            {/* ERROR */}
            {error && (
                <Box sx={{ p: 2 }}>
                    <Alert
                        severity='error'
                        action={
                            <Button size='small' onClick={fetchRoute}>
                                Повторить
                            </Button>
                        }
                    >
                        Не удалось загрузить маршрут
                    </Alert>
                </Box>
            )}

            {/* MAP */}
            {!loading && !error && coords.length > 0 && (
                <Box
                    sx={{
                        width: '100%',
                        height: {
                            xs: 250,
                            md: 400,
                            lg: 500,
                        },
                        p: 2,
                    }}
                >
                    <MapContainer
                        center={coords[0]}
                        zoom={7}
                        style={{
                            width: '100%',
                            height: '100%',
                        }}
                    >
                        <TileLayer
                            attribution='&copy; OpenStreetMap'
                            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                        />

                        <FitBounds coords={coords} />

                        <Polyline positions={coords} color='#1976d2' weight={5}>
                            <Tooltip sticky>
                                <div>
                                    <b>{route?.description}</b>
                                    <br />
                                    {(route?.distanceMeters / 1000).toFixed(
                                        1,
                                    )}{' '}
                                    км
                                    <br />
                                    {Math.round(
                                        parseInt(route?.duration) / 60,
                                    )}{' '}
                                    мин
                                </div>
                            </Tooltip>
                        </Polyline>

                        <Marker position={coords[0]} icon={startIcon} />
                        <Marker
                            position={coords[coords.length - 1]}
                            icon={endIcon}
                        />
                    </MapContainer>
                </Box>
            )}

            {!loading && !error && !coords.length && (
                <Box sx={{ p: 2 }}>
                    <Typography>Маршрут отсутствует</Typography>
                </Box>
            )}
        </Paper>
    );
};

export default Map;
