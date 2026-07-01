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

export const uploadDriverAvatar = async (file) => {
    const formData = new FormData();

    formData.append('file', file);
    formData.append('name', file.name);

    const response = await api.post(
        '/driver/profile/v1/avatar/upload',
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        },
    );

    return response.data;
};

export async function deleteDriverAvatar() {
    const response = await api.delete('/driver/profile/v1/avatar');

    return response.data;
}
