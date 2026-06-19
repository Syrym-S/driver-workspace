import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Tooltip,
    Typography,
} from '@mui/material';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';

import { CargoFilePreview } from './CargoFilePreview';

export function CargoFilePreviewDialog({ file, onClose }) {
    return (
        <Dialog
            open={Boolean(file)}
            onClose={onClose}
            fullWidth
            maxWidth='lg'
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 3,
                        width: 'min(1180px, calc(100vw - 32px))',
                        maxHeight: 'calc(100vh - 32px)',
                    },
                },
            }}
        >
            <DialogTitle>{file?.name || 'Документ'}</DialogTitle>

            <DialogContent
                sx={{
                    px: 2,
                    pb: 2,
                    overflow: 'hidden',
                }}
            >
                <Typography
                    color='text.secondary'
                    sx={{
                        fontSize: 13,
                        mb: 2,
                    }}
                >
                    {file?.context || 'Описание не указано'}
                </Typography>

                <CargoFilePreview file={file} />
            </DialogContent>

            <DialogActions
                sx={{
                    px: 3,
                    pb: 2,
                    gap: 1,
                    justifyContent: 'space-between',
                }}
            >
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {file?.fileUrl && file.fileUrl !== '#' && (
                        <>
                            <Tooltip title='Открыть в новой вкладке'>
                                <IconButton
                                    component='a'
                                    href={file.fileUrl}
                                    target='_blank'
                                    rel='noreferrer'
                                    aria-label='Открыть в новой вкладке'
                                >
                                    <OpenInNewOutlinedIcon />
                                </IconButton>
                            </Tooltip>

                            <Tooltip title='Скачать'>
                                <IconButton
                                    component='a'
                                    href={file.fileUrl}
                                    download={
                                        file.fileName || file.name || true
                                    }
                                    aria-label='Скачать'
                                >
                                    <DownloadOutlinedIcon />
                                </IconButton>
                            </Tooltip>
                        </>
                    )}
                </Box>

                <Button onClick={onClose}>Закрыть</Button>
            </DialogActions>
        </Dialog>
    );
}
