import { api } from '../../api/client';

export const getMyTrips = async (params = {}) => {
    const { page = 1, per_page = 10 } = params;

    const response = await api.get('/lead/v1/get', {
        params: {
            page,
            per_page,
        },
    });

    return response.data;
};

export const startLead = async (leadId) => {
    const response = await api.post(`/driver/v1/leads/${leadId}/start-lead`);

    return response.data;
};
