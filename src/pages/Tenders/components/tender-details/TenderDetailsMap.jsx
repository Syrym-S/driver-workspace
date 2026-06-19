import { Box, CircularProgress } from "@mui/material";
import { TenderMapView } from "./TenderMapView";

const DEFAULT_MAP_CENTER = [48.0196, 66.9237];
const DEFAULT_MAP_ZOOM = 5;

export function TenderDetailsMap({
    lead,
    route,
    routePoints = [],
    isRouteLoading = false,
}) {
    const hasRoutePoints = routePoints.length >= 2;

    const routeMarkers = hasRoutePoints
        ? [
              {
                  id: "route-start",
                  position: routePoints[0],
                  title: "Откуда",
                  description: lead.from_location || "Не указано",
              },
              {
                  id: "route-end",
                  position: routePoints[routePoints.length - 1],
                  title: "Куда",
                  description: lead.to_location || "Не указано",
              },
          ]
        : [];

    const mapCenter = hasRoutePoints ? routePoints[0] : DEFAULT_MAP_CENTER;

    return (
        <Box
            sx={{
                position: "relative",
                height: {
                    xs: 220,
                    sm: 280,
                },
                minHeight: 220,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
                overflow: "hidden",
                mb: 3,
                mt: 1,
            }}
        >
            {isRouteLoading && (
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(255, 255, 255, 0.55)",
                    }}
                >
                    <CircularProgress size={28} />
                </Box>
            )}

            <TenderMapView
                center={mapCenter}
                zoom={hasRoutePoints ? 7 : DEFAULT_MAP_ZOOM}
                markers={routeMarkers}
                route={route}
                routePoints={hasRoutePoints ? routePoints : []}
            />
        </Box>
    );
}
