import { api } from '../../../api/client';

export async function logoutApi() {
    const response = await api.post('/auth/v1/logout');

    return response.data;
}
