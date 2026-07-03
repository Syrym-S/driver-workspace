import { useEffect, useState } from 'react';

import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Stack,
    Typography,
} from '@mui/material';

import {
    getIsEmailVerified,
    openEmailVerificationModal,
    subscribeToEmailVerificationStatusChanged,
} from '../model/email-verification.helpers';
import { fetchEmailVerificationStatus } from '../api/email-verification.api';

export function EmailVerificationStatus() {
    const [isVerified, setIsVerified] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState('');

    async function loadStatus() {
        try {
            setIsLoading(true);
            setLoadError('');

            const response = await fetchEmailVerificationStatus();

            setIsVerified(getIsEmailVerified(response));
        } catch (error) {
            setLoadError(
                error.response?.data?.message ||
                    error.response?.data?.error ||
                    error.message ||
                    'Не удалось проверить статус email',
            );
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadStatus();

        return subscribeToEmailVerificationStatusChanged((event) => {
            setIsVerified(Boolean(event.detail?.isVerified));
        });
    }, []);

    return (
        <Box
            sx={{
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                backgroundColor: 'background.default',
            }}
        >
            <Stack
                direction={{
                    xs: 'column',
                    sm: 'row',
                }}
                spacing={1.5}
                alignItems={{
                    xs: 'stretch',
                    sm: 'center',
                }}
                justifyContent='space-between'
                sx={{
                    width: '100%',
                    minWidth: 0,
                }}
            >
                <Box
                    sx={{
                        flex: 1,
                        minWidth: 0,
                    }}
                >
                    <Typography fontWeight={600}>Статус email</Typography>

                    {isVerified === false && (
                        <Typography
                            color='text.secondary'
                            fontSize={14}
                            sx={{ mt: 0.25 }}
                        >
                            Подтверждение электронной почты аккаунта
                        </Typography>
                    )}
                </Box>

                <Stack
                    direction='row'
                    alignItems='center'
                    justifyContent={{
                        xs: 'flex-start',
                        sm: 'flex-end',
                    }}
                    sx={{
                        width: {
                            xs: '100%',
                            sm: 'auto',
                        },
                        flexShrink: 0,
                        alignSelf: {
                            xs: 'stretch',
                            sm: 'center',
                        },
                        gap: 1,

                        '@media (max-width: 399px)': {
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                        },
                    }}
                >
                    {isLoading && <CircularProgress size={20} />}

                    {!isLoading && isVerified === true && (
                        <Chip
                            label='Подтверждён'
                            color='success'
                            variant='outlined'
                            size='small'
                        />
                    )}

                    {!isLoading && isVerified === false && (
                        <>
                            <Chip
                                label='Не подтверждён'
                                color='warning'
                                variant='outlined'
                                size='small'
                                sx={{
                                    flexShrink: 0,
                                }}
                            />

                            <Button
                                size='small'
                                variant='outlined'
                                onClick={openEmailVerificationModal}
                                sx={{
                                    flexShrink: 0,
                                    alignSelf: {
                                        xs: 'flex-start',
                                        sm: 'center',
                                    },
                                    minWidth: 'auto',
                                    height: 28,
                                    minHeight: 28,
                                    px: 1.5,
                                    py: 0,
                                    whiteSpace: 'nowrap',
                                    lineHeight: 1,
                                }}
                            >
                                Подробнее
                            </Button>
                        </>
                    )}
                </Stack>
            </Stack>

            {loadError && (
                <Alert severity='error' sx={{ mt: 1.5 }}>
                    {loadError}
                </Alert>
            )}
        </Box>
    );
}
