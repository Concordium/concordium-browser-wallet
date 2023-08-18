import type en from './en';

const t: typeof en = {
    topbar: {
        details: 'Kortdetaljer',
        list: 'Web3 ID Kort',
    },
    menu: {
        revoke: 'Ophæv',
        details: 'Detaljer',
        backup: 'Backup,',
    },
    details: {
        id: 'Legitimationholders ID',
        validFrom: 'Gyldig fra',
        validUntil: 'Gyldig indtil',
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
