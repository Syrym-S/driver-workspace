import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
    Alert,
    Box,
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Menu,
    MenuItem,
    Typography,
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import { Notifications } from '../notifications/ui/Notifications';
import { logoutApi } from './api/logout.api';

export function Header({ onOpenSidebar }) {
    const [profileAnchorEl, setProfileAnchorEl] = useState(null);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isLogoutLoading, setIsLogoutLoading] = useState(false);
    const [logoutError, setLogoutError] = useState('');

    const location = useLocation();
    const navigate = useNavigate();

    const isProfileMenuOpen = Boolean(profileAnchorEl);
    const userEmail = window?.APP_DATA?.user_email || 'Пользователь';

    function blurActiveElement() {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
    }

    function handleOpenProfileMenu(event) {
        event.currentTarget.blur();
        setProfileAnchorEl(event.currentTarget);
    }

    function handleCloseProfileMenu() {
        blurActiveElement();
        setProfileAnchorEl(null);
    }

    function handleNavigateProfile() {
        handleCloseProfileMenu();

        if (location.pathname !== '/profile') {
            navigate('/profile');
        }
    }

    function handleOpenLogoutModal() {
        handleCloseProfileMenu();
        setLogoutError('');

        requestAnimationFrame(() => {
            setIsLogoutModalOpen(true);
        });
    }

    function handleCloseLogoutModal() {
        if (isLogoutLoading) {
            return;
        }

        blurActiveElement();
        setLogoutError('');
        setIsLogoutModalOpen(false);
    }

    async function handleConfirmLogout() {
        try {
            setIsLogoutLoading(true);
            setLogoutError('');

            await logoutApi();

            window.location.href = '/login';
        } catch (error) {
            setLogoutError(
                error.response?.data?.message ||
                    error.response?.data?.error ||
                    error.message ||
                    'Не удалось выйти из аккаунта',
            );
        } finally {
            setIsLogoutLoading(false);
        }
    }

    return (
        <Box
            component='header'
            sx={{
                position: 'sticky',
                top: 0,
                zIndex: 1200,
                borderBottom: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
            }}
        >
            <Container maxWidth={false}>
                <Box
                    sx={{
                        height: 64,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            minWidth: 0,
                        }}
                    >
                        <IconButton
                            onClick={onOpenSidebar}
                            sx={{
                                display: {
                                    xs: 'inline-flex',
                                    md: 'none',
                                },
                            }}
                            aria-label='Открыть меню'
                        >
                            <MenuIcon />
                        </IconButton>

                        <Typography fontWeight={600} noWrap>
                            Driver
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            minWidth: 0,
                        }}
                    >
                        <Notifications />

                        <Button
                            variant='outlined'
                            onClick={handleOpenProfileMenu}
                            sx={{
                                maxWidth: {
                                    xs: 140,
                                    sm: 240,
                                },
                                textTransform: 'none',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                            title={userEmail}
                        >
                            {userEmail}
                        </Button>
                    </Box>
                </Box>
            </Container>

            <Menu
                anchorEl={profileAnchorEl}
                open={isProfileMenuOpen}
                onClose={handleCloseProfileMenu}
            >
                <MenuItem onClick={handleNavigateProfile}>Профиль</MenuItem>

                <MenuItem disabled>Настройки</MenuItem>

                <MenuItem onClick={handleOpenLogoutModal}>Выход</MenuItem>
            </Menu>

            <Dialog open={isLogoutModalOpen} onClose={handleCloseLogoutModal}>
                <DialogTitle>Выход из аккаунта</DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        Вы уверены, что хотите выйти?
                    </DialogContentText>

                    {logoutError && (
                        <Alert severity='error' sx={{ mt: 2 }}>
                            {logoutError}
                        </Alert>
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={handleCloseLogoutModal}
                        disabled={isLogoutLoading}
                    >
                        Отмена
                    </Button>

                    <Button
                        color='error'
                        variant='contained'
                        onClick={handleConfirmLogout}
                        disabled={isLogoutLoading}
                    >
                        {isLogoutLoading ? 'Выход...' : 'Выйти'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
