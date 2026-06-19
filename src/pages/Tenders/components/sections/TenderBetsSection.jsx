import { useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';

import { TenderDetailsSection } from './TenderDetailsSection';
import { TenderInfoBadge } from '../tender-details/TenderInfoBadge';

const confirmActionConfig = {
    create: {
        title: 'Поставить ставку',
        text: 'Вы уверены, что хотите поставить ставку на этот тендер?',
        confirmText: 'Поставить ставку',
        loadingText: 'Отправка...',
        color: 'primary',
    },
    cancel: {
        title: 'Отменить ставку',
        text: 'Вы уверены, что хотите отменить свою ставку?',
        confirmText: 'Отменить ставку',
        loadingText: 'Отмена...',
        color: 'error',
    },
};

const betStatusLabels = {
    new: 'Новая',
    winning: 'Выбрана',
    loss: 'Отклонена',
    closed: 'Отменена',
};

const betStatusColors = {
    new: 'primary',
    winning: 'success',
    loss: 'error',
    closed: 'default',
};

function formatMoney(amount, currency = 'KZT') {
    if (amount === null || amount === undefined || amount === '') {
        return 'Не указано';
    }

    return `${Number(amount).toLocaleString('ru-RU')} ${currency}`;
}

export function TenderBetsSection({
    tender,
    isActionLoading = false,
    actionError = '',
    onCreateBet,
    onCancelBet,
}) {
    const [amount, setAmount] = useState('');
    const [comment, setComment] = useState('');
    const [confirmAction, setConfirmAction] = useState(null);
    const [pendingBetPayload, setPendingBetPayload] = useState(null);

    const bets = tender.bets || [];
    const ownBet =
        tender.ownBet ||
        bets.find((bet) => bet.isOwn && bet.status !== 'closed');

    const canCreateBet = tender.status === 'active' && !ownBet;
    const canCancelBet =
        tender.status === 'active' && ownBet && ownBet.status === 'new';

    function handleRequestCreateBet() {
        const normalizedAmount = Number(amount);

        if (!normalizedAmount || normalizedAmount <= 0) {
            return;
        }

        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        setPendingBetPayload({
            amount: normalizedAmount,
            currency: 'KZT',
            comment,
        });

        setConfirmAction('create');
    }

    function handleRequestCancelBet() {
        if (
            !ownBet ||
            ownBet.betIndex === null ||
            ownBet.betIndex === undefined
        ) {
            return;
        }

        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        setConfirmAction('cancel');
    }

    function handleCloseConfirm() {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        setConfirmAction(null);
        setPendingBetPayload(null);
    }

    async function handleConfirmAction() {
        if (!confirmAction) {
            return;
        }

        if (confirmAction === 'create') {
            const isSuccess = await onCreateBet?.(pendingBetPayload);

            if (isSuccess !== false) {
                setAmount('');
                setComment('');
                handleCloseConfirm();
            }

            return;
        }

        if (confirmAction === 'cancel') {
            const isSuccess = await onCancelBet?.(ownBet.betIndex);

            if (isSuccess !== false) {
                handleCloseConfirm();
            }
        }
    }

    return (
        <>
            <TenderDetailsSection
                icon={<LocalOfferOutlinedIcon />}
                title='Ставка водителя'
                subtitle='Вы можете предложить свою цену перевозки'
            >
                <Stack spacing={1.5}>
                    {actionError && (
                        <Alert severity='error'>{actionError}</Alert>
                    )}

                    {ownBet ? (
                        <Box
                            sx={{
                                p: 1.5,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                backgroundColor: 'grey.50',
                            }}
                        >
                            <Stack spacing={1.5}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        gap: 1,
                                        flexWrap: 'wrap',
                                    }}
                                >
                                    <Box>
                                        <Typography fontWeight={700}>
                                            Ваша ставка
                                        </Typography>

                                        <Typography
                                            color='text.secondary'
                                            sx={{ fontSize: 13 }}
                                        >
                                            {ownBet.comment ||
                                                'Без комментария'}
                                        </Typography>
                                    </Box>

                                    <Chip
                                        label={
                                            betStatusLabels[ownBet.status] ||
                                            ownBet.status
                                        }
                                        color={
                                            betStatusColors[ownBet.status] ||
                                            'default'
                                        }
                                        size='small'
                                        variant='outlined'
                                        sx={{ borderRadius: 999 }}
                                    />
                                </Box>

                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: {
                                            xs: '1fr',
                                            sm: 'repeat(2, 1fr)',
                                        },
                                        gap: 1,
                                    }}
                                >
                                    <TenderInfoBadge
                                        label='Сумма'
                                        value={formatMoney(
                                            ownBet.amount,
                                            ownBet.currency,
                                        )}
                                        accent
                                    />

                                    <TenderInfoBadge
                                        label='Статус'
                                        value={
                                            betStatusLabels[ownBet.status] ||
                                            ownBet.status
                                        }
                                    />
                                </Box>

                                {canCancelBet && (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'flex-end',
                                        }}
                                    >
                                        <Button
                                            color='error'
                                            variant='outlined'
                                            onClick={handleRequestCancelBet}
                                            disabled={isActionLoading}
                                        >
                                            Отменить ставку
                                        </Button>
                                    </Box>
                                )}
                            </Stack>
                        </Box>
                    ) : (
                        <Box
                            sx={{
                                p: 1.5,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                backgroundColor: 'grey.50',
                            }}
                        >
                            {canCreateBet ? (
                                <Stack spacing={1.5}>
                                    <TextField
                                        label='Ваша ставка'
                                        type='number'
                                        value={amount}
                                        onChange={(event) =>
                                            setAmount(event.target.value)
                                        }
                                        fullWidth
                                        size='small'
                                        slotProps={{
                                            htmlInput: {
                                                min: 1,
                                            },
                                        }}
                                    />

                                    <TextField
                                        label='Комментарий'
                                        value={comment}
                                        onChange={(event) =>
                                            setComment(event.target.value)
                                        }
                                        fullWidth
                                        multiline
                                        minRows={2}
                                        size='small'
                                    />

                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'flex-end',
                                        }}
                                    >
                                        <Button
                                            variant='contained'
                                            onClick={handleRequestCreateBet}
                                            disabled={
                                                isActionLoading ||
                                                !amount ||
                                                Number(amount) <= 0
                                            }
                                        >
                                            Поставить ставку
                                        </Button>
                                    </Box>
                                </Stack>
                            ) : (
                                <Typography
                                    color='text.secondary'
                                    sx={{ fontSize: 14 }}
                                >
                                    Ставка недоступна для текущего статуса
                                    тендера.
                                </Typography>
                            )}
                        </Box>
                    )}
                </Stack>
            </TenderDetailsSection>
            <Dialog open={Boolean(confirmAction)} onClose={handleCloseConfirm}>
                <DialogTitle>
                    {confirmActionConfig[confirmAction]?.title}
                </DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        {confirmActionConfig[confirmAction]?.text}
                    </DialogContentText>

                    {confirmAction === 'create' && pendingBetPayload && (
                        <Box sx={{ mt: 2 }}>
                            <Typography fontWeight={700}>
                                Сумма:{' '}
                                {pendingBetPayload.amount.toLocaleString(
                                    'ru-RU',
                                )}{' '}
                                {pendingBetPayload.currency}
                            </Typography>

                            {pendingBetPayload.comment && (
                                <Typography
                                    color='text.secondary'
                                    sx={{ mt: 0.5 }}
                                >
                                    Комментарий: {pendingBetPayload.comment}
                                </Typography>
                            )}
                        </Box>
                    )}

                    {confirmAction === 'cancel' && ownBet && (
                        <Box sx={{ mt: 2 }}>
                            <Typography fontWeight={700}>
                                Текущая ставка:{' '}
                                {ownBet.amount?.toLocaleString('ru-RU')}{' '}
                                {ownBet.currency || 'KZT'}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={handleCloseConfirm}
                        disabled={isActionLoading}
                    >
                        Отмена
                    </Button>

                    <Button
                        color={confirmActionConfig[confirmAction]?.color}
                        variant='contained'
                        onClick={handleConfirmAction}
                        disabled={isActionLoading}
                    >
                        {isActionLoading
                            ? confirmActionConfig[confirmAction]?.loadingText
                            : confirmActionConfig[confirmAction]?.confirmText}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
