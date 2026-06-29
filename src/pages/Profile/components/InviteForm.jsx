import { useState } from 'react';

import {
    Paper,
    Typography,
    TextField,
    Button,
    Stack,
    Alert,
    CircularProgress,
} from '@mui/material';

import { insertInvite } from '../api';

export const InviteForm = () => {
    const [invite, setInvite] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError(false);
            setSuccess(false);

            await insertInvite({
                invite,
            });

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
                borderRadius: {
                    xs: 2.5,
                    md: 4,
                },
                width: '100%',
                maxWidth: 900,
                mx: 'auto',
                boxSizing: 'border-box',
                overflow: 'hidden',
            }}
        >
            <Stack spacing={2}>
                <Typography variant='h6' fontWeight={700}>
                    Код приглашения
                </Typography>

                {error && (
                    <Alert severity='error'>
                        Не удалось активировать приглашение.
                    </Alert>
                )}

                {success && (
                    <Alert severity='success'>
                        Приглашение успешно активировано.
                    </Alert>
                )}

                <TextField
                    label='Invite code'
                    value={invite}
                    onChange={(e) => setInvite(e.target.value)}
                    fullWidth
                />

                <Button
                    variant='contained'
                    onClick={handleSubmit}
                    disabled={loading}
                    sx={{
                        width: {
                            xs: '100%',
                            sm: 'auto',
                        },
                        alignSelf: {
                            xs: 'stretch',
                            sm: 'flex-start',
                        },
                    }}
                >
                    {loading ? (
                        <CircularProgress size={24} color='inherit' />
                    ) : (
                        'Активировать'
                    )}
                </Button>
            </Stack>
        </Paper>
    );
};
