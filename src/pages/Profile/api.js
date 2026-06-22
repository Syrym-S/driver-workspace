import { api } from '../../api/client';

export const getUser = async () => {
    const response = await api.get('driver/profile/v1/get');

    return response.data;
};

export const insertInvite = async ({ invite }) => {
    const response = await api.post('driver/profile/v1/invite', {
        invite: invite,
    });

    return response.data;
};

export const updateuser = async (payload) => {
    const response = await api.post('driver/profile/v1/update', payload);

    return response.data;
};
