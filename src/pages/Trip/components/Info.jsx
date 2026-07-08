import {
    Paper,
    Typography,
    Box,
    Grid,
    Stack,
    Chip,
    Divider,
} from '@mui/material';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';

import { useApp } from '../../../app/context';
import { normalizePhoneHref } from '../../../shared/helpers/helpers';

function hasValue(value) {
    return value !== null && value !== undefined && value !== '';
}

function formatLocation(location) {
    if (!location) {
        return '—';
    }

    if (typeof location === 'string') {
        return location.trim() || '—';
    }

    return (
        [location.country, location.region, location.city, location.address]
            .filter(Boolean)
            .join(', ') || '—'
    );
}

function formatWeight(value) {
    return hasValue(value) ? `${value} кг` : '—';
}

function formatDimensions(cargo) {
    const length = cargo?.length_cm;
    const width = cargo?.width_cm;
    const height = cargo?.height_cm;

    if (!hasValue(length) && !hasValue(width) && !hasValue(height)) {
        return '—';
    }

    return `${length || 0} × ${width || 0} × ${height || 0} см`;
}

function formatMoney(amount, currency = 'KZT') {
    if (!hasValue(amount)) {
        return '—';
    }

    const numericAmount = Number(amount);

    if (Number.isNaN(numericAmount)) {
        return `${amount} ${currency || 'KZT'}`;
    }

    return `${numericAmount.toLocaleString('ru-RU')} ${currency || 'KZT'}`;
}

const Item = ({ label, value }) => (
    <Box>
        <Typography variant='caption' color='text.secondary'>
            {label}
        </Typography>

        <Typography fontWeight={500}>
            {hasValue(value) ? value : '—'}
        </Typography>
    </Box>
);

const PhoneItem = ({ label, value }) => {
    const phoneHref = normalizePhoneHref(value);

    return (
        <Box>
            <Typography variant='caption' color='text.secondary'>
                {label}
            </Typography>

            {phoneHref ? (
                <Typography
                    component='a'
                    href={`tel:${phoneHref}`}
                    fontWeight={500}
                    sx={{
                        display: 'block',
                        color: 'primary.main',
                        textDecoration: 'none',
                        '&:hover': {
                            textDecoration: 'underline',
                        },
                    }}
                >
                    {value}
                </Typography>
            ) : (
                <Typography fontWeight={500}>—</Typography>
            )}
        </Box>
    );
};

const Info = () => {
    const { openLead: info } = useApp();

    return (
        <Paper
            sx={{
                p: 3,
                borderRadius: 4,
            }}
        >
            <Box display='flex' alignItems='center' gap={1} mb={3}>
                <InfoOutlinedIcon color='primary' />

                <Typography variant='h6' fontWeight={700}>
                    Информация о рейсе
                </Typography>
            </Box>

            {info && (
                <Stack spacing={3}>
                    <Box>
                        <Chip
                            label={info.status}
                            color={info.status === 'new' ? 'error' : 'primary'}
                        />
                    </Box>

                    <Box>
                        <Box display='flex' alignItems='center' gap={1} mb={2}>
                            <RouteOutlinedIcon color='primary' />

                            <Typography fontWeight={700}>Маршрут</Typography>
                        </Box>

                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Paper
                                    variant='outlined'
                                    sx={{
                                        p: 2,
                                        borderRadius: 3,
                                    }}
                                >
                                    <Item
                                        label='Откуда'
                                        value={formatLocation(info.route?.from)}
                                    />
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Paper
                                    variant='outlined'
                                    sx={{
                                        p: 2,
                                        borderRadius: 3,
                                    }}
                                >
                                    <Item
                                        label='Куда'
                                        value={formatLocation(info.route?.to)}
                                    />
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>

                    <Divider />

                    <Box>
                        <Box display='flex' alignItems='center' gap={1} mb={2}>
                            <LocalShippingOutlinedIcon color='primary' />

                            <Typography fontWeight={700}>Груз</Typography>
                        </Box>

                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Item
                                    label='Название'
                                    value={info.cargo?.name}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Item label='Тип' value={info.cargo?.type} />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Item
                                    label='Вес'
                                    value={formatWeight(info.cargo?.weight_kg)}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Item
                                    label='Размеры'
                                    value={formatDimensions(info.cargo)}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Item label='НДС' value={info.vat} />
                            </Grid>

                            <Grid item xs={12}>
                                <Item
                                    label='Описание'
                                    value={
                                        info.cargo?.context ||
                                        info.cargo?.description
                                    }
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    <Divider />

                    <Box>
                        <Box display='flex' alignItems='center' gap={1} mb={2}>
                            <BusinessOutlinedIcon color='primary' />

                            <Typography fontWeight={700}>Экспедитор</Typography>
                        </Box>

                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Item
                                    label='Контактное лицо'
                                    value={info.forwarder?.contact_person}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Item
                                    label='Компания'
                                    value={info.forwarder?.name}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <PhoneItem
                                    label='Телефон'
                                    value={info.forwarder?.tel}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Item label='БИН' value={info.forwarder?.bin} />
                            </Grid>
                        </Grid>
                    </Box>

                    <Divider />

                    <Box>
                        <Paper
                            variant='outlined'
                            sx={{
                                p: 2.5,
                                borderRadius: 3,
                                backgroundColor: 'background.default',
                            }}
                        >
                            <Typography
                                variant='caption'
                                color='text.secondary'
                            >
                                Стоимость перевозки
                            </Typography>

                            <Typography variant='h6' fontWeight={700} mt={0.5}>
                                {formatMoney(
                                    info.transportation_price,
                                    info.currency,
                                )}
                            </Typography>
                        </Paper>
                    </Box>
                </Stack>
            )}
        </Paper>
    );
};

export default Info;
