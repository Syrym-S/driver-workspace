export const EMAIL_VERIFICATION_MODAL_OPEN_EVENT =
    'driver-email-verification:modal-open';

export const EMAIL_VERIFICATION_STATUS_CHANGED_EVENT =
    'driver-email-verification:status-changed';

export const EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS = 60;

const EMAIL_VERIFICATION_RESEND_AVAILABLE_AT_KEY =
    'driver_email_verification_resend_available_at';

export function getIsEmailVerified(response) {
    return Boolean(response?.status);
}

export function openEmailVerificationModal() {
    window.dispatchEvent(new CustomEvent(EMAIL_VERIFICATION_MODAL_OPEN_EVENT));
}

export function publishEmailVerificationStatusChanged(isVerified) {
    window.dispatchEvent(
        new CustomEvent(EMAIL_VERIFICATION_STATUS_CHANGED_EVENT, {
            detail: {
                isVerified,
            },
        }),
    );
}

export function subscribeToEmailVerificationStatusChanged(handler) {
    if (typeof handler !== 'function') {
        return () => {};
    }

    window.addEventListener(EMAIL_VERIFICATION_STATUS_CHANGED_EVENT, handler);

    return () => {
        window.removeEventListener(
            EMAIL_VERIFICATION_STATUS_CHANGED_EVENT,
            handler,
        );
    };
}

export function getEmailVerificationCooldownLeft() {
    const availableAt = Number(
        window.localStorage.getItem(
            EMAIL_VERIFICATION_RESEND_AVAILABLE_AT_KEY,
        ) || 0,
    );

    if (!availableAt) {
        return 0;
    }

    const diffMs = availableAt - Date.now();

    if (diffMs <= 0) {
        window.localStorage.removeItem(
            EMAIL_VERIFICATION_RESEND_AVAILABLE_AT_KEY,
        );

        return 0;
    }

    return Math.ceil(diffMs / 1000);
}

export function startEmailVerificationCooldown(
    seconds = EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS,
) {
    const availableAt = Date.now() + seconds * 1000;

    window.localStorage.setItem(
        EMAIL_VERIFICATION_RESEND_AVAILABLE_AT_KEY,
        String(availableAt),
    );

    return seconds;
}

export function getResendVerificationMessage(response) {
    return (
        response?.message ||
        response?.data?.message ||
        'Письмо для подтверждения email отправлено. Проверьте почту.'
    );
}
