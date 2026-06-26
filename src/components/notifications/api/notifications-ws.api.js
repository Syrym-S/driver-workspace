import { api } from '../../../api/client';

export async function fetchNotificationWsTokenApi({ signal } = {}) {
    const response = await api.get('/notif/v1/token', {
        signal,
    });

    return response.data;
}
