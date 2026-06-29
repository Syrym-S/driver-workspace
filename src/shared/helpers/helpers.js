export function getCompactEmail(email) {
    const normalizedEmail = String(email || 'Пользователь').trim();

    if (!normalizedEmail.includes('@')) {
        return normalizedEmail.length > 28
            ? `${normalizedEmail.slice(0, 24)}…`
            : normalizedEmail;
    }

    const [localPart, domainPart] = normalizedEmail.split('@');

    if (!localPart || !domainPart) {
        return normalizedEmail;
    }

    const compactLocalPart =
        localPart.length > 14 ? `${localPart.slice(0, 14)}…` : localPart;

    return `${compactLocalPart}@${domainPart}`;
}
