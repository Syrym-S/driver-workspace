import { useState } from 'react';
import {
    Alert,
    Button,
    CircularProgress,
    Paper,
    Stack,
    Typography,
} from '@mui/material';

import { useApp } from '../../../app/context';
import { acceptLead, startLead } from '../api/api';

function normalizeStatus(status) {
    return String(status || '').toLowerCase();
}

const statusLabels = {
    new: 'Новый',
    accepted: 'Принят',
    started: 'Поездка начата',

    add_driver: 'Водитель назначен',
    start_driver: 'Водитель выехал',
    start_loading: 'Начало погрузки',
    verification_loading: 'Погрузка подтверждена',
    start_unloading: 'Начало разгрузки',
    verification_unloading: 'Разгрузка подтверждена',
    finished: 'Рейс завершён',
};

const Tool = ({
    tripId,
    isStartLeadLoading = false,
    startLeadError = '',
    onStartLead,
    isCargoActionLoading = false,
    onOpenStartLoading,
    onOpenStartUnloading,
}) => {
    const { openLead, setOpenLead } = useApp();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const status = normalizeStatus(openLead?.status);
    const canStartDriver = status === 'add_driver';

    const canStartLoading =
        status === 'start_driver' || status === 'start_loading';

    const canStartUnloading =
        status === 'verification_loading' || status === 'start_unloading';

    const handleAccept = async () => {
        try {
            setLoading(true);
            setError(false);

            await acceptLead({
                lead_id: tripId,
            });

            setOpenLead((prev) => ({
                ...prev,
                status: 'accepted',
            }));
        } catch (e) {
            console.error(e);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const handleStart = async () => {
        try {
            setLoading(true);
            setError(false);

            await startLead({
                lead_id: tripId,
            });

            setOpenLead((prev) => ({
                ...prev,
                status: 'started',
            }));
        } catch (e) {
            console.error(e);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const hasActions =
        status === 'new' ||
        status === 'accepted' ||
        canStartDriver ||
        canStartLoading ||
        canStartUnloading;

    return (
        <Paper
            sx={{
                p: 3,
                borderRadius: 4,
            }}
        >
            <Typography variant='h6' fontWeight={700} mb={2}>
                Действия
            </Typography>

            <Stack spacing={2}>
                {error && (
                    <Alert severity='error'>
                        Не удалось выполнить действие. Попробуйте ещё раз.
                    </Alert>
                )}

                {startLeadError && (
                    <Alert severity='error'>{startLeadError}</Alert>
                )}

                {status === 'verification_unloading' && (
                    <Alert severity='info'>
                        Разгрузка подтверждена. Ожидайте завершения рейса
                        экспедитором.
                    </Alert>
                )}

                {status === 'finished' && (
                    <Alert severity='success'>Рейс завершён.</Alert>
                )}

                {!hasActions &&
                    status !== 'verification_unloading' &&
                    status !== 'finished' &&
                    openLead?.status && (
                        <Alert severity='success'>
                            Для текущего статуса нет доступных действий.
                        </Alert>
                    )}

                {openLead?.status &&
                    status !== 'verification_unloading' &&
                    status !== 'finished' && (
                        <Alert severity='info'>
                            Текущий статус:{' '}
                            {statusLabels[status] || openLead.status}
                        </Alert>
                    )}

                {/* OLD FLOW */}
                {status === 'new' && (
                    <Button
                        variant='contained'
                        color='primary'
                        size='large'
                        disabled={loading}
                        onClick={handleAccept}
                    >
                        {loading ? (
                            <CircularProgress size={24} color='inherit' />
                        ) : (
                            'Принять рейс'
                        )}
                    </Button>
                )}

                {status === 'accepted' && (
                    <Button
                        variant='contained'
                        color='success'
                        size='large'
                        disabled={loading}
                        onClick={handleStart}
                    >
                        {loading ? (
                            <CircularProgress size={24} color='inherit' />
                        ) : (
                            'Начать поездку'
                        )}
                    </Button>
                )}

                {canStartDriver && (
                    <Button
                        variant='contained'
                        color='primary'
                        size='large'
                        disabled={isStartLeadLoading || !onStartLead}
                        onClick={onStartLead}
                    >
                        {isStartLeadLoading ? (
                            <CircularProgress size={24} color='inherit' />
                        ) : (
                            'Водитель выехал'
                        )}
                    </Button>
                )}

                {/* CARGO ACTIONS */}
                {canStartLoading && (
                    <Button
                        variant='contained'
                        color='primary'
                        size='large'
                        disabled={isCargoActionLoading}
                        onClick={onOpenStartLoading}
                    >
                        {isCargoActionLoading ? (
                            <CircularProgress size={24} color='inherit' />
                        ) : status === 'start_driver' ? (
                            'Начать погрузку'
                        ) : (
                            'Добавить файлы погрузки'
                        )}
                    </Button>
                )}

                {canStartUnloading && (
                    <Button
                        variant='contained'
                        color='primary'
                        size='large'
                        disabled={isCargoActionLoading}
                        onClick={onOpenStartUnloading}
                    >
                        {isCargoActionLoading ? (
                            <CircularProgress size={24} color='inherit' />
                        ) : status === 'verification_loading' ? (
                            'Начать разгрузку'
                        ) : (
                            'Добавить файлы разгрузки'
                        )}
                    </Button>
                )}
            </Stack>
        </Paper>
    );
};

export default Tool;
