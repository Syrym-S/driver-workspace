import { useState } from 'react';
import { Alert, Box, CircularProgress, Stack, Typography } from '@mui/material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';

import { TenderDetailsSection } from '../TenderDetailsSection';
import { CargoFileCard } from './CargoFileCard';
import { CargoFilePreviewDialog } from './CargoFilePreviewDialog';

const stageLabels = {
    loading: 'Погрузка',
    unloading: 'Разгрузка',
};

export function CargoFilesSection({
    files = [],
    isLoading = false,
    error = '',
}) {
    const [selectedFile, setSelectedFile] = useState(null);

    return (
        <TenderDetailsSection
            icon={<DescriptionOutlinedIcon />}
            title='Документы по грузу'
            subtitle='Файлы, прикрепленные водителем на этапах погрузки и разгрузки'
        >
            <Stack spacing={2}>
                {error && <Alert severity='error'>{error}</Alert>}

                {isLoading && (
                    <Box
                        sx={{
                            py: 2,
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <CircularProgress size={24} />
                    </Box>
                )}

                {!isLoading && files.length === 0 && (
                    <Typography color='text.secondary' fontSize={14}>
                        Документы не добавлены
                    </Typography>
                )}

                {!isLoading && files.length > 0 && (
                    <Stack spacing={1}>
                        {files.map((file) => (
                            <CargoFileCard
                                key={file.id}
                                file={file}
                                stageLabel={
                                    stageLabels[file.stage] || file.stage
                                }
                                onOpen={setSelectedFile}
                            />
                        ))}
                    </Stack>
                )}
            </Stack>

            <CargoFilePreviewDialog
                file={selectedFile}
                onClose={() => setSelectedFile(null)}
            />
        </TenderDetailsSection>
    );
}
