import { useState, useEffect } from 'react';

import {
    Paper,
    Typography,
    TextField,
    Button,
    Stack,
    Alert,
    CircularProgress,
    Grid,
    FormControlLabel,
    Checkbox,
    MenuItem,
    Divider,
    Box,
} from '@mui/material';

import { useApp } from '../../../app/context';

import { getUser, updateuser } from '../api';

function onlyDigits(value) {
    return String(value ?? '').replace(/\D/g, '');
}

function normalizeText(value) {
    return String(value ?? '').trim();
}

function toBoolean(value) {
    return value === true || value === 1 || value === '1' || value === 'true';
}

export const UpdateForm = () => {
    const { user, setUser } = useApp();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isPasswordTouched, setIsPasswordTouched] = useState(false);

    const [form, setForm] = useState({
        fio: user?.fio || '',
        email: user?.email || '',
        phone: user?.phone || '',
        password: '',
        password_confirm: '',

        iin: user?.iin || '',

        is_foreigner: Boolean(user?.is_foreigner),

        document_number: user?.document_number || '',

        issued_by: user?.issued_by || '',

        issued_date: user?.issued_date || '',

        is_ip: Boolean(user?.is_ip),

        ip_name: user?.ip_name || '',
        ip_bin: user?.ip_bin || user?.bin || '',
        ip_bik: user?.ip_bik || user?.bik || '',
        ip_iik: user?.ip_iik || user?.iik || '',
        ip_legal_address: user?.ip_legal_address || user?.legal_address || '',
    });

    function buildDriverProfilePayload(form, isPasswordTouched) {
        const payload = {
            fio: normalizeText(form.fio),
            email: normalizeText(form.email),
            phone: normalizeText(form.phone),
            is_foreigner: Boolean(form.is_foreigner),
            is_ip: Boolean(form.is_ip),
        };

        if (!form.is_foreigner) {
            payload.iin = onlyDigits(form.iin);
        }

        if (form.document_number) {
            payload.document_number = normalizeText(form.document_number);
        }

        if (form.issued_by) {
            payload.issued_by = normalizeText(form.issued_by);
        }

        if (form.issued_date) {
            payload.issued_date = form.issued_date;
        }

        if (isPasswordTouched) {
            const password = normalizeText(form.password);
            const passwordConfirm = normalizeText(form.password_confirm);

            if (!password || !passwordConfirm || password !== passwordConfirm) {
                throw new Error('Пароли не заполнены или не совпадают');
            }

            payload.password = password;
            payload.password_confirm = passwordConfirm;
        }

        if (form.is_ip) {
            payload.ip_name = normalizeText(form.ip_name);
            payload.bin = onlyDigits(form.ip_bin);
            payload.bik = normalizeText(form.ip_bik).toUpperCase();
            payload.iik = normalizeText(form.ip_iik).toUpperCase();
            payload.legal_address = normalizeText(form.ip_legal_address);
        }

        return payload;
    }

    const handleChange = (key, value) => {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError(false);
            setSuccess(false);

            const payload = buildDriverProfilePayload(form);
            console.log('profile payload before update:', payload);
            await updateuser(payload);

            setUser((prev) => ({
                ...prev,
                ...form,
            }));

            setSuccess(true);
        } catch (e) {
            console.error(e);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) return;

        setForm((prev) => ({
            ...prev,
            fio: user.fio || '',
            email: user.email || '',
            phone: user.phone || '',

            iin: user.iin || '',
            is_foreigner: Boolean(user.is_foreigner),

            document_number: user.document_number || '',
            issued_by: user.issued_by || '',
            issued_date: user.issued_date || '',

            is_ip: Boolean(user.is_ip),

            ip_name: user.ip_name || '',
            ip_bin: user.ip_bin || user.bin || '',
            ip_bik: user.ip_bik || user.bik || '',
            ip_iik: user.ip_iik || user.iik || '',
            ip_legal_address: user.ip_legal_address || user.legal_address || '',

            password: '',
            password_confirm: '',
        }));
    }, [user]);

    useEffect(() => {
        let isMounted = true;

        async function loadProfile() {
            try {
                const profile = await getUser();

                if (!isMounted) return;

                setUser(profile);

                setForm((prev) => ({
                    ...prev,
                    fio: profile.fio || '',
                    email:
                        typeof profile.email === 'string' ? profile.email : '',
                    phone: profile.phone || '',

                    iin: profile.iin || '',
                    is_foreigner: toBoolean(profile.is_foreigner),

                    document_number: profile.document_number || '',
                    issued_by: profile.issued_by || '',
                    issued_date: profile.issued_date || '',

                    is_ip: toBoolean(profile.is_ip),

                    ip_name: profile.ip_name || '',
                    ip_bin: profile.ip_bin || profile.bin || '',
                    ip_bik: profile.ip_bik || profile.bik || '',
                    ip_iik: profile.ip_iik || profile.iik || '',
                    ip_legal_address:
                        profile.ip_legal_address || profile.legal_address || '',

                    password: '',
                    password_confirm: '',
                }));
            } catch (error) {
                console.error('Не удалось загрузить профиль водителя:', error);
            }
        }

        loadProfile();

        return () => {
            isMounted = false;
        };
    }, [setUser]);

    return (
        <Paper
            sx={{
                p: {
                    xs: 2,
                    md: 3,
                },

                borderRadius: 4,

                width: '100%',

                maxWidth: 900, // desktop width
            }}
        >
            <Stack spacing={3}>
                {/* TITLE */}
                <Box>
                    <Typography variant='h6' fontWeight={700}>
                        Профиль
                    </Typography>

                    <Typography variant='body2' color='text.secondary' mt={0.5}>
                        Обновите информацию о себе
                    </Typography>
                </Box>

                {/* ALERTS */}
                {error && (
                    <Alert severity='error'>Не удалось обновить профиль.</Alert>
                )}

                {success && (
                    <Alert severity='success'>Профиль успешно обновлён.</Alert>
                )}

                {/* MAIN */}
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            label='ФИО'
                            value={form.fio}
                            onChange={(e) =>
                                handleChange('fio', e.target.value)
                            }
                            fullWidth
                            size='small'
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            label='Email'
                            value={form.email}
                            onChange={(e) =>
                                handleChange('email', e.target.value)
                            }
                            fullWidth
                            size='small'
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            label='Телефон'
                            value={form.phone}
                            onChange={(e) =>
                                handleChange('phone', e.target.value)
                            }
                            fullWidth
                            size='small'
                        />
                    </Grid>

                    {!form.is_foreigner && (
                        <Grid item xs={12} md={6}>
                            <TextField
                                label='ИИН'
                                value={form.iin}
                                onChange={(e) =>
                                    handleChange('iin', e.target.value)
                                }
                                fullWidth
                                size='small'
                            />
                        </Grid>
                    )}

                    <Grid item xs={12} md={6}>
                        <TextField
                            label='Пароль'
                            type='password'
                            value={form.password}
                            onChange={(e) => {
                                setIsPasswordTouched(true);
                                handleChange('password', e.target.value);
                            }}
                            fullWidth
                            size='small'
                            autoComplete='new-password'
                            inputProps={{
                                autoComplete: 'new-password',
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            label='Подтверждение пароля'
                            type='password'
                            value={form.password_confirm}
                            onChange={(e) => {
                                setIsPasswordTouched(true);
                                handleChange(
                                    'password_confirm',
                                    e.target.value,
                                );
                            }}
                            fullWidth
                            size='small'
                            autoComplete='new-password'
                            inputProps={{
                                autoComplete: 'new-password',
                            }}
                        />
                    </Grid>
                </Grid>

                <Divider />

                {/* FOREIGNER */}
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={form.is_foreigner}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    is_foreigner: e.target.checked,
                                    iin: e.target.checked ? '' : prev.iin,
                                }))
                            }
                        />
                    }
                    label='Иностранный гражданин'
                />

                {/* DOCUMENTS ONLY NON FOREIGNERS */}
                {!form.is_foreigner && (
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label='Номер документа'
                                value={form.document_number}
                                onChange={(e) =>
                                    handleChange(
                                        'document_number',
                                        e.target.value,
                                    )
                                }
                                fullWidth
                                size='small'
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                label='Кем выдан'
                                value={form.issued_by}
                                onChange={(e) =>
                                    handleChange('issued_by', e.target.value)
                                }
                                fullWidth
                                size='small'
                            >
                                <MenuItem value='МВД'>МВД</MenuItem>

                                <MenuItem value='МИД'>МИД</MenuItem>

                                <MenuItem value='Нету'>Нету</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                type='date'
                                label='Дата выдачи'
                                value={form.issued_date}
                                onChange={(e) =>
                                    handleChange('issued_date', e.target.value)
                                }
                                fullWidth
                                size='small'
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>
                    </Grid>
                )}

                <Divider />

                {/* IP */}
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={form.is_ip}
                            onChange={(e) =>
                                handleChange('is_ip', e.target.checked)
                            }
                        />
                    }
                    label='Индивидуальный предприниматель'
                />

                {form.is_ip && (
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label='Название ИП'
                                value={form.ip_name}
                                onChange={(e) =>
                                    handleChange('ip_name', e.target.value)
                                }
                                fullWidth
                                size='small'
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                label='БИН'
                                value={form.ip_bin}
                                onChange={(e) =>
                                    handleChange('ip_bin', e.target.value)
                                }
                                fullWidth
                                size='small'
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                label='БИК'
                                value={form.ip_bik}
                                onChange={(e) =>
                                    handleChange('ip_bik', e.target.value)
                                }
                                fullWidth
                                size='small'
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                label='ИИК'
                                value={form.ip_iik}
                                onChange={(e) =>
                                    handleChange('ip_iik', e.target.value)
                                }
                                fullWidth
                                size='small'
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                label='Юридический адрес'
                                value={form.ip_legal_address}
                                onChange={(e) =>
                                    handleChange(
                                        'ip_legal_address',
                                        e.target.value,
                                    )
                                }
                                fullWidth
                                size='small'
                            />
                        </Grid>
                    </Grid>
                )}

                {/* BUTTON */}
                <Button
                    variant='contained'
                    size='large'
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <CircularProgress size={24} color='inherit' />
                    ) : (
                        'Сохранить'
                    )}
                </Button>
            </Stack>
        </Paper>
    );
};
