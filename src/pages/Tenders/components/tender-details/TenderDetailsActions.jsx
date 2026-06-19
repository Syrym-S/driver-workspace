import { Box, Button, DialogActions } from '@mui/material';

import { normalizeStatus } from '../tender-card.helpers';

export function TenderDetailsActions({
    tender,
    isActionLoading = false,
    onClose,
    onStartLead,
    onOpenStartLoading,
}) {
    const leadStatus = normalizeStatus(tender?.lead?.status);

    const canStartLead = leadStatus === 'add_driver';

    const canStartLoading =
        leadStatus === 'start_driver' || leadStatus === 'start_loading';

    const hasLeftAction = canStartLead || canStartLoading;

    return (
        <DialogActions
            sx={{
                px: 3,
                pb: 2,
                pt: 2,
                justifyContent: hasLeftAction ? 'space-between' : 'flex-end',
                gap: 1,
                flexWrap: 'wrap',
                borderTop: '1px solid',
                borderColor: 'divider',
            }}
        >
            {hasLeftAction && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {canStartLead && (
                        <Button
                            variant='contained'
                            onClick={onStartLead}
                            disabled={isActionLoading}
                        >
                            Водитель выехал
                        </Button>
                    )}

                    {canStartLoading && (
                        <Button
                            variant='contained'
                            onClick={onOpenStartLoading}
                            disabled={isActionLoading}
                        >
                            {leadStatus === 'start_driver'
                                ? 'Начать загрузку'
                                : 'Добавить файлы загрузки'}
                        </Button>
                    )}
                </Box>
            )}

            <Button onClick={onClose} disabled={isActionLoading}>
                Закрыть
            </Button>
        </DialogActions>
    );
}
