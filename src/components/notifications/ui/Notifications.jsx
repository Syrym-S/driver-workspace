import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Badge,
    Box,
    CircularProgress,
    Divider,
    IconButton,
    ListItemText,
    Menu,
    MenuItem,
    Typography,
} from '@mui/material';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import {
    formatNotificationDate,
    getNotificationCreatedAt,
    getNotificationDescription,
    getNotificationId,
    getNotificationTitle,
    isNotificationUnread,
    normalizeNotificationDetailsResponse,
    normalizeNotificationsResponse,
} from '../model/notifications.helpers';
import {
    fetchCustomerNotificationByIdApi,
    fetchCustomerNotificationsApi,
} from '../api/notifications.api';
import { NotificationDetailsModal } from './NotificationDetailsModal';
import {
    isNotificationWsConfigured,
    openNotificationWsConnection,
} from '../lib/open-notification-ws-connection';

export function Notifications() {
    const [anchorEl, setAnchorEl] = useState(null);

    const [notifications, setNotifications] = useState([]);
    const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);
    const [notificationsError, setNotificationsError] = useState('');

    const [selectedNotification, setSelectedNotification] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState('');

    const notificationWsConnectionRef = useRef(null);

    const isMenuOpen = Boolean(anchorEl);

    const unreadNotificationsCount =
        notifications.filter(isNotificationUnread).length;

    function blurActiveElement() {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
    }

    async function loadNotifications({ withLoader = false } = {}) {
        try {
            if (withLoader) {
                setIsNotificationsLoading(true);
            }

            setNotificationsError('');

            const response = await fetchCustomerNotificationsApi();
            const nextNotifications = normalizeNotificationsResponse(response);

            setNotifications(nextNotifications);
        } catch (error) {
            setNotificationsError(
                error.response?.data?.message ||
                    error.response?.data?.error ||
                    error.message ||
                    'Не удалось загрузить уведомления',
            );
        } finally {
            if (withLoader) {
                setIsNotificationsLoading(false);
            }
        }
    }

    function handleOpenMenu(event) {
        const anchorElement = event.currentTarget;

        anchorElement.blur();
        setAnchorEl(anchorElement);

        loadNotifications({ withLoader: true });
    }

    function handleCloseMenu() {
        blurActiveElement();
        setAnchorEl(null);
    }

    async function handleOpenNotificationDetails(notification) {
        const notificationId = getNotificationId(notification);

        if (!notificationId) {
            return;
        }

        handleCloseMenu();

        setSelectedNotification(notification);
        setIsDetailsOpen(true);
        setDetailsError('');

        try {
            setIsDetailsLoading(true);

            const response =
                await fetchCustomerNotificationByIdApi(notificationId);

            const notificationDetails =
                normalizeNotificationDetailsResponse(response);

            setSelectedNotification(notificationDetails || notification);
        } catch (error) {
            setDetailsError(
                error.response?.data?.message ||
                    error.response?.data?.error ||
                    error.message ||
                    'Не удалось загрузить уведомление',
            );
        } finally {
            setIsDetailsLoading(false);
        }
    }

    function handleCloseDetails() {
        if (isDetailsLoading) {
            return;
        }

        setIsDetailsOpen(false);
        setSelectedNotification(null);
        setDetailsError('');
    }

    useEffect(() => {
        let isCancelled = false;

        async function loadInitialNotifications() {
            try {
                const response = await fetchCustomerNotificationsApi();

                if (!isCancelled) {
                    setNotifications(normalizeNotificationsResponse(response));
                }
            } catch (error) {
                if (!isCancelled) {
                    setNotificationsError(
                        error.response?.data?.message ||
                            error.response?.data?.error ||
                            error.message ||
                            'Не удалось загрузить уведомления',
                    );
                }
            }
        }

        loadInitialNotifications();

        return () => {
            isCancelled = true;
        };
    }, []);

    useEffect(() => {
        notificationWsConnectionRef.current?.close();
        notificationWsConnectionRef.current = null;

        if (!isNotificationWsConfigured()) {
            console.info(
                'NotificationWS is not configured for this environment',
            );
            return;
        }

        const connection = openNotificationWsConnection({
            onOpen: () => {
                console.info('NotificationWS opened');
            },

            onClose: (event) => {
                console.info('NotificationWS closed', event);
            },

            onError: (error) => {
                console.error('NotificationWS error', error);
            },

            onAuthFailed: (payload) => {
                console.error('NotificationWS auth failed', payload);
            },

            onNotification: (notification) => {
                setNotifications((prevNotifications) => {
                    const notificationId = getNotificationId(notification);

                    if (
                        notificationId &&
                        prevNotifications.some(
                            (item) =>
                                getNotificationId(item) === notificationId,
                        )
                    ) {
                        return prevNotifications.map((item) =>
                            getNotificationId(item) === notificationId
                                ? {
                                      ...item,
                                      ...notification,
                                  }
                                : item,
                        );
                    }

                    return [
                        {
                            is_viewed: false,
                            ...notification,
                        },
                        ...prevNotifications,
                    ];
                });
            },
        });

        notificationWsConnectionRef.current = connection;

        return () => {
            connection.close();

            if (notificationWsConnectionRef.current === connection) {
                notificationWsConnectionRef.current = null;
            }
        };
    }, []);

    return (
        <>
            <IconButton
                color='inherit'
                onClick={handleOpenMenu}
                aria-label='Уведомления'
            >
                <Badge
                    badgeContent={unreadNotificationsCount}
                    color='error'
                    invisible={unreadNotificationsCount === 0}
                >
                    <NotificationsNoneOutlinedIcon />
                </Badge>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={isMenuOpen}
                onClose={handleCloseMenu}
                slotProps={{
                    paper: {
                        sx: {
                            width: 360,
                            maxWidth: 'calc(100vw - 32px)',
                            mt: 1,
                            borderRadius: 3,
                        },
                    },
                }}
            >
                <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography fontWeight={700}>Уведомления</Typography>

                    <Typography variant='body2' color='text.secondary'>
                        Последние события по вашим заявкам и тендерам
                    </Typography>
                </Box>

                <Divider />

                {isNotificationsLoading ? (
                    <Box
                        sx={{
                            py: 3,
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <CircularProgress size={24} />
                    </Box>
                ) : notificationsError ? (
                    <Box sx={{ px: 2, py: 2 }}>
                        <Alert severity='error'>{notificationsError}</Alert>
                    </Box>
                ) : notifications.length === 0 ? (
                    <MenuItem disabled>
                        <ListItemText
                            primary='Уведомлений пока нет'
                            secondary='Здесь будут отображаться новые события'
                        />
                    </MenuItem>
                ) : (
                    notifications.map((notification) => {
                        const notificationId = getNotificationId(notification);
                        const isUnread = isNotificationUnread(notification);

                        return (
                            <MenuItem
                                key={notificationId}
                                onClick={() =>
                                    handleOpenNotificationDetails(notification)
                                }
                                sx={{
                                    alignItems: 'flex-start',
                                    gap: 1,
                                    py: 1.25,
                                    whiteSpace: 'normal',
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
                                            {getNotificationTitle(notification)}
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
                            </MenuItem>
                        );
                    })
                )}

                <Divider />

                <MenuItem onClick={handleCloseMenu}>
                    <Typography
                        color='primary.main'
                        fontWeight={600}
                        sx={{
                            width: '100%',
                            textAlign: 'center',
                        }}
                    >
                        Смотреть все уведомления
                    </Typography>
                </MenuItem>
            </Menu>

            <NotificationDetailsModal
                open={isDetailsOpen}
                notification={selectedNotification}
                loading={isDetailsLoading}
                error={detailsError}
                onClose={handleCloseDetails}
            />
        </>
    );
}
