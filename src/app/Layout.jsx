import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Header } from '../components/Header/Header';
import { GeoTrackingProvider } from '../components/geo-tracking/ui/GeoTrackingProvider';

const drawerWidth = 240;

export default function Layout() {
    const [open, setOpen] = useState(false);

    return (
        <Box>
            <Header onOpenSidebar={() => setOpen(true)} />

            <Sidebar open={open} setOpen={setOpen} />

            <Box
                component='main'
                sx={{
                    ml: {
                        xs: 0,
                        md: `${drawerWidth}px`,
                    },
                    pt: 2,
                    px: 2,
                    pb: 2,
                    minHeight: 'calc(100vh - 64px)',
                    backgroundColor: 'background.default',
                }}
            >
                <GeoTrackingProvider>
                    <Outlet />
                </GeoTrackingProvider>
            </Box>
        </Box>
    );
}
