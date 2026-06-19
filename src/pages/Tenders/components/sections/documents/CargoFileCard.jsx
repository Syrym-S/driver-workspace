import { Box, Chip, Typography } from '@mui/material';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';

export function CargoFileCard({ file, stageLabel, onOpen }) {
    return (
        <Box
            component='button'
            type='button'
            onClick={() => onOpen(file)}
            sx={{
                p: 1.5,
                width: '100%',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 1.5,
                backgroundColor: 'grey.50',
                textAlign: 'left',
                color: 'inherit',
                cursor: 'pointer',
                transition: '0.2s ease',
                font: 'inherit',
                '&:hover': {
                    borderColor: 'primary.light',
                    backgroundColor: 'rgba(33, 150, 243, 0.04)',
                },
            }}
        >
            <Box
                sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 2,
                    backgroundColor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}
            >
                <InsertDriveFileOutlinedIcon
                    sx={{
                        color: 'common.white',
                        fontSize: 24,
                    }}
                />
            </Box>

            <Box sx={{ minWidth: 0, flex: 1 }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        flexWrap: 'wrap',
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: 13,
                            fontWeight: 400,
                            lineHeight: 1.35,
                        }}
                    >
                        {file.name || 'Документ'}
                    </Typography>

                    {stageLabel && (
                        <Chip
                            size='small'
                            label={stageLabel}
                            sx={{
                                height: 22,
                                fontSize: 11,
                                fontWeight: 600,
                            }}
                        />
                    )}
                </Box>

                <Typography
                    color='text.secondary'
                    sx={{
                        mt: 0.25,
                        fontSize: 12,
                        fontWeight: 400,
                        lineHeight: 1.35,
                    }}
                >
                    {file.context || 'Описание не указано'}
                </Typography>

                <Typography
                    color='text.secondary'
                    sx={{
                        mt: 0.5,
                        fontSize: 11,
                        fontWeight: 400,
                        lineHeight: 1.35,
                        wordBreak: 'break-word',
                    }}
                >
                    {file.fileName || 'Файл'}
                </Typography>
            </Box>
        </Box>
    );
}
