import { api } from "../../../api/client";

export async function fetchDriverTenders({
    page = 1,
    limit = 10,
    status,
    my,
} = {}) {
    const params = {
        page,
        limit,
    };

    if (status) {
        params.status = status;
    }

    if (my) {
        params.my = 1;
    }

    const { data } = await api.get("/driver/v1/tender/list", {
        params,
    });

    return data;
}

export async function fetchDriverTenderById(tenderId) {
    const { data } = await api.get("/driver/v1/tender/get", {
        params: {
            tender_id: tenderId,
        },
    });

    return data;
}

export async function createDriverTenderBet(payload) {
    const { data } = await api.post("/driver/v1/tender/bet", payload);

    return data;
}

export async function cancelDriverTenderBet(payload) {
    const { data } = await api.post("/driver/v1/tender/bet/cancel", payload);

    return data;
}
