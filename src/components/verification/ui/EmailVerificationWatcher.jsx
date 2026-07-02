import { useCallback, useEffect, useState } from 'react';

import { fetchEmailVerificationStatus } from '../api/email-verification.api';

import {
    EMAIL_VERIFICATION_MODAL_OPEN_EVENT,
    getIsEmailVerified,
    publishEmailVerificationStatusChanged,
} from '../model/email-verification.helpers';

import { EmailVerificationModal } from './EmailVerificationModal';
import {
    notifyEmailVerificationRequired,
    removeEmailVerificationNotification,
} from '../../notifications/model/notifications.store';

export function EmailVerificationWatcher() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const checkEmailVerificationStatus = useCallback(async () => {
        try {
            const response = await fetchEmailVerificationStatus();
            const isVerified = getIsEmailVerified(response);

            publishEmailVerificationStatusChanged(isVerified);

            if (isVerified) {
                removeEmailVerificationNotification();
                return;
            }

            notifyEmailVerificationRequired();
        } catch (error) {
            console.error('Не удалось проверить статус email:', error);
        }
    }, []);

    useEffect(() => {
        function handleOpenModal() {
            setIsModalOpen(true);
        }

        function handleWindowFocus() {
            checkEmailVerificationStatus();
        }

        checkEmailVerificationStatus();

        window.addEventListener(
            EMAIL_VERIFICATION_MODAL_OPEN_EVENT,
            handleOpenModal,
        );

        window.addEventListener('focus', handleWindowFocus);

        return () => {
            window.removeEventListener(
                EMAIL_VERIFICATION_MODAL_OPEN_EVENT,
                handleOpenModal,
            );

            window.removeEventListener('focus', handleWindowFocus);
        };
    }, [checkEmailVerificationStatus]);

    return (
        <EmailVerificationModal
            open={isModalOpen}
            onClose={() => {
                setIsModalOpen(false);
            }}
        />
    );
}
