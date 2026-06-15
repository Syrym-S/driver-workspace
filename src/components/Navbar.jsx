import { AppBar, Toolbar, IconButton, Typography, Drawer, List, ListItem, ListItemText, Box } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";
import { Link } from "react-router-dom";

const links = [
  { label: "Текущий рейс", path: "/" },
  { label: "Мои рейсы", path: "/trips" },
  { label: "Профиль", path: "/profile" },
  { label: "Мои машины", path: "/vehicles" },
  { label: "Положение использование", path: "/use" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {/* Burger */}
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setOpen(true)}
            sx={{ display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Driver Workspace
          </Typography>

          {/* Desktop menu */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
            {links.map((link) => (
              <Link key={link.path} to={link.path} style={{ color: "#fff" }}>
                {link.label}
              </Link>
            ))}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer open={open} onClose={() => setOpen(false)}>
        <List sx={{ width: 250 }}>
          {links.map((link) => (
            <ListItem button key={link.path} onClick={() => setOpen(false)}>
              <Link to={link.path}>
                <ListItemText primary={link.label} />
              </Link>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
}