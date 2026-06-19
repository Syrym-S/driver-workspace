function formatTenderLocation(location) {
    if (!location) {
        return '';
    }

    if (typeof location === 'string') {
        return location.trim();
    }

    if (typeof location !== 'object') {
        return String(location);
    }

    const parts = [
        location.country,
        location.region,
        location.city,
        location.address,
    ].filter(Boolean);

    if (parts.length) {
        return parts.join(', ');
    }

    const lat = location.lat ?? location.latitude;
    const lon = location.lon ?? location.lng ?? location.longitude;

    if (lat && lon) {
        return `${lat}, ${lon}`;
    }

    return '';
}

function mapTenderBetFromApi(bet, index) {
    return {
        ...bet,
        betIndex: index,
        amount: bet.amount ?? null,
        status: bet.status || 'new',
        comment: bet.comment || '',
        currency: bet.currency || 'KZT',
        isOwn: Boolean(bet.is_own),
    };
}

function mapTenderLeadFromApi(lead) {
    if (!lead) {
        return null;
    }

    return {
        ...lead,

        from_location: formatTenderLocation(lead.from_location),
        to_location: formatTenderLocation(lead.to_location),

        from_location_raw: lead.from_location || null,
        to_location_raw: lead.to_location || null,

        transportation_price: lead.transportation_price ?? null,
        transportation_currency: lead.currency || 'KZT',
        cargo: lead.cargo || null,
        forwarder: mapTenderForwarderFromApi(lead.forwarder),

        raw: {
            ...lead,
            route: {
                from: lead.from_location,
                to: lead.to_location,
            },
        },
    };
}

export function mapDriverTenderFromApi(tender) {
    if (!tender) {
        return null;
    }

    const lead = mapTenderLeadFromApi(tender.lead);
    const bets = Array.isArray(tender.bets)
        ? tender.bets.map(mapTenderBetFromApi)
        : [];

    const ownBet = bets.find((bet) => bet.isOwn && bet.status !== 'closed');

    return {
        id: tender.id,
        status: tender.status || 'new',
        type: tender.type || 'shipper',
        publication_type: tender.publication_type || 'public',

        public_date_time: tender.public_date_time || '',
        end_date_time: tender.end_date_time || '',
        endDateTime: tender.end_date_time || '',

        max_participants: tender.max_participants ?? 0,
        participants_count: tender.participants_count ?? 0,

        lead_id: tender.lead_id || lead?.id || '',
        my_bet: tender.my_bet ?? 0,

        lead,

        from_location: lead?.from_location || '',
        to_location: lead?.to_location || '',
        cargo: lead?.cargo || null,

        transportation_price: lead?.transportation_price ?? null,
        transportation_currency: lead?.transportation_currency || 'KZT',

        bets,
        ownBet,
    };
}

export function mapDriverTendersListFromApi(response) {
    const items = Array.isArray(response?.data) ? response.data : [];

    return {
        tenders: items.map(mapDriverTenderFromApi).filter(Boolean),
        count: response?.total ?? 0,
        page: response?.page ?? 1,
        perPage: response?.limit ?? 10,
    };
}

function mapTenderForwarderFromApi(forwarder) {
    if (!forwarder) {
        return null;
    }

    return {
        name: forwarder.contact_person || forwarder.name || '',
        companyName: forwarder.name || '',
        contactPerson: forwarder.contact_person || '',
        phone: forwarder.tel || forwarder.phone || '',
        bin: forwarder.bin || '',
        iin: forwarder.iin || '',
    };
}
