import { useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';

function createDocumentId() {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function StartUnloadingModal({
    open,
    isSubmitting = false,
    error = '',
    onClose,
    onSubmit,
}) {
    const [documents, setDocuments] = useState([]);
    const [selectedFileName, setSelectedFileName] = useState('');

    function resetForm() {
        setDocuments([]);
        setSelectedFileName('');
    }

    function handleClose() {
        resetForm();
        onClose?.();
    }

    function handleFileChange(event) {
        const file = event.target.files?.[0];

        setSelectedFileName(file?.name || '');
    }

    function handleAddDocument(event) {
        event.preventDefault();

        const form = event.currentTarget;
        const formData = new FormData(form);
        const file = formData.get('file');

        if (!file || !file.name || isSubmitting) {
            return;
        }

        setDocuments((prevDocuments) => [
            ...prevDocuments,
            {
                id: createDocumentId(),
                name: formData.get('name') || file.name,
                context: formData.get('context') || '',
                file,
                fileName: file.name,
                fileType: file.type,
            },
        ]);

        setSelectedFileName('');
        form.reset();
    }

    function handleDeleteDocument(documentId) {
        setDocuments((prevDocuments) =>
            prevDocuments.filter((document) => document.id !== documentId),
        );
    }

    async function handleSubmit() {
        if (!documents.length || isSubmitting) {
            return;
        }

        const isSuccess = await onSubmit?.({
            documents,
        });

        if (isSuccess !== false) {
            resetForm();
        }
    }

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth='sm'
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 4,
                    },
                },
            }}
        >
            <DialogTitle>Начало разгрузки</DialogTitle>

            <DialogContent>
                <Stack spacing={2}>
                    <Typography color='text.secondary' sx={{ fontSize: 14 }}>
                        Прикрепите документы, фото или видео, которые
                        подтверждают начало разгрузки груза.
                    </Typography>

                    <Box
                        component='form'
                        onSubmit={handleAddDocument}
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                md: '1fr 1fr auto',
                            },
                            gap: 1,
                            alignItems: 'flex-start',
                        }}
                    >
                        <TextField
                            name='name'
                            label='Название документа'
                            size='small'
                            fullWidth
                            disabled={isSubmitting}
                        />

                        <TextField
                            name='context'
                            label='Описание'
                            size='small'
                            fullWidth
                            disabled={isSubmitting}
                        />

                        <Box>
                            <Button
                                component='label'
                                variant={
                                    selectedFileName ? 'contained' : 'outlined'
                                }
                                startIcon={<UploadFileOutlinedIcon />}
                                disabled={isSubmitting}
                                sx={{
                                    minHeight: 40,
                                    width: {
                                        xs: '100%',
                                        md: 'auto',
                                    },
                                }}
                            >
                                {selectedFileName ? 'Файл выбран' : 'Файл'}

                                <input
                                    name='file'
                                    type='file'
                                    hidden
                                    accept='.pdf,.xls,.xlsx,.jpg,.jpeg,.png,.mp4,.mpeg,.mov,.avi,.mkv,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/jpeg,image/png,video/mp4,video/mpeg,video/quicktime,video/x-msvideo,video/x-matroska'
                                    onChange={handleFileChange}
                                />
                            </Button>

                            {selectedFileName && (
                                <Typography
                                    sx={{
                                        mt: 0.5,
                                        fontSize: 11,
                                        lineHeight: 1.3,
                                        color: 'text.secondary',
                                        maxWidth: {
                                            xs: '100%',
                                            md: 180,
                                        },
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                    title={selectedFileName}
                                >
                                    {selectedFileName}
                                </Typography>
                            )}
                        </Box>

                        <Button
                            type='submit'
                            variant='contained'
                            disabled={isSubmitting}
                            sx={{
                                gridColumn: {
                                    xs: '1',
                                    md: '1 / -1',
                                },
                                justifySelf: 'flex-start',
                            }}
                        >
                            Добавить документ
                        </Button>
                    </Box>

                    {error && <Alert severity='error'>{error}</Alert>}

                    {documents.length === 0 ? (
                        <Typography color='text.secondary' fontSize={14}>
                            Документы не добавлены
                        </Typography>
                    ) : (
                        <Stack spacing={1}>
                            {documents.map((document) => (
                                <StartUnloadingFileCard
                                    key={document.id}
                                    document={document}
                                    onDelete={handleDeleteDocument}
                                    isDeleting={isSubmitting}
                                />
                            ))}
                        </Stack>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={handleClose} disabled={isSubmitting}>
                    Отмена
                </Button>

                <Button
                    variant='contained'
                    onClick={handleSubmit}
                    disabled={isSubmitting || documents.length === 0}
                >
                    {isSubmitting ? 'Отправляем...' : 'Подтвердить'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

function StartUnloadingFileCard({ document, onDelete, isDeleting = false }) {
    return (
        <Box
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
                <Typography
                    sx={{
                        fontSize: 13,
                        fontWeight: 400,
                        lineHeight: 1.35,
                    }}
                >
                    {document.name || 'Документ'}
                </Typography>

                <Typography
                    color='text.secondary'
                    sx={{
                        mt: 0.25,
                        fontSize: 12,
                        fontWeight: 400,
                        lineHeight: 1.35,
                    }}
                >
                    {document.context || 'Описание не указано'}
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
                    {document.fileName || 'Файл'}
                </Typography>
            </Box>

            <IconButton
                size='small'
                color='error'
                disabled={isDeleting}
                onClick={() => onDelete(document.id)}
            >
                <DeleteOutlineOutlinedIcon fontSize='small' />
            </IconButton>
        </Box>
    );
}
