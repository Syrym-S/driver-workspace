import { useEffect, useState } from 'react';

import { useApp } from '../../../app/context';

import { deleteAvatar, getUser, updateuser, uploadAvatar } from '../api';
import {
    getAvatarFromUploadResponse,
    notifyProfilePhotoUpdated,
} from './profile-photo.helpers';
import {
    buildProfilePayload,
    checkFormChanged,
    createProfileForm,
    mapProfileFormToUserPatch,
} from './update-form.helpers';

export function useProfileForm() {
    const { user, setUser } = useApp();

    const [initialForm, setInitialForm] = useState(null);
    const [form, setForm] = useState(() => createProfileForm(user));

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);

    const [isPasswordTouched, setIsPasswordTouched] = useState(false);

    const [profilePhoto, setProfilePhoto] = useState(user?.avatar || '');
    const [profilePhotoFile, setProfilePhotoFile] = useState(null);
    const [profilePhotoError, setProfilePhotoError] = useState('');
    const [shouldDeleteProfilePhoto, setShouldDeleteProfilePhoto] =
        useState(false);
    const [isProfilePhotoLoading, setIsProfilePhotoLoading] = useState(false);

    const hasFormChanges = checkFormChanged(form, initialForm);

    const hasPasswordChanges =
        isPasswordTouched &&
        (Boolean(form.password) || Boolean(form.password_confirm));

    const hasPhotoChanges =
        Boolean(profilePhotoFile) || Boolean(shouldDeleteProfilePhoto);

    const hasUnsavedChanges =
        hasFormChanges || hasPasswordChanges || hasPhotoChanges;

    function handleChange(key, value) {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));

        setError(false);
        setSuccess(false);
    }

    function handleForeignerChange(checked) {
        setForm((prev) => ({
            ...prev,
            is_foreigner: checked,
            iin: checked ? '' : prev.iin,
        }));

        setError(false);
        setSuccess(false);
    }

    function handlePasswordChange(key, value) {
        setIsPasswordTouched(true);
        handleChange(key, value);
    }

    function handlePhotoChange(nextPhoto, file) {
        setProfilePhoto(nextPhoto);
        setProfilePhotoFile(file);
        setShouldDeleteProfilePhoto(false);
        setProfilePhotoError('');
        setError(false);
        setSuccess(false);
    }

    function handlePhotoRemove() {
        setProfilePhoto('');
        setProfilePhotoFile(null);
        setShouldDeleteProfilePhoto(true);
        setProfilePhotoError('');
        setError(false);
        setSuccess(false);
    }

    function handlePhotoError(message) {
        setProfilePhotoError(message);
        setError(false);
        setSuccess(false);
    }

    async function handleSubmit() {
        try {
            if (!hasUnsavedChanges) {
                return;
            }

            setLoading(true);
            setError(false);
            setSuccess(false);

            if (profilePhotoError) {
                return;
            }

            const hasProfileDataChanges = hasFormChanges || hasPasswordChanges;
            const hasPhotoUpload = Boolean(profilePhotoFile);
            const hasPhotoDelete = shouldDeleteProfilePhoto;

            if (hasProfileDataChanges) {
                const payload = buildProfilePayload(form, isPasswordTouched);

                await updateuser(payload);
            }

            let nextAvatar = profilePhoto;

            if (hasPhotoDelete) {
                await deleteAvatar();

                nextAvatar = '';

                notifyProfilePhotoUpdated('');
            }

            if (hasPhotoUpload) {
                const uploadResponse = await uploadAvatar(profilePhotoFile);

                const profileResponse = await getUser();
                const updatedProfile = profileResponse?.data || profileResponse;

                nextAvatar =
                    updatedProfile?.avatar ||
                    getAvatarFromUploadResponse(uploadResponse, profilePhoto);

                notifyProfilePhotoUpdated(nextAvatar);

                setUser(updatedProfile);
            } else {
                setUser((prev) => ({
                    ...prev,
                    ...mapProfileFormToUserPatch(form, nextAvatar),
                }));
            }

            setProfilePhoto(nextAvatar);
            setProfilePhotoFile(null);
            setShouldDeleteProfilePhoto(false);

            const nextInitialForm = {
                ...form,
                password: '',
                password_confirm: '',
            };

            setInitialForm(nextInitialForm);
            setForm(nextInitialForm);
            setIsPasswordTouched(false);

            setSuccess(true);
        } catch (submitError) {
            console.error(submitError);
            setError(true);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!user) return;

        const nextForm = createProfileForm(user);

        setForm(nextForm);
        setInitialForm(nextForm);

        if (!profilePhotoFile && !shouldDeleteProfilePhoto) {
            setProfilePhoto(user.avatar || '');
        }
    }, [user, profilePhotoFile, shouldDeleteProfilePhoto]);

    useEffect(() => {
        let isMounted = true;

        async function loadProfile() {
            try {
                setIsProfilePhotoLoading(true);

                const profileResponse = await getUser();
                const profile = profileResponse?.data || profileResponse;

                if (!isMounted) return;

                setUser(profile);
                setProfilePhoto(profile.avatar || '');
                setProfilePhotoFile(null);
                setProfilePhotoError('');
                setShouldDeleteProfilePhoto(false);
            } catch (loadError) {
                console.error(
                    'Не удалось загрузить профиль водителя:',
                    loadError,
                );
            } finally {
                if (isMounted) {
                    setIsProfilePhotoLoading(false);
                }
            }
        }

        loadProfile();

        return () => {
            isMounted = false;
        };
    }, [setUser]);

    return {
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
    };
}
