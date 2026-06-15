import { useState } from 'react';

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

import { updateuser } from '../api';

export const UpdateForm = () => {
    const { user, setUser } = useApp();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);

    const [form, setForm] = useState({
        fio: user?.fio || '',
        email: user?.email || '',
        password: '',
        password_confirm: '',

        iin: user?.iin || '',

        is_foreigner: !!user?.is_foreigner,

        document_number:
            user?.document_number || '',

        issued_by:
            user?.issued_by || '',

        issued_date:
            user?.issued_date || '',

        is_ip: !!user?.is_ip,

        ip_name:
            user?.ip_name || '',
    });

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

            await updateuser(form);

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
                    <Typography
                        variant="h6"
                        fontWeight={700}
                    >
                        Профиль
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        mt={0.5}
                    >
                        Обновите информацию о себе
                    </Typography>
                </Box>

                {/* ALERTS */}
                {error && (
                    <Alert severity="error">
                        Не удалось обновить профиль.
                    </Alert>
                )}

                {success && (
                    <Alert severity="success">
                        Профиль успешно обновлён.
                    </Alert>
                )}

                {/* MAIN */}
                <Grid
                    container
                    spacing={2}
                >
                    <Grid item xs={12}>
                        <TextField
                            label="ФИО"
                            value={form.fio}
                            onChange={(e) =>
                                handleChange(
                                    'fio',
                                    e.target.value
                                )
                            }
                            fullWidth
                            size="small"
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Email"
                            value={form.email}
                            onChange={(e) =>
                                handleChange(
                                    'email',
                                    e.target.value
                                )
                            }
                            fullWidth
                            size="small"
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            label="ИИН"
                            value={form.iin}
                            onChange={(e) =>
                                handleChange(
                                    'iin',
                                    e.target.value
                                )
                            }
                            fullWidth
                            size="small"
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Пароль"
                            type="password"
                            value={form.password}
                            onChange={(e) =>
                                handleChange(
                                    'password',
                                    e.target.value
                                )
                            }
                            fullWidth
                            size="small"
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Подтверждение пароля"
                            type="password"
                            value={form.password_confirm}
                            onChange={(e) =>
                                handleChange(
                                    'password_confirm',
                                    e.target.value
                                )
                            }
                            fullWidth
                            size="small"
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
                                handleChange(
                                    'is_foreigner',
                                    e.target.checked
                                )
                            }
                        />
                    }
                    label="Иностранный гражданин"
                />

                {/* DOCUMENTS ONLY NON FOREIGNERS */}
                {!form.is_foreigner && (
                    <Grid
                        container
                        spacing={2}
                    >
                        <Grid item xs={12}>
                            <TextField
                                label="Номер документа"
                                value={form.document_number}
                                onChange={(e) =>
                                    handleChange(
                                        'document_number',
                                        e.target.value
                                    )
                                }
                                fullWidth
                                size="small"
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                label="Кем выдан"
                                value={form.issued_by}
                                onChange={(e) =>
                                    handleChange(
                                        'issued_by',
                                        e.target.value
                                    )
                                }
                                fullWidth
                                size="small"
                            >
                                <MenuItem value="МВД">
                                    МВД
                                </MenuItem>

                                <MenuItem value="МИД">
                                    МИД
                                </MenuItem>

                                <MenuItem value="Нету">
                                    Нету
                                </MenuItem>
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                type="date"
                                label="Дата выдачи"
                                value={form.issued_date}
                                onChange={(e) =>
                                    handleChange(
                                        'issued_date',
                                        e.target.value
                                    )
                                }
                                fullWidth
                                size="small"
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
                                handleChange(
                                    'is_ip',
                                    e.target.checked
                                )
                            }
                        />
                    }
                    label="Индивидуальный предприниматель"
                />

                {form.is_ip && (
                    <TextField
                        label="Название ИП"
                        value={form.ip_name}
                        onChange={(e) =>
                            handleChange(
                                'ip_name',
                                e.target.value
                            )
                        }
                        fullWidth
                        size="small"
                    />
                )}

                {/* BUTTON */}
                <Button
                    variant="contained"
                    size="large"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <CircularProgress
                            size={24}
                            color="inherit"
                        />
                    ) : (
                        'Сохранить'
                    )}
                </Button>
            </Stack>
        </Paper>
    );
};