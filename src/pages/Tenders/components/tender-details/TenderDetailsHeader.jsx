import { Box, Chip, Stack, Typography } from '@mui/material';

import {
    getTimeLeft,
    tenderStatusLabels,
    tenderStatusStyles,
} from '../tender-card.helpers';

export function TenderDetailsHeader({ tender }) {
    const shouldShowTimeLeft =
        tender.status !== 'closed' && tender.status !== 'cancelled';

    return (
        <Box
            sx={{
                px: 3,
                py: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 2,
                flexWrap: 'wrap',
            }}
        >
            <Box>
                <Typography variant='body2' color='text.secondary'>
                    Тендер
                </Typography>

                <Typography variant='h6' fontWeight={600}>
                    Тендер #{tender.id || '—'}
                </Typography>
            </Box>

            <Stack
                direction='row'
                spacing={1}
                useFlexGap
                sx={{
                    flexWrap: 'wrap',
                    justifyContent: {
                        xs: 'flex-start',
                        sm: 'flex-end',
                    },
                }}
            >
                {shouldShowTimeLeft && (
                    <TimeLeftBadge
                        value={getTimeLeft(tender.endDateTime, tender.status)}
                    />
                )}

                <Chip
                    label={tenderStatusLabels[tender.status] || tender.status}
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
    );
}

function TimeLeftBadge({ value }) {
    return (
        <Box
            sx={{
                px: 1.25,
                py: 0.45,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 999,
                backgroundColor: 'grey.50',
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
            }}
        >
            <Typography
                sx={{
                    fontSize: 11,
                    lineHeight: 1.2,
                    color: 'text.secondary',
                }}
            >
                Осталось
            </Typography>

            <Typography
                sx={{
                    fontSize: 12,
                    lineHeight: 1.2,
                    fontWeight: 600,
                    color: 'text.primary',
                }}
            >
                {value || 'Не указано'}
            </Typography>
        </Box>
    );
}
