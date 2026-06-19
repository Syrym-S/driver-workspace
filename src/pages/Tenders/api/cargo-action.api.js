import { api } from '../../../api/client';

export async function startLoadingLead(leadId) {
    const { data } = await api.post(
        `/driver/v1/leads/${leadId}/start-loading-lead`,
    );

    return data;
}

export async function startLead(leadId) {
    const { data } = await api.post(`/driver/v1/leads/${leadId}/start-lead`);

    return data;
}

export async function startUnloadingLead(leadId) {
    const { data } = await api.post(
        `/driver/v1/leads/${leadId}/start-unloading-lead`,
    );

    return data;
}

export async function uploadCargoFile(leadId, { file, stage, name, context }) {
    const formData = new FormData();

    formData.append('file', file);
    formData.append('stage', stage);

    if (name) {
        formData.append('name', name);
    }

    if (context) {
        formData.append('context', context);
    }

    const { data } = await api.post(
        `/driver/v1/leads/${leadId}/cargo-files/upload`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        },
    );

    return data;
}

export async function fetchCargoFiles(leadId) {
    const { data } = await api.get(`/driver/v1/leads/${leadId}/cargo-files`);

    return data;
}

export async function submitTenderStartLoading({
    leadId,
    documents,
    shouldStartLoading = false,
}) {
    if (shouldStartLoading) {
        await startLoadingLead(leadId);
    }

    return Promise.all(
        documents.map((document) =>
            uploadCargoFile(leadId, {
                file: document.file,
                stage: 'loading',
                name: document.name || document.file.name,
                context: document.context || '',
            }),
        ),
    );
}
