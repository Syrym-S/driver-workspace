import { useEffect, useState } from 'react';

import {
    Box,
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
} from '@mui/material';
import MarkEmailUnreadRoundedIcon from '@mui/icons-material/MarkEmailUnreadRounded';
import { resendEmailVerification } from '../api/email-verification.api';
import {
    getEmailVerificationCooldownLeft,
    getResendVerificationMessage,
    startEmailVerificationCooldown,
} from '../model/email-verification.helpers';

export function EmailVerificationModal({ open, onClose }) {
    const [isSending, setIsSending] = useState(false);
    const [sendError, setSendError] = useState('');
    const [sendSuccess, setSendSuccess] = useState('');
    const [cooldownLeft, setCooldownLeft] = useState(0);

    async function handleResendVerification() {
        if (cooldownLeft > 0 || isSending) {
            return;
        }

        try {
            setIsSending(true);
            setSendError('');
            setSendSuccess('');

            const response = await resendEmailVerification();

            setSendSuccess(getResendVerificationMessage(response));
            setCooldownLeft(startEmailVerificationCooldown());
        } catch (error) {
            setSendError(
                error.response?.data?.message ||
                    error.response?.data?.error ||
                    error.message ||
                    'Не удалось отправить письмо подтверждения',
            );
        } finally {
            setIsSending(false);
        }
    }

    useEffect(() => {
        if (!open) {
            return undefined;
        }

        setCooldownLeft(getEmailVerificationCooldownLeft());

        const intervalId = window.setInterval(() => {
            setCooldownLeft(getEmailVerificationCooldownLeft());
        }, 1000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [open]);

    useEffect(() => {
        if (!open) {
            setSendError('');
            setSendSuccess('');
        }
    }, [open]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth='xs'>
            <DialogTitle sx={{ px: 3, pt: 3, pb: 1 }}>
                <Stack direction='row' spacing={1.75} alignItems='center'>
                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'warning.light',
                            color: 'warning.contrastText',
                            flexShrink: 0,
                        }}
                    >
                        <MarkEmailUnreadRoundedIcon />
                    </Box>

                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            variant='h6'
                            component='div'
                            sx={{
                                fontWeight: 500,
                                fontSize: {
                                    xs: 18,
                                    sm: 20,
                                },
                                lineHeight: 1.25,
                            }}
                        >
                            Email не подтверждён
                        </Typography>

                        <Typography
                            component='div'
                            color='text.secondary'
                            sx={{
                                mt: 0.5,
                                fontSize: 13,
                                lineHeight: 1.4,
                            }}
                        >
                            Подтвердите почту, чтобы завершить настройку
                            аккаунта
                        </Typography>
                    </Box>
                </Stack>
            </DialogTitle>

            <DialogContent>
                <Stack spacing={2}>
                    <Alert
                        severity='warning'
                        variant='outlined'
                        sx={{
                            borderRadius: 2,
                        }}
                    >
                        Мы отправим письмо со ссылкой подтверждения на вашу
                        почту.
                    </Alert>

                    {cooldownLeft > 0 && (
                        <Typography color='text.secondary' fontSize={13}>
                            Повторная отправка будет доступна через{' '}
                            {cooldownLeft} сек.
                        </Typography>
                    )}

                    {sendError && <Alert severity='error'>{sendError}</Alert>}

                    {sendSuccess && (
                        <Alert severity='success'>{sendSuccess}</Alert>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} disabled={isSending}>
                    Закрыть
                </Button>

                <Button
                    variant='contained'
                    onClick={handleResendVerification}
                    disabled={isSending || cooldownLeft > 0}
                    sx={{
                        minWidth: 156,
                    }}
                >
                    {isSending
                        ? 'Отправка...'
                        : cooldownLeft > 0
                          ? `Через ${cooldownLeft} сек`
                          : 'Отправить письмо'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
