import { useEffect, useState } from 'react';
import { useApp } from '../app/context';
import { getUser } from './Profile/api';
import { InviteForm } from './Profile/components/InviteForm';
import { UpdateForm } from './Profile/components/UpdateForm';
import { Alert, Box, Button, CircularProgress, Stack } from '@mui/material';

export default function Profile() {
    const { user, setUser } = useApp();
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    // Запрос на данные пользователя
    const fetchUser = async () => {
        try {
            setError(false);
            setLoading(true);

            const res = await getUser();

            setUser(res?.data || null);
        } catch (e) {
            console.error(e);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    // LOADING
    if (loading) {
        return (
            <Box
                display='flex'
                justifyContent='center'
                alignItems='center'
                minHeight='60vh'
            >
                <CircularProgress />
            </Box>
        );
    }

    // ERROR
    if (error) {
        return (
            <Box p={2}>
                <Alert
                    severity='error'
                    action={
                        <Button
                            color='inherit'
                            size='small'
                            onClick={fetchUser}
                        >
                            Повторить
                        </Button>
                    }
                >
                    Не удалось загрузить информацию о пользователе.
                </Alert>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                width: '100%',
                maxWidth: 900,
                mx: 'auto',
                px: {
                    xs: 2,
                    sm: 3,
                    md: 0,
                },
                py: {
                    xs: 2,
                    md: 3,
                },
                boxSizing: 'border-box',
            }}
        >
            <Stack
                spacing={{
                    xs: 2,
                    md: 3,
                }}
                sx={{
                    width: '100%',
                    minWidth: 0,
                }}
            >
                <InviteForm />
                <UpdateForm />
            </Stack>
        </Box>
    );
}
