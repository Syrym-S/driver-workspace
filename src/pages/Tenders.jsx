import { Box, Container, Stack, Typography } from "@mui/material";
import { mockTenders } from "./Tenders/api/tenders.mock";
import { TenderCard } from "./Tenders/components/TenderCard";

export default function Tenders() {
    return (
        <Container
            sx={{
                py: {
                    xs: 2,
                    sm: 3,
                },
            }}
        >
            <Box sx={{ mb: 3 }}>
                <Typography
                    sx={{
                        fontSize: {
                            xs: 22,
                            sm: 28,
                        },
                        fontWeight: 700,
                        lineHeight: 1.2,
                    }}
                >
                    Тендеры
                </Typography>

                <Typography color='text.secondary' sx={{ mt: 0.75 }}>
                    Список доступных тендеров
                </Typography>
            </Box>

            <Stack spacing={2}>
                {mockTenders.map((tender) => (
                    <TenderCard key={tender.id} tender={tender} />
                ))}
            </Stack>
        </Container>
    );
}
