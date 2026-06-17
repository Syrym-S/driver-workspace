import { Box, Typography } from "@mui/material";

export function InfoBadge({ label, value, accent = false, muted = false }) {
    return (
        <Box
            sx={{
                px: 1.5,
                py: 1,
                border: "1px solid",
                borderColor: muted ? "grey.300" : "divider",
                borderRadius: 2,
                backgroundColor: muted ? "grey.200" : "grey.50",
                minWidth: 0,
            }}
        >
            <Typography
                sx={{
                    fontSize: 11,
                    lineHeight: 1.2,
                    color: "text.secondary",
                    mb: 0.25,
                }}
            >
                {label}
            </Typography>

            <Typography
                sx={{
                    fontSize: 14,
                    lineHeight: 1.3,
                    color: muted
                        ? "text.secondary"
                        : accent
                          ? "primary.main"
                          : "text.primary",
                }}
            >
                {value || "Не указано"}
            </Typography>
        </Box>
    );
}
