import { Box, Typography } from '@mui/material';

export function TenderDetailsSection({
    icon,
    title,
    subtitle,
    action,
    children,
}) {
    return (
        <Box
            sx={{
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                backgroundColor: 'background.paper',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 2,
                    mb: 1.5,
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
                    {icon && (
                        <Box
                            sx={{
                                width: 32,
                                height: 32,
                                borderRadius: 2,
                                backgroundColor: 'rgba(33, 150, 243, 0.08)',
                                color: 'primary.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                '& svg': {
                                    fontSize: 20,
                                },
                            }}
                        >
                            {icon}
                        </Box>
                    )}

                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            sx={{
                                fontSize: '15px',
                                fontWeight: 600,
                            }}
                        >
                            {title}
                        </Typography>

                        {subtitle && (
                            <Typography
                                color='text.secondary'
                                sx={{
                                    fontSize: 13,
                                    mt: 0.25,
                                }}
                            >
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                </Box>

                {action && (
                    <Box
                        sx={{
                            flexShrink: 0,
                            ml: 'auto',
                        }}
                    >
                        {action}
                    </Box>
                )}
            </Box>

            {children}
        </Box>
    );
}
