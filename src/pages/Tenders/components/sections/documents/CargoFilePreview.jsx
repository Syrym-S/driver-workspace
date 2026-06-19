import { Box, Typography } from '@mui/material';

function isPdfFile(file) {
    const fileType = file?.fileType || '';
    const fileName = file?.fileName || '';

    return (
        fileType === 'application/pdf' ||
        fileName.toLowerCase().endsWith('.pdf')
    );
}

function isImageFile(file) {
    const fileType = file?.fileType || '';
    const fileName = file?.fileName?.toLowerCase() || '';

    return (
        fileType.startsWith('image/') ||
        fileName.endsWith('.jpg') ||
        fileName.endsWith('.jpeg') ||
        fileName.endsWith('.png') ||
        fileName.endsWith('.webp')
    );
}

function isVideoFile(file) {
    const fileType = file?.fileType || '';
    const fileName = file?.fileName?.toLowerCase() || '';

    return (
        fileType.startsWith('video/') ||
        fileName.endsWith('.mp4') ||
        fileName.endsWith('.webm') ||
        fileName.endsWith('.mov') ||
        fileName.endsWith('.avi')
    );
}

function hasPreviewUrl(file) {
    return Boolean(file?.fileUrl && file.fileUrl !== '#');
}

export function CargoFilePreview({ file }) {
    if (!file) {
        return null;
    }

    if (!hasPreviewUrl(file)) {
        return (
            <PreviewFallback text='Для этого файла нет ссылки для предпросмотра' />
        );
    }

    if (isPdfFile(file)) {
        return (
            <Box
                sx={{
                    height: {
                        xs: '70vh',
                        sm: '75vh',
                    },
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    overflow: 'hidden',
                    backgroundColor: 'grey.100',
                }}
            >
                <Box
                    component='iframe'
                    src={`${file.fileUrl}#view=FitH`}
                    title={file.fileName || file.name || 'PDF preview'}
                    sx={{
                        display: 'block',
                        width: '100%',
                        height: '100%',
                        border: 0,
                    }}
                />
            </Box>
        );
    }

    if (isImageFile(file)) {
        return (
            <Box
                sx={{
                    maxHeight: '75vh',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    overflow: 'auto',
                    backgroundColor: 'grey.100',
                    display: 'flex',
                    justifyContent: 'center',
                    p: 2,
                }}
            >
                <Box
                    component='img'
                    src={file.fileUrl}
                    alt={file.name || file.fileName || 'Документ'}
                    sx={{
                        maxWidth: '100%',
                        height: 'auto',
                        display: 'block',
                    }}
                />
            </Box>
        );
    }

    if (isVideoFile(file)) {
        return (
            <Box
                sx={{
                    maxHeight: '75vh',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    overflow: 'hidden',
                    backgroundColor: 'common.black',
                }}
            >
                <Box
                    component='video'
                    src={file.fileUrl}
                    controls
                    sx={{
                        display: 'block',
                        width: '100%',
                        maxHeight: '75vh',
                    }}
                />
            </Box>
        );
    }

    return (
        <PreviewFallback text='Предпросмотр для этого типа файла пока не поддерживается' />
    );
}

function PreviewFallback({ text }) {
    return (
        <Box
            sx={{
                minHeight: 260,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                backgroundColor: 'grey.50',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                p: 3,
            }}
        >
            <Typography color='text.secondary' sx={{ fontSize: 14 }}>
                {text}
            </Typography>
        </Box>
    );
}
