import { Box, Chip, Stack, Typography } from "@mui/material";
import ArrowRightAltRoundedIcon from "@mui/icons-material/ArrowRightAltRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import TripOriginIcon from "@mui/icons-material/TripOrigin";

import { InfoBadge } from "./InfoBadge";
import { RoutePointCard } from "./RoutePointCard";
import { TimeLeftBadge } from "./TimeLeftBadge";
import {
    tenderStatusLabels,
    tenderStatusStyles,
} from "./tender-card.constants";
import { getTimeLeft, hasValue } from "./tender-card.helpers";

export function TenderCard({ tender }) {
    const isCancelled = tender.status === "cancelled";
    const shouldShowTimeLeft = ["new", "active"].includes(tender.status);

    return (
        <Box
            sx={{
                p: 3,
                border: "2px solid",
                borderColor: isCancelled ? "grey.300" : "divider",
                borderRadius: 4,
                backgroundColor: isCancelled ? "grey.100" : "background.paper",
                boxShadow: isCancelled
                    ? "none"
                    : "0 2px 8px rgba(0, 0, 0, 0.06)",
                transition: "0.2s ease",
                opacity: isCancelled ? 0.82 : 1,
                "&:hover": {
                    borderColor: isCancelled ? "grey.400" : "primary.light",
                    boxShadow: isCancelled
                        ? "0 4px 12px rgba(0, 0, 0, 0.06)"
                        : "0 8px 24px rgba(33, 150, 243, 0.12)",
                },
            }}
        >
            <Stack spacing={2.5}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 2,
                        flexWrap: "wrap",
                    }}
                >
                    <Box>
                        <Typography
                            variant='body2'
                            color='text.secondary'
                            sx={{ mb: 0.75 }}
                        >
                            Тендер
                        </Typography>

                        <Typography
                            sx={{
                                lineHeight: 1.3,
                                fontSize: {
                                    xs: "16px",
                                    sm: "18px",
                                },
                                fontWeight: 500,
                            }}
                        >
                            Тендер #{tender.id || "—"}
                        </Typography>
                    </Box>

                    <Stack
                        direction='row'
                        spacing={1}
                        useFlexGap
                        sx={{
                            flexWrap: "wrap",
                            justifyContent: {
                                xs: "flex-start",
                                sm: "flex-end",
                            },
                        }}
                    >
                        {shouldShowTimeLeft && (
                            <TimeLeftBadge
                                value={getTimeLeft(
                                    tender.endDateTime,
                                    tender.status,
                                )}
                            />
                        )}

                        <Chip
                            label={
                                tenderStatusLabels[tender.status] ||
                                tender.status
                            }
                            variant='outlined'
                            size='small'
                            sx={{
                                borderRadius: 999,
                                fontWeight: 600,
                                ...(tenderStatusStyles[tender.status] ||
                                    tenderStatusStyles.new),
                            }}
                        />
                    </Stack>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "stretch",
                        gap: 1.5,
                        flexWrap: {
                            xs: "wrap",
                            sm: "nowrap",
                        },
                    }}
                >
                    <RoutePointCard
                        label='Откуда'
                        value={tender.from_location}
                        muted={isCancelled}
                        icon={
                            <TripOriginIcon
                                sx={{ fontSize: 18, color: "primary.main" }}
                            />
                        }
                    />

                    <Box
                        sx={{
                            display: {
                                xs: "none",
                                sm: "flex",
                            },
                            alignItems: "center",
                            justifyContent: "center",
                            px: 0.5,
                        }}
                    >
                        <ArrowRightAltRoundedIcon
                            sx={{
                                color: "text.secondary",
                                fontSize: 28,
                            }}
                        />
                    </Box>

                    <RoutePointCard
                        label='Куда'
                        value={tender.to_location}
                        muted={isCancelled}
                        icon={
                            <LocationOnOutlinedIcon
                                sx={{ fontSize: 18, color: "primary.main" }}
                            />
                        }
                    />
                </Box>

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr 1fr",
                            md: "repeat(3, 1fr)",
                        },
                        gap: 1,
                    }}
                >
                    <InfoBadge
                        label='Вес'
                        value={
                            hasValue(tender.cargo?.weight_kg)
                                ? `${tender.cargo.weight_kg} кг`
                                : "Не указано"
                        }
                        muted={isCancelled}
                    />

                    <InfoBadge
                        label='Тип'
                        value={tender.cargo?.type || "Не указан"}
                        muted={isCancelled}
                    />

                    <InfoBadge
                        label='Цена'
                        value={
                            hasValue(tender.summ)
                                ? `${tender.summ} ${tender.currency}`
                                : "Не указано"
                        }
                        accent
                        muted={isCancelled}
                    />
                </Box>
            </Stack>
        </Box>
    );
}
