import { Box, Stack } from '@mui/material';

import { TenderBetsSection } from '../sections/TenderBetsSection';
import { TenderForwarderSection } from '../sections/TenderForwarderSection';
import { TenderTransportSection } from '../sections/TenderTransportSection';

export function TenderDetailsContent({
    tender,
    isActionLoading = false,
    onCreateBet,
    onCancelBet,
}) {
    return (
        <Stack spacing={2}>
            <TenderTransportSection tender={tender} />

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        md: '1fr 1fr',
                    },
                    gap: 2,
                    alignItems: 'start',
                }}
            >
                <TenderForwarderSection tender={tender} />

                <TenderBetsSection
                    tender={tender}
                    isActionLoading={isActionLoading}
                    onCreateBet={onCreateBet}
                    onCancelBet={onCancelBet}
                />
            </Box>
        </Stack>
    );
}
