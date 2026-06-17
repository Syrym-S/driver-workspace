import { Box, Typography } from "@mui/material";

export function RoutePointCard({ label, value, icon, muted = false }) {
    return (
        <Box
            sx={{
                flex: 1,
                minWidth: 220,
                minHeight: 86,
                p: 1.5,
                border: "1px solid",
                borderColor: muted ? "grey.300" : "divider",
                borderRadius: 2,
                backgroundColor: muted ? "grey.200" : "grey.50",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
            }}
        >
            <Typography
                variant='caption'
                sx={{
                    display: "block",
                    color: "text.secondary",
                    mb: 0.5,
                }}
            >
                {label}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {icon}

                <Typography
                    fontWeight={500}
                    sx={{
                        fontSize: 14,
                        lineHeight: 1.35,
                    }}
                >
                    {value || "Не указано"}
                </Typography>
            </Box>
        </Box>
    );
}
