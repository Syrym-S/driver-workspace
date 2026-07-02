import { Alert, Box, Divider, Paper, Stack, Typography } from '@mui/material';
import { useProfileForm } from '../model/useProfileForm';
import { MainFields } from './form-fields/MainFields';
import { DocumentsFields } from './form-fields/DocumentsFields';
import { IpFields } from './form-fields/IpFields';
import { SaveProfileButton } from './SaveProfileButton';
import { ProfilePhotoUploader } from './ProfilePhotoUploader';
import { EmailVerificationStatus } from '../../../components/verification/ui/EmailVerificationStatus';

export const UpdateForm = () => {
    const {
        form,
        loading,
        error,
        success,

        profilePhoto,
        profilePhotoError,
        isProfilePhotoLoading,

        hasUnsavedChanges,

        handleChange,
        handleForeignerChange,
        handlePasswordChange,
        handlePhotoChange,
        handlePhotoRemove,
        handlePhotoError,
        handleSubmit,
    } = useProfileForm();

    return (
        <Paper
            sx={{
                p: {
                    xs: 2,
                    md: 3,
                },
                borderRadius: {
                    xs: 2.5,
                    md: 4,
                },
                width: '100%',
                maxWidth: 900,
                mx: 'auto',
                boxSizing: 'border-box',
                overflow: 'hidden',
            }}
        >
            <Stack spacing={3}>
                <Box>
                    <Typography variant='h6' fontWeight={700}>
                        Профиль
                    </Typography>

                    <Typography variant='body2' color='text.secondary' mt={0.5}>
                        Обновите информацию о себе
                    </Typography>
                </Box>

                {error && (
                    <Alert severity='error'>Не удалось обновить профиль.</Alert>
                )}

                {success && (
                    <Alert severity='success'>Профиль успешно обновлён.</Alert>
                )}

                <EmailVerificationStatus />

                <ProfilePhotoUploader
                    value={profilePhoto}
                    error={profilePhotoError}
                    disabled={loading || isProfilePhotoLoading}
                    isLoading={isProfilePhotoLoading}
                    onChange={handlePhotoChange}
                    onRemove={handlePhotoRemove}
                    onError={handlePhotoError}
                />

                <MainFields
                    form={form}
                    onChange={handleChange}
                    onPasswordChange={handlePasswordChange}
                />

                <Divider />

                <DocumentsFields
                    form={form}
                    onChange={handleChange}
                    onForeignerChange={handleForeignerChange}
                />

                <Divider />

                <IpFields form={form} onChange={handleChange} />

                <SaveProfileButton
                    visible={hasUnsavedChanges}
                    loading={loading}
                    onClick={handleSubmit}
                />
            </Stack>
        </Paper>
    );
};
