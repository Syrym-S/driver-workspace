import { api } from '../../../api/client';

export async function startLoadingLead(leadId) {
    const response = await api.post(
        `/driver/v1/leads/${leadId}/start-loading-lead`,
    );

    return response.data;
}

export async function fetchCargoFiles(leadId) {
    const response = await api.get(`/driver/v1/leads/${leadId}/cargo-files`);

    return response.data;
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

    const response = await api.post(
        `/driver/v1/leads/${leadId}/cargo-files/upload`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        },
    );

    return response.data;
}

export async function submitStartLoading({
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

export async function startUnloadingLead(leadId) {
    const response = await api.post(
        `/driver/v1/leads/${leadId}/start-unloading-lead`,
    );

    return response.data;
}

export async function submitStartUnloading({
    leadId,
    documents,
    shouldStartUnloading = false,
}) {
    if (shouldStartUnloading) {
        await startUnloadingLead(leadId);
    }

    return Promise.all(
        documents.map((document) =>
            uploadCargoFile(leadId, {
                file: document.file,
                stage: 'unloading',
                name: document.name || document.file.name,
                context: document.context || '',
            }),
        ),
    );
}
