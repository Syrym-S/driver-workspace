import { Box, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar";

const drawerWidth = 240;

export default function Layout() {
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ display: "flex" }}>
      {/* Бургер */}
      <IconButton
        onClick={() => setOpen(true)}
        sx={{
          position: "fixed",
          top: 10,
          left: 10,
          display: {
            xs: open ? "none" : "block", // 👈 скрываем при открытии
            md: "none",
          },
          zIndex: 1400,
        }}
      >
        <MenuIcon />
      </IconButton>

      <Sidebar open={open} setOpen={setOpen} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}