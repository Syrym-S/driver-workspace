import { api } from '../../../api/client';

export async function fetchDriverNotificationsApi({
    page = 1,
    perPage = 20,
} = {}) {
    const response = await api.get('/driver/v1/notifications', {
        params: {
            page,
            per_page: perPage,
        },
    });

    return response.data;
}

export async function fetchDriverNotificationByIdApi(notificationId) {
    const response = await api.get(
        `/driver/v1/notifications/${encodeURIComponent(notificationId)}`,
    );

    return response.data;
}
