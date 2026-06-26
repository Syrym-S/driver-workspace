import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from '@mui/material';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import {
    formatNotificationDate,
    getNotificationCreatedAt,
    getNotificationDescription,
    getNotificationLink,
    getNotificationTitle,
} from '../model/notifications.helpers';

export function NotificationDetailsModal({
    open,
    notification,
    loading,
    error,
    onClose,
}) {
    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : onClose}
            fullWidth
            maxWidth='sm'
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 4,
                    },
                },
            }}
        >
            <DialogTitle sx={{ px: 3, pt: 3, pb: 1.5 }}>
                <Typography
                    sx={{
                        fontSize: {
                            xs: '18px',
                            sm: '20px',
                        },
                        fontWeight: 600,
                        lineHeight: 1.3,
                    }}
                >
                    {notification
                        ? getNotificationTitle(notification)
                        : 'Уведомление'}
                </Typography>

                {notification && (
                    <Typography
                        variant='body2'
                        color='text.secondary'
                        sx={{ mt: 0.5 }}
                    >
                        {formatNotificationDate(
                            getNotificationCreatedAt(notification),
                        )}
                    </Typography>
                )}
            </DialogTitle>

            <DialogContent sx={{ px: 3 }}>
                {loading && (
                    <Box
                        sx={{
                            minHeight: 160,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <CircularProgress />
                    </Box>
                )}

                {error && (
                    <Alert severity='error' sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {!loading && notification && (
                    <Box
                        sx={{
                            p: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 3,
                            backgroundColor: 'background.paper',
                        }}
                    >
                        <Typography
                            color='text.secondary'
                            sx={{
                                fontSize: 14,
                                lineHeight: 1.5,
                            }}
                        >
                            {getNotificationDescription(notification)}
                        </Typography>

                        <Box
                            sx={{
                                display: 'flex',
                                gap: 1,
                                flexWrap: 'wrap',
                                mt: 2,
                            }}
                        ></Box>

                        {getNotificationLink(notification) && (
                            <Box sx={{ mt: 2 }}>
                                <Typography
                                    component='button'
                                    type='button'
                                    onClick={() => {
                                        window.open(
                                            getNotificationLink(notification),
                                            '_blank',
                                            'noopener,noreferrer',
                                        );
                                    }}
                                    sx={{
                                        p: 0,
                                        border: 0,
                                        background: 'none',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        color: 'primary.main',
                                        fontSize: 14,
                                        fontWeight: 600,
                                        fontFamily: 'inherit',
                                        textDecoration: 'none',

                                        '&:hover': {
                                            textDecoration: 'underline',
                                        },
                                    }}
                                >
                                    Перейти
                                    <OpenInNewOutlinedIcon
                                        sx={{ fontSize: 16 }}
                                    />
                                </Typography>
                            </Box>
                        )}
                    </Box>
                )}
            </DialogContent>

            <DialogActions
                sx={{
                    px: 3,
                    pb: 3,
                    pt: 2,
                    justifyContent: 'flex-end',
                }}
            >
                <Button onClick={onClose} disabled={loading}>
                    Закрыть
                </Button>
            </DialogActions>
        </Dialog>
    );
}
