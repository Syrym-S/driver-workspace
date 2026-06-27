import { useCallback, useEffect, useMemo, useState } from 'react';

import {
    Alert,
    Box,
    CircularProgress,
    Divider,
    Drawer,
    IconButton,
    ListItemButton,
    ListItemText,
    Pagination,
    Stack,
    Typography,
} from '@mui/material';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';

import { fetchDriverNotificationsApi } from '../api/notifications.api';
import {
    formatNotificationDate,
    getNotificationCreatedAt,
    getNotificationDescription,
    getNotificationId,
    getNotificationTitle,
    isNotificationUnread,
    normalizeNotificationsResponse,
} from '../model/notifications.helpers';

const PER_PAGE = 10;

export function NotificationsColumn({
    open,
    onClose,
    onOpenNotificationDetails,
    refreshKey = 0,
}) {
    const [notifications, setNotifications] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const pageCount = useMemo(
        () => Math.max(1, Math.ceil(total / PER_PAGE)),
        [total],
    );

    const loadNotifications = useCallback(
        async ({ withLoader = true, nextPage = page } = {}) => {
            try {
                if (withLoader) {
                    setIsLoading(true);
                }

                setError('');

                const response = await fetchDriverNotificationsApi({
                    page: nextPage,
                    perPage: PER_PAGE,
                });

                const nextNotifications =
                    normalizeNotificationsResponse(response);

                setNotifications(nextNotifications);
                setTotal(Number(response?.total || response?.count || 0));
                setPage(Number(response?.page || nextPage));
            } catch (requestError) {
                setError(
                    requestError.response?.data?.message ||
                        requestError.response?.data?.error ||
                        requestError.message ||
                        'Не удалось загрузить уведомления',
                );
            } finally {
                if (withLoader) {
                    setIsLoading(false);
                }
            }
        },
        [page],
    );

    function handlePageChange(_, nextPage) {
        loadNotifications({
            nextPage,
            withLoader: true,
        });
    }

    function handleRefresh() {
        loadNotifications({
            nextPage: page,
            withLoader: true,
        });
    }

    function handleOpenDetails(notification) {
        onOpenNotificationDetails(notification);
    }

    useEffect(() => {
        if (!open) {
            return;
        }

        loadNotifications({
            nextPage: page,
            withLoader: true,
        });
    }, [open, page, refreshKey, loadNotifications]);

    return (
        <Drawer
            anchor='right'
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    sx: {
                        width: {
                            xs: '100%',
                            sm: 420,
                        },
                        maxWidth: '100vw',
                    },
                },
            }}
        >
            <Box
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <Box
                    sx={{
                        px: 2,
                        py: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1,
                    }}
                >
                    <Box>
                        <Typography fontWeight={700}>
                            Все уведомления
                        </Typography>

                        <Typography variant='body2' color='text.secondary'>
                            Последние события по вашим заявкам и тендерам
                        </Typography>
                    </Box>

                    <Stack direction='row' spacing={0.5}>
                        <IconButton
                            size='small'
                            onClick={handleRefresh}
                            disabled={isLoading}
                            aria-label='Обновить уведомления'
                        >
                            <RefreshRoundedIcon fontSize='small' />
                        </IconButton>

                        <IconButton
                            size='small'
                            onClick={onClose}
                            aria-label='Закрыть'
                        >
                            <CloseRoundedIcon fontSize='small' />
                        </IconButton>
                    </Stack>
                </Box>

                <Divider />

                <Box
                    sx={{
                        flex: 1,
                        overflowY: 'auto',
                    }}
                >
                    {isLoading ? (
                        <Box
                            sx={{
                                py: 5,
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                        >
                            <CircularProgress size={28} />
                        </Box>
                    ) : error ? (
                        <Box sx={{ p: 2 }}>
                            <Alert severity='error'>{error}</Alert>
                        </Box>
                    ) : notifications.length === 0 ? (
                        <Box sx={{ p: 2 }}>
                            <Typography color='text.secondary'>
                                Уведомлений пока нет
                            </Typography>
                        </Box>
                    ) : (
                        notifications.map((notification, index) => {
                            const notificationId =
                                getNotificationId(notification);
                            const isUnread = isNotificationUnread(notification);

                            return (
                                <ListItemButton
                                    key={notificationId || `${page}-${index}`}
                                    onClick={() =>
                                        handleOpenDetails(notification)
                                    }
                                    sx={{
                                        alignItems: 'flex-start',
                                        gap: 1,
                                        py: 1.4,
                                        px: 2,
                                        whiteSpace: 'normal',
                                        borderBottom: '1px solid',
                                        borderColor: 'divider',
                                        backgroundColor: isUnread
                                            ? 'rgba(25, 118, 210, 0.06)'
                                            : 'transparent',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 8,
                                            height: 8,
                                            mt: 0.75,
                                            borderRadius: '50%',
                                            backgroundColor: isUnread
                                                ? 'primary.main'
                                                : 'transparent',
                                            flexShrink: 0,
                                        }}
                                    />

                                    <ListItemText
                                        primary={
                                            <Typography
                                                fontWeight={600}
                                                sx={{ fontSize: 14 }}
                                            >
                                                {getNotificationTitle(
                                                    notification,
                                                )}
                                            </Typography>
                                        }
                                        secondary={
                                            <Box>
                                                <Typography
                                                    component='span'
                                                    color='text.secondary'
                                                    sx={{
                                                        display: 'block',
                                                        fontSize: 13,
                                                        lineHeight: 1.35,
                                                    }}
                                                >
                                                    {getNotificationDescription(
                                                        notification,
                                                    )}
                                                </Typography>

                                                <Typography
                                                    component='span'
                                                    color='text.disabled'
                                                    sx={{
                                                        display: 'block',
                                                        mt: 0.5,
                                                        fontSize: 12,
                                                    }}
                                                >
                                                    {formatNotificationDate(
                                                        getNotificationCreatedAt(
                                                            notification,
                                                        ),
                                                    )}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </ListItemButton>
                            );
                        })
                    )}
                </Box>

                <Divider />

                <Box
                    sx={{
                        p: 2,
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <Pagination
                        page={page}
                        count={pageCount}
                        onChange={handlePageChange}
                        color='primary'
                        shape='rounded'
                        disabled={isLoading}
                    />
                </Box>
            </Box>
        </Drawer>
    );
}
