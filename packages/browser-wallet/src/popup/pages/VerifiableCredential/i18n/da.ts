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
};

export default t;
