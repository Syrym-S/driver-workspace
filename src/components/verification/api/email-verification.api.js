import { api } from '../../../api/client';

export async function fetchEmailVerificationStatus() {
    const response = await api.get('/auth/v1/email-status');

    return response.data;
}

export async function resendEmailVerification() {
    const response = await api.post('/auth/v1/resend-verification', {});

    return response.data;
}
