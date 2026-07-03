import {
    Box,
    Checkbox,
    FormControlLabel,
    MenuItem,
    TextField,
} from '@mui/material';

export function DocumentsFields({ form, onChange, onForeignerChange }) {
    return (
        <>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={form.is_foreigner}
                        onChange={(event) =>
                            onForeignerChange(event.target.checked)
                        }
                    />
                }
                label='Иностранный гражданин'
            />

            {!form.is_foreigner && (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            md: 'repeat(2, minmax(0, 1fr))',
                        },
                        gap: 2,
                        width: '100%',
                        minWidth: 0,
                    }}
                >
                    <TextField
                        label='Номер документа'
                        value={form.document_number}
                        onChange={(event) =>
                            onChange('document_number', event.target.value)
                        }
                        fullWidth
                        size='small'
                    />

                    <TextField
                        label='Страна выдачи'
                        value={form.issue_country}
                        onChange={(event) =>
                            onChange('issue_country', event.target.value)
                        }
                        fullWidth
                        size='small'
                    />

                    <TextField
                        type='date'
                        label='Дата выдачи'
                        value={form.issued_date}
                        onChange={(event) =>
                            onChange('issued_date', event.target.value)
                        }
                        fullWidth
                        size='small'
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </Box>
            )}
        </>
    );
}
