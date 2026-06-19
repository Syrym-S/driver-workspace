import { useEffect, useState } from 'react';

import {
    Paper,
    Typography,
    CircularProgress,
    Alert,
    Box,
    ButtonBase,
    Stack,
    Chip,
} from '@mui/material';

import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';

import { getDocuments } from '../api/api';
import { fetchCargoFiles } from '../api/cargo-action.api';

const cargoStageLabels = {
    loading: 'Погрузка',
    unloading: 'Разгрузка',
};

function getFileNameFromPath(value) {
    if (!value) {
        return '';
    }

    const cleanValue = String(value).split('?')[0].split('#')[0];
    const parts = cleanValue.split('/');

    return decodeURIComponent(parts[parts.length - 1] || '');
}

function mapCargoFileFromApi(file, index) {
    const fileNameFromUrl = getFileNameFromPath(file.url);
    const fileNameFromPath = getFileNameFromPath(file.path);

    return {
        id: file.path || file.url || file.id || `cargo-file-${index}`,
        name: file.name || 'Документ',
        context: file.context || '',
        path: file.url || file.path || '#',
        fileName:
            file.file_name ||
            file.fileName ||
            file.filename ||
            fileNameFromUrl ||
            fileNameFromPath ||
            `file-${index + 1}`,
        stage: file.stage || '',
        createdAt: file.created_at || null,
        raw: file,
    };
}

function mapCargoFilesResponseFromApi(response) {
    const files = Array.isArray(response)
        ? response
        : response?.files || response?.data?.files || [];

    return Array.isArray(files) ? files.map(mapCargoFileFromApi) : [];
}

const Document = ({ tripId, refreshKey = 0 }) => {
    const [documents, setDocuments] = useState([]);
    const [cargoFiles, setCargoFiles] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            setError(false);

            const [documentsResponse, cargoFilesResponse] =
                await Promise.allSettled([
                    getDocuments({
                        lead_id: tripId,
                    }),
                    fetchCargoFiles(tripId),
                ]);

            if (documentsResponse.status === 'fulfilled') {
                setDocuments(documentsResponse.value?.results || []);
            } else {
                console.error(documentsResponse.reason);
                setDocuments([]);
            }

            if (cargoFilesResponse.status === 'fulfilled') {
                setCargoFiles(
                    mapCargoFilesResponseFromApi(cargoFilesResponse.value),
                );
            } else {
                const status = cargoFilesResponse.reason?.response?.status;

                if (status !== 404) {
                    console.error(cargoFilesResponse.reason);
                }

                setCargoFiles([]);
            }
        } catch (e) {
            console.error(e);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tripId) {
            fetchDocuments();
        }
    }, [tripId, refreshKey]);

    const hasDocuments = documents.length > 0;
    const hasCargoFiles = cargoFiles.length > 0;
    const hasAnyFiles = hasDocuments || hasCargoFiles;

    return (
        <Paper
            sx={{
                p: 3,
                borderRadius: 4,
            }}
        >
            <Typography variant='h6' fontWeight={700} mb={3}>
                Документы
            </Typography>

            {loading && (
                <Box
                    display='flex'
                    justifyContent='center'
                    alignItems='center'
                    minHeight={220}
                >
                    <CircularProgress />
                </Box>
            )}

            {!loading && error && (
                <Alert
                    severity='warning'
                    sx={{
                        borderRadius: 3,
                    }}
                >
                    Сейчас документы временно недоступны. Попробуйте обновить
                    страницу немного позже.
                </Alert>
            )}

            {!loading && !error && !hasAnyFiles && (
                <Alert
                    severity='info'
                    sx={{
                        borderRadius: 3,
                    }}
                >
                    Для текущего рейса документы пока не добавлены.
                </Alert>
            )}

            {!loading && !error && hasAnyFiles && (
                <Stack spacing={3}>
                    {hasCargoFiles && (
                        <Stack spacing={1.5}>
                            <Typography fontWeight={700} fontSize={14}>
                                Документы по грузу
                            </Typography>

                            <Stack spacing={2}>
                                {cargoFiles.map((file) => (
                                    <DocumentCard
                                        key={file.id}
                                        document={file}
                                        stageLabel={
                                            cargoStageLabels[file.stage] ||
                                            file.stage
                                        }
                                    />
                                ))}
                            </Stack>
                        </Stack>
                    )}

                    {hasDocuments && (
                        <Stack spacing={1.5}>
                            <Typography fontWeight={700} fontSize={14}>
                                Основные документы
                            </Typography>

                            <Stack spacing={2}>
                                {documents.map((doc, index) => (
                                    <DocumentCard
                                        key={doc.path || doc.id || index}
                                        document={{
                                            name: doc.name,
                                            context: doc.context,
                                            path: doc.path,
                                            fileName:
                                                doc.fileName ||
                                                getFileNameFromPath(doc.path),
                                        }}
                                    />
                                ))}
                            </Stack>
                        </Stack>
                    )}
                </Stack>
            )}
        </Paper>
    );
};

function DocumentCard({ document, stageLabel }) {
    return (
        <ButtonBase
            onClick={() => {
                if (document.path && document.path !== '#') {
                    window.open(document.path, '_blank');
                }
            }}
            sx={{
                width: '100%',
                textAlign: 'left',
                borderRadius: 3,
            }}
        >
            <Box
                sx={{
                    width: '100%',
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    transition: '0.2s',
                    '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'action.hover',
                    },
                }}
            >
                <Box
                    sx={{
                        width: 52,
                        height: 52,
                        borderRadius: 2,
                        bgcolor: 'primary.main',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    <InsertDriveFileOutlinedIcon />
                </Box>

                <Box
                    sx={{
                        minWidth: 0,
                        flex: 1,
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            flexWrap: 'wrap',
                        }}
                    >
                        <Typography fontWeight={600} noWrap>
                            {document.name || 'Документ'}
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
                        variant='body2'
                        color='text.secondary'
                        sx={{
                            mt: 0.5,
                        }}
                    >
                        {document.context || 'Описание не указано'}
                    </Typography>

                    {document.fileName && (
                        <Typography
                            color='text.secondary'
                            sx={{
                                mt: 0.5,
                                fontSize: 11,
                                wordBreak: 'break-word',
                            }}
                        >
                            {document.fileName}
                        </Typography>
                    )}
                </Box>
            </Box>
        </ButtonBase>
    );
}

export default Document;
