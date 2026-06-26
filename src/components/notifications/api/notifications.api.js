import { api } from '../../../api/client';

export async function fetchCustomerNotificationsApi() {
    const response = await api.get('/driver/v1/notifications');

    return response.data;
}

export async function fetchCustomerNotificationByIdApi(notificationId) {
    const response = await api.get(
        `/driver/v1/notifications/${encodeURIComponent(notificationId)}`,
    );

    return response.data;
}
