import type en from './en';

const t: typeof en = {
    topbar: {
        details: 'Kortdetaljer',
        list: 'Web3 ID Kort',
    },
    menu: {
        revoke: 'Ophæv',
        details: 'Detaljer',
        import: 'Åben import vinduet',
        export: 'Download export fil',
    },
    details: {
        id: 'Legitimationholders ID',
        validFrom: 'Gyldig fra',
        validUntil: 'Gyldig indtil',
        issuer: {
            title: 'Udstedt af',
            contract: 'kontraktindeks, subindeks',
            name: 'Navn',
            description: 'Beskrivelse',
            url: 'Hjemmeside',
        },
    },
    status: {
        Active: 'Aktiv',
        Revoked: 'Ophævet',
        Expired: 'Udløbet',
        NotActivated: 'Ikke aktiveret',
        Pending: 'Afventer',
    },
    errors: {
        badSchema:
            'Skemaet stemmer ikke overens med attributterne. Kontakt udstederen af dit Web3 ID kort for at rapportere fejlen.',
        fallbackSchema:
            'Det var ikke muligt at hente skemaet for denne credential. Der benyttes et fallback skema til at vise denne credential. Kontakt udstederen af dit Web3 ID kort for at rapportere fejlen.',
    },
};

export default t;
