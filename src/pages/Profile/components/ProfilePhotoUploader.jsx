import { useRef } from 'react';

import {
    Avatar,
    Box,
    Button,
    CircularProgress,
    Stack,
    Typography,
} from '@mui/material';

import { validateAndReadProfilePhoto } from '../model/profile-photo.helpers';

export function ProfilePhotoUploader({
    value,
    error,
    disabled,
    isLoading,
    onChange,
    onRemove,
    onError,
}) {
    const inputRef = useRef(null);

    function handleOpenFileDialog() {
        inputRef.current?.click();
    }

    async function handleFileChange(event) {
        const file = event.target.files?.[0];

        event.target.value = '';

        if (!file) {
            return;
        }

        try {
            const photoUrl = await validateAndReadProfilePhoto(file);

            onError('');
            onChange(photoUrl, file);
        } catch (fileError) {
            onError(fileError.message || 'Не удалось загрузить фото');
        }
    }

    function handleRemovePhoto() {
        onError('');
        onRemove();
    }

    return (
        <Box>
            <Stack
                direction={{
                    xs: 'column',
                    sm: 'row',
                }}
                spacing={2}
                alignItems={{
                    xs: 'flex-start',
                    sm: 'center',
                }}
            >
                {isLoading ? (
                    <Box
                        sx={{
                            width: 96,
                            height: 96,
                            borderRadius: '50%',
                            border: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'background.default',
                            flexShrink: 0,
                        }}
                    >
                        <CircularProgress size={28} />
                    </Box>
                ) : (
                    <Avatar
                        src={value || undefined}
                        sx={{
                            width: 96,
                            height: 96,
                            fontSize: 32,
                            bgcolor: 'primary.light',
                            flexShrink: 0,
                        }}
                    />
                )}

                <Box>
                    <Typography fontWeight={600}>Фото профиля</Typography>

                    <Typography
                        color='text.secondary'
                        fontSize={14}
                        sx={{ mt: 0.5 }}
                    >
                        PNG или JPEG, размер от 400x400 до 600x600 px
                    </Typography>

                    {error && (
                        <Typography
                            color='error'
                            fontSize={13}
                            sx={{ mt: 0.75 }}
                        >
                            {error}
                        </Typography>
                    )}

                    <Stack direction='row' spacing={1} sx={{ mt: 1.5 }}>
                        <Button
                            variant='outlined'
                            onClick={handleOpenFileDialog}
                            disabled={disabled}
                            sx={{ mt: 1.5 }}
                        >
                            Загрузить фото
                        </Button>

                        {value && !isLoading && (
                            <Button
                                color='error'
                                variant='text'
                                onClick={handleRemovePhoto}
                                disabled={disabled}
                            >
                                Удалить
                            </Button>
                        )}
                    </Stack>
                </Box>
            </Stack>

            <input
                ref={inputRef}
                type='file'
                accept='image/png,image/jpeg'
                hidden
                onChange={handleFileChange}
            />
        </Box>
    );
}
