import { Box, CircularProgress, Alert, Button } from "@mui/material";

import { useParams } from "react-router-dom";

import { useEffect, useState, useContext } from "react";

import Map from "./Trip/components/Map";
import Tool from "./Trip/components/Tool";
import Info from "./Trip/components/Info";
import Document from "./Trip/components/Document";

import { getLeadInfo } from "./Trip/api/api";

import { useApp } from "../app/context";

import { getBrowserLocation } from "./Trip/api/geows";

import { connectGeoWS, bindGeoWS, sendGeoPoint } from "./Trip/api/geows";

import { useRef } from "react";

const Trip = ({ activeId = null }) => {
    const params = useParams();
    const id = activeId ?? params.id;

    const { user, openLead, setOpenLead } = useApp();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const wsRef = useRef(null);
    const geoWatchRef = useRef(null);
    const lastPointRef = useRef(null);

    const fetchInfo = async () => {
        try {
            setLoading(true);
            setError(false);

            const res = await getLeadInfo({
                lead_id: id,
            });

            setOpenLead(res?.data || null);
        } catch (e) {
            console.error(e);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchInfo();
        }

        return () => {
            setOpenLead(null);
        };
    }, [id]);

    useEffect(() => {
        if (openLead?.status !== "started") {
            return;
        }

        const session = openLead?.geows?.session;

        const wsUrl = GeoWS_Config?.ws;

        const userId = GeoWS_Config?.user;

        if (!session || !wsUrl || !userId) {
            return;
        }

        const ws = connectGeoWS({
            wsUrl,
            token: session,
            userId,
        });

        wsRef.current = ws;

        bindGeoWS(ws, {
            onOpen: () => {
                console.log("GeoWS connected");
            },

            onClose: () => {
                console.log("GeoWS closed");
            },

            onError: (e) => {
                console.error(e);
            },
        });

        geoWatchRef.current = setInterval(async () => {
            try {
                const pos = await getBrowserLocation();

                // новые координаты
                const nextPoint = {
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                    altitude: pos.coords.altitude ?? 0,
                };

                // последние координаты
                const lastPoint = lastPointRef.current;

                // нет прошлой точки
                if (!lastPoint) {
                    sendGeoPoint(ws, nextPoint);

                    lastPointRef.current = nextPoint;

                    return;
                }

                // сравнение
                const samePoint =
                    lastPoint.latitude === nextPoint.latitude &&
                    lastPoint.longitude === nextPoint.longitude;

                // не отправляем дубль
                if (samePoint) {
                    return;
                }

                sendGeoPoint(ws, nextPoint);

                lastPointRef.current = nextPoint;
            } catch (e) {
                console.error(e);
            }
        }, 5000);

        return () => {
            if (geoWatchRef.current) {
                clearInterval(geoWatchRef.current);
                geoWatchRef.current = null;
            }

            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }

            // очищаем последнюю точку
            lastPointRef.current = null;
        };
    }, [openLead?.status]);

    // LOADING
    if (loading) {
        return (
            <Box
                display='flex'
                justifyContent='center'
                alignItems='center'
                minHeight='60vh'
            >
                <CircularProgress />
            </Box>
        );
    }

    // ERROR
    if (error) {
        return (
            <Box p={2}>
                <Alert
                    severity='error'
                    action={
                        <Button
                            color='inherit'
                            size='small'
                            onClick={fetchInfo}
                        >
                            Повторить
                        </Button>
                    }
                >
                    Не удалось загрузить информацию о рейсе.
                </Alert>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                p: 2,
                display: "grid",
                gap: 2,

                gridTemplateColumns: "1fr",

                "@media (min-width: 900px)": {
                    gridTemplateColumns: "2fr 1fr",
                    gridTemplateAreas: `
            "map document"
            "tool document"
            "info document"
          `,
                },
            }}
        >
            {/* MAP */}
            <Box sx={{ gridArea: { md: "map" } }}>
                <Map tripId={id} />
            </Box>

            {/* TOOL */}
            <Box sx={{ gridArea: { md: "tool" } }}>
                <Tool tripId={id} />
            </Box>

            {/* INFO */}
            <Box sx={{ gridArea: { md: "info" } }}>
                <Info tripId={id} />
            </Box>

            {/* DOCUMENT */}
            <Box
                sx={{
                    gridArea: { md: "document" },
                    position: { md: "sticky" },
                    top: 16,
                    height: "fit-content",
                }}
            >
                <Document tripId={id} />
            </Box>
        </Box>
    );
};

export default Trip;
