function getFileNameFromPath(value) {
    if (!value) {
        return '';
    }

    const cleanValue = String(value).split('?')[0].split('#')[0];
    const parts = cleanValue.split('/');

    return decodeURIComponent(parts[parts.length - 1] || '');
}

export function mapCargoFileFromApi(apiFile, index) {
    const fileNameFromUrl = getFileNameFromPath(apiFile.url);
    const fileNameFromPath = getFileNameFromPath(apiFile.path);

    const fileName =
        apiFile.file_name ||
        apiFile.fileName ||
        apiFile.original_name ||
        apiFile.originalName ||
        apiFile.filename ||
        fileNameFromUrl ||
        fileNameFromPath ||
        `file-${index + 1}`;

    return {
        id: apiFile.path || apiFile.url || apiFile.id || `cargo-file-${index}`,
        name: apiFile.name || apiFile.title || 'Документ',
        context: apiFile.context || '',
        fileName,
        fileUrl: apiFile.url || apiFile.path || '#',
        fileType: apiFile.type || apiFile.mime_type || '',
        stage: apiFile.stage || '',
        createdAt: apiFile.created_at || null,
        path: apiFile.path || '',
        raw: apiFile,
    };
}

export function mapCargoFilesResponseFromApi(response) {
    const files = Array.isArray(response)
        ? response
        : response?.files || response?.data?.files || [];

    return Array.isArray(files) ? files.map(mapCargoFileFromApi) : [];
}
