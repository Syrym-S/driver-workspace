import { api } from '../../../api/client';

export async function generateTenderRoute(tenderId) {
    const { data } = await api.get('/routing/v4/tender/generate', {
        params: {
            tender_id: tenderId,
        },
    });

    return data;
}
