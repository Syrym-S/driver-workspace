import { Grid, TextField } from '@mui/material';

export function MainFields({ form, onChange, onPasswordChange }) {
    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <TextField
                    label='ФИО'
                    value={form.fio}
                    onChange={(event) => onChange('fio', event.target.value)}
                    fullWidth
                    size='small'
                />
            </Grid>

            <Grid item xs={12} md={6}>
                <TextField
                    label='Email'
                    value={form.email}
                    onChange={(event) => onChange('email', event.target.value)}
                    fullWidth
                    size='small'
                />
            </Grid>

            <Grid item xs={12} md={6}>
                <TextField
                    label='Телефон'
                    value={form.phone}
                    onChange={(event) => onChange('phone', event.target.value)}
                    fullWidth
                    size='small'
                />
            </Grid>

            {!form.is_foreigner && (
                <Grid item xs={12} md={6}>
                    <TextField
                        label='ИИН'
                        value={form.iin}
                        onChange={(event) =>
                            onChange('iin', event.target.value)
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
                    onChange={(event) =>
                        onPasswordChange('password', event.target.value)
                    }
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
                    onChange={(event) =>
                        onPasswordChange('password_confirm', event.target.value)
                    }
                    fullWidth
                    size='small'
                    autoComplete='new-password'
                    inputProps={{
                        autoComplete: 'new-password',
                    }}
                />
            </Grid>
        </Grid>
    );
}
