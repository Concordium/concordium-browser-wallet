import type en from './en';

const t: typeof en = {
    noAccounts: 'Ingen konti i wallet',
    removeAccount: 'Fjern konto (kun lokalt)',
    resetConnections: 'Fjern forbindelser',
    accountAddress: 'Konto adresse',
    siteConnected: 'Forbundet',
    siteNotConnected: 'Ikke forbundet',
    actions: {
        log: 'transaktionslog',
        send: 'send ccd',
        receive: 'modtag ccd',
        settings: 'kontoindstillinger',
    },
    details: {
        total: 'Offentligt total',
        atDisposal: 'Offentligt til rådighed',
        stakeAmount: 'Stake',
    },
    settings: {
        connectedSites: {
            title: 'Forbundne hjemmesider',
            noConnected: 'Den valgte konto er ikke forbundet til nogen hjemmeside.',
            connect: 'Forbind',
            disconnect: 'Fjern',
        },
        exportPrivateKey: 'Eksportér privat nøgle',
    },
    accountPending: 'Denne konto er stadig ved at blive oprettet.',
};

export default t;
