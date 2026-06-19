import { Box, Stack, Typography } from '@mui/material';
import ArrowRightAltRoundedIcon from '@mui/icons-material/ArrowRightAltRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import TripOriginIcon from '@mui/icons-material/TripOrigin';

import { TenderDetailsSection } from './TenderDetailsSection';
import { TenderInfoBadge } from '../tender-details/TenderInfoBadge';

function normalizeLocationValue(value) {
    if (value === null || value === undefined) {
        return '';
    }

    if (typeof value === 'string') {
        return value.trim();
    }

    if (typeof value === 'number') {
        return String(value);
    }

    if (typeof value === 'object') {
        const preferredKeys = [
            'city',
            'address',
            'name',
            'title',
            'label',
            'value',
            'fullAddress',
            'formatted_address',
            'location',
        ];

        for (const key of preferredKeys) {
            if (typeof value[key] === 'string' && value[key].trim()) {
                return value[key].trim();
            }
        }

        return Object.values(value)
            .filter((item) => typeof item === 'string' && item.trim())
            .join(', ');
    }

    return '';
}

export function TenderTransportSection({ tender }) {
    const lead = tender.lead || {};
    const cargo = lead.cargo || tender.cargo || {};

    const fromLocation = tender.from_location || lead.from_location;
    const toLocation = tender.to_location || lead.to_location;

    return (
        <Stack spacing={2}>
            <TenderDetailsSection icon={<RouteOutlinedIcon />} title='Маршрут'>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'stretch',
                        gap: 1.5,
                        flexWrap: {
                            xs: 'wrap',
                            md: 'nowrap',
                        },
                    }}
                >
                    <RoutePoint
                        label='Откуда'
                        value={normalizeLocationValue(fromLocation)}
                        icon={<TripOriginIcon />}
                    />

                    <Box
                        sx={{
                            display: {
                                xs: 'none',
                                md: 'flex',
                            },
                            alignItems: 'center',
                            justifyContent: 'center',
                            px: 0.5,
                        }}
                    >
                        <ArrowRightAltRoundedIcon
                            sx={{
                                color: 'text.secondary',
                                fontSize: 28,
                            }}
                        />
                    </Box>

                    <RoutePoint
                        label='Куда'
                        value={normalizeLocationValue(toLocation)}
                        icon={<LocationOnOutlinedIcon />}
                    />
                </Box>
            </TenderDetailsSection>

            <TenderDetailsSection
                icon={<LocalShippingOutlinedIcon />}
                title='Груз'
            >
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr 1fr',
                            sm: 'repeat(2, 1fr)',
                            md: 'repeat(3, 1fr)',
                        },
                        gap: 1,
                    }}
                >
                    <TenderInfoBadge label='Тип' value={cargo.type} />

                    <TenderInfoBadge
                        label='Вес'
                        value={
                            cargo.weight_kg
                                ? `${cargo.weight_kg} кг`
                                : 'Не указан'
                        }
                    />

                    <TenderInfoBadge
                        label='НДС'
                        value={lead.vat || tender.vat || 'Не указан'}
                    />
                </Box>

                <TenderInfoBadge
                    label='Описание'
                    value={
                        cargo.description ||
                        cargo.context ||
                        cargo.comment ||
                        'Не указано'
                    }
                    fullWidth
                    sx={{ mt: 1 }}
                />
            </TenderDetailsSection>
        </Stack>
    );
}

export function RoutePoint({ label, value, icon }) {
    return (
        <Box
            sx={{
                flex: 1,
                minWidth: 220,
                minHeight: 86,
                p: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                backgroundColor: 'grey.50',
            }}
        >
            <Typography
                variant='caption'
                sx={{
                    display: 'block',
                    color: 'text.secondary',
                    mb: 0.5,
                }}
            >
                {label}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                    sx={{
                        color: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        '& svg': {
                            fontSize: 18,
                        },
                    }}
                >
                    {icon}
                </Box>

                <Typography
                    sx={{
                        fontSize: '14px',
                        lineHeight: 1.35,
                        fontWeight: 500,
                    }}
                >
                    {value || 'Не указано'}
                </Typography>
            </Box>
        </Box>
    );
}
