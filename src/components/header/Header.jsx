import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  Alert,
  Avatar,
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
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import { Notifications } from "../notifications/ui/Notifications";
import { logoutApi } from "./api/logout.api";
import { getCompactEmail } from "../../shared/helpers/helpers";
import { getUser } from "../../pages/Profile/api";
import { PROFILE_PHOTO_UPDATED_EVENT } from "../../pages/Profile/model/profile-photo.helpers";
import { isStaging } from "../../api/client";

export function Header({ onOpenSidebar }) {
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  const isProfileMenuOpen = Boolean(profileAnchorEl);
  const userEmail = window?.APP_DATA?.user_email || "Пользователь";
  const userEmailLabel = getCompactEmail(userEmail);

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

    if (location.pathname !== "/profile") {
      navigate("/profile");
    }
  }

  function handleOpenLogoutModal() {
    handleCloseProfileMenu();
    setLogoutError("");

    requestAnimationFrame(() => {
      setIsLogoutModalOpen(true);
    });
  }

  function handleCloseLogoutModal() {
    if (isLogoutLoading) {
      return;
    }

    blurActiveElement();
    setLogoutError("");
    setIsLogoutModalOpen(false);
  }

  async function handleConfirmLogout() {
    try {
      setIsLogoutLoading(true);
      setLogoutError("");

      await logoutApi();

      window.location.replace(
        isStaging ? "/staging/auth/login" : "/auth/login",
      );
    } catch (error) {
      setLogoutError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Не удалось выйти из аккаунта",
      );
    } finally {
      setIsLogoutLoading(false);
    }
  }

  useEffect(() => {
    let isCancelled = false;

    async function loadProfileAvatar() {
      try {
        const response = await getUser();
        const profile = response?.data || response;

        if (!isCancelled) {
          setProfilePhoto(profile?.avatar || "");
        }
      } catch {
        if (!isCancelled) {
          setProfilePhoto("");
        }
      }
    }

    function handleProfilePhotoUpdated(event) {
      setProfilePhoto(event.detail?.photoUrl || "");
    }

    loadProfileAvatar();

    window.addEventListener(
      PROFILE_PHOTO_UPDATED_EVENT,
      handleProfilePhotoUpdated,
    );

    return () => {
      isCancelled = true;

      window.removeEventListener(
        PROFILE_PHOTO_UPDATED_EVENT,
        handleProfilePhotoUpdated,
      );
    };
  }, []);

  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1200,
        borderBottom: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
      }}
    >
      <Container maxWidth={false}>
        <Box
          sx={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              minWidth: 0,
            }}
          >
            <IconButton
              onClick={onOpenSidebar}
              sx={{
                display: {
                  xs: "inline-flex",
                  md: "none",
                },
              }}
              aria-label="Открыть меню"
            >
              <MenuIcon />
            </IconButton>

            <Typography fontWeight={600} noWrap>
              Driver
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              minWidth: 0,
              flexShrink: 1,
              ml: "auto",
            }}
          >
            <Notifications />

            <Button
              variant="outlined"
              onClick={handleOpenProfileMenu}
              title={userEmail}
              aria-label={`Профиль пользователя ${userEmail}`}
              sx={{
                minWidth: 0,
                maxWidth: {
                  xs: 140,
                  sm: 220,
                  md: 280,
                },
                px: {
                  xs: 0.75,
                  sm: 1.25,
                },
                textTransform: "none",
                overflow: "hidden",
                flexShrink: 1,
                gap: 0.75,
              }}
            >
              <Avatar
                src={profilePhoto || undefined}
                sx={{
                  width: {
                    xs: 24,
                    sm: 28,
                  },
                  height: {
                    xs: 24,
                    sm: 28,
                  },
                  fontSize: 13,
                  flexShrink: 0,
                }}
              />

              <Typography
                component="span"
                noWrap
                sx={{
                  display: "block",
                  minWidth: 0,
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontSize: {
                    xs: 12,
                    sm: 14,
                  },
                  lineHeight: 1.4,
                }}
              >
                {userEmailLabel}
              </Typography>
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
          <DialogContentText>Вы уверены, что хотите выйти?</DialogContentText>

          {logoutError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {logoutError}
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseLogoutModal} disabled={isLogoutLoading}>
            Отмена
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmLogout}
            disabled={isLogoutLoading}
          >
            {isLogoutLoading ? "Выход..." : "Выйти"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
