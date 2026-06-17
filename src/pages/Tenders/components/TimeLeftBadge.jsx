import { Box, Typography } from "@mui/material";

export function TimeLeftBadge({ value }) {
    return (
        <Box
            sx={{
                px: 1.25,
                py: 0.45,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 999,
                backgroundColor: "grey.50",
                display: "flex",
                alignItems: "center",
                gap: 0.75,
            }}
        >
            <Typography
                sx={{
                    fontSize: 11,
                    lineHeight: 1.2,
                    color: "text.secondary",
                }}
            >
                Осталось
            </Typography>

            <Typography
                sx={{
                    fontSize: 12,
                    lineHeight: 1.2,
                    fontWeight: 600,
                    color: "text.primary",
                }}
            >
                {value || "Не указано"}
            </Typography>
        </Box>
    );
}
