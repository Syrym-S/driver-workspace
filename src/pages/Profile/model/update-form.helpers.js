export function createProfileForm(user) {
    return {
        fio: user?.fio || '',
        email: user?.email || '',
        phone: user?.phone || '',
        password: '',
        password_confirm: '',

        iin: user?.iin || '',
        is_foreigner: Boolean(user?.is_foreigner),

        document_number: user?.personDocumentNumber || '',
        issue_country:
            user?.personIssueCountry ||
            user?.issue_country ||
            user?.issueCountry ||
            '',

        issued_date: user?.issued_date || '',

        is_ip: Boolean(user?.is_ip),

        ip_name: user?.ip_name || '',
        ip_bin: user?.ip_bin || user?.bin || '',
        ip_bik: user?.ip_bik || user?.bik || '',
        ip_iik: user?.ip_iik || user?.iik || '',
        ip_legal_address: user?.ip_legal_address || user?.legal_address || '',
    };
}

export function buildProfilePayload(form, isPasswordTouched) {
    const payload = {
        fio: normalizeText(form.fio),
        email: normalizeText(form.email),
        phone: normalizeText(form.phone),
        is_foreigner: Boolean(form.is_foreigner),
        is_ip: Boolean(form.is_ip),
    };

    if (!form.is_foreigner) {
        payload.iin = onlyDigits(form.iin);
    }

    if (form.document_number) {
        payload.personDocumentNumber = normalizeText(form.document_number);
    }

    if (form.issue_country) {
        payload.personIssueCountry = normalizeText(form.issue_country);
    }

    if (form.issued_date) {
        payload.issued_date = form.issued_date;
    }

    if (isPasswordTouched) {
        const password = normalizeText(form.password);
        const passwordConfirm = normalizeText(form.password_confirm);

        if (!password || !passwordConfirm || password !== passwordConfirm) {
            throw new Error('Пароли не заполнены или не совпадают');
        }

        payload.password = password;
        payload.password_confirm = passwordConfirm;
    }

    if (form.is_ip) {
        payload.ip_name = normalizeText(form.ip_name);
        payload.bin = onlyDigits(form.ip_bin);
        payload.bik = normalizeText(form.ip_bik).toUpperCase();
        payload.iik = normalizeText(form.ip_iik).toUpperCase();
        payload.legal_address = normalizeText(form.ip_legal_address);
    }

    return payload;
}

export function buildComparableProfileForm(form) {
    return {
        fio: normalizeText(form.fio),
        email: normalizeText(form.email),
        phone: normalizeText(form.phone),

        iin: form.is_foreigner ? '' : onlyDigits(form.iin),
        is_foreigner: Boolean(form.is_foreigner),

        document_number: normalizeText(form.document_number),
        issue_country: normalizeText(form.issue_country),
        issued_date: normalizeText(form.issued_date),

        is_ip: Boolean(form.is_ip),

        ip_name: form.is_ip ? normalizeText(form.ip_name) : '',
        ip_bin: form.is_ip ? onlyDigits(form.ip_bin) : '',
        ip_bik: form.is_ip ? normalizeText(form.ip_bik).toUpperCase() : '',
        ip_iik: form.is_ip ? normalizeText(form.ip_iik).toUpperCase() : '',
        ip_legal_address: form.is_ip
            ? normalizeText(form.ip_legal_address)
            : '',
    };
}

export function checkFormChanged(currentForm, initialForm) {
    if (!initialForm) {
        return false;
    }

    return (
        JSON.stringify(buildComparableProfileForm(currentForm)) !==
        JSON.stringify(buildComparableProfileForm(initialForm))
    );
}

export function mapProfileFormToUserPatch(form, avatar) {
    return {
        fio: form.fio,
        email: form.email,
        phone: form.phone,

        iin: form.iin,
        is_foreigner: form.is_foreigner,

        personDocumentNumber: form.document_number,
        personIssueCountry: form.issue_country,

        issued_date: form.issued_date,

        is_ip: form.is_ip,

        ip_name: form.ip_name,
        ip_bin: form.ip_bin,
        bin: form.ip_bin,
        ip_bik: form.ip_bik,
        bik: form.ip_bik,
        ip_iik: form.ip_iik,
        iik: form.ip_iik,
        ip_legal_address: form.ip_legal_address,
        legal_address: form.ip_legal_address,

        avatar,
    };
}

function normalizeText(value) {
    return String(value ?? '')
        .trim()
        .replace(/\s+/g, ' ');
}

function onlyDigits(value) {
    return String(value ?? '').replace(/\D/g, '');
}
