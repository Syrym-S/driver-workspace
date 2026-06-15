import {
    Drawer,
    List,
    ListItemButton,
    ListItemText,
    Box,
    Toolbar,
    Typography,
} from "@mui/material";
import { Link } from "react-router-dom";

const drawerWidth = 240;

const links = [
    { label: "Текущий рейс", path: "/" },
    { label: "Мои рейсы", path: "/trips" },
    { label: "Профиль", path: "/profile" },
    { label: "Мои машины", path: "/vehicles" },
    { label: "Положение", path: "/use" },
];

export default function Sidebar({ open, setOpen }) {
    const content = (
        <Box sx={{ width: drawerWidth }}>
            <Toolbar>
                <Typography variant="h6">Driver</Typography>
            </Toolbar>

            <List>
                {links.map((link) => (
                    <ListItemButton
                        key={link.path}
                        component={Link}
                        to={link.path}
                        onClick={() => setOpen(false)}
                    >
                        <ListItemText primary={link.label} />
                    </ListItemButton>
                ))}
            </List>
        </Box>
    );

    console.log("Open:" ,open);

    return (
        <>
            {/* MOBILE */}
            <Drawer
                variant="temporary"
                open={open}
                onClose={() => setOpen(false)}
                sx={{
                    display: { xs: "block", md: "none" },
                    "& .MuiDrawer-paper": {
                        width: drawerWidth,
                    },
                }}
            >
                {content}
            </Drawer>

            {/* DESKTOP */}
            <Drawer
                variant="permanent"
                open
                sx={{
                    display: { xs: "none", md: "block" }, // 👈 ключевой момент
                    "& .MuiDrawer-paper": {
                        width: drawerWidth,
                        boxSizing: "border-box",
                    },
                }}
            >
                {content}
            </Drawer>
        </>
    );
}