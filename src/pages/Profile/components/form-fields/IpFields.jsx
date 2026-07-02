import { Checkbox, FormControlLabel, Grid, TextField } from '@mui/material';

export function IpFields({ form, onChange }) {
    return (
        <>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={form.is_ip}
                        onChange={(event) =>
                            onChange('is_ip', event.target.checked)
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
                            onChange={(event) =>
                                onChange('ip_name', event.target.value)
                            }
                            fullWidth
                            size='small'
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            label='БИН'
                            value={form.ip_bin}
                            onChange={(event) =>
                                onChange('ip_bin', event.target.value)
                            }
                            fullWidth
                            size='small'
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            label='БИК'
                            value={form.ip_bik}
                            onChange={(event) =>
                                onChange('ip_bik', event.target.value)
                            }
                            fullWidth
                            size='small'
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            label='ИИК'
                            value={form.ip_iik}
                            onChange={(event) =>
                                onChange('ip_iik', event.target.value)
                            }
                            fullWidth
                            size='small'
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            label='Юридический адрес'
                            value={form.ip_legal_address}
                            onChange={(event) =>
                                onChange('ip_legal_address', event.target.value)
                            }
                            fullWidth
                            size='small'
                        />
                    </Grid>
                </Grid>
            )}
        </>
    );
}
