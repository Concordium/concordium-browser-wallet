import type en from './en';

const t: typeof en = {
    noAccounts: 'Du har ingen konti i din wallet.',
    removeAccount: 'Fjern konto (kun lokalt)',
    resetConnections: 'Fjern forbindelser',
    accountAddress: 'Konto adresse',
    siteConnected: 'Forbundet',
    siteNotConnected: 'Ikke forbundet',
    accountBalanceError: 'Fejl ved hentning af kontoens balance',
    actions: {
        log: 'Transaktionslog',
        send: 'Send CCD',
        receive: 'Modtag CCD',
        settings: 'Kontoindstillinger',
        tokens: 'Tokens',
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
        exportPrivateKey: {
            title: 'Eksportér privatnøgle',
            description: 'Indtast venligst din adgangskode for at vise din private nøgle.',
            copyDescription: 'Tryk på knappen for at kopiere din private nøgle.',
            show: 'Vis privatnøgle',
            done: 'Færdig',
            export: 'Eksporter',
        },
    },
    sendCcd: {
        labels: {
            ccd: 'Indtast et beløb at overføre',
            recipient: 'Indtast modtager addresse',
        },
        buttons: {
            back: 'tilbage',
            send: 'Send',
            finish: 'Færdigør',
            continue: 'Fortsæt',
        },
        title: 'Send CCD',
        currentBalance: 'Nuværende saldo',
        unableToCoverCost: 'Utilstrækkelig antal CCD til at dække omkostninger',
        transferInvokeFailed: 'Simulering af overførsel fejlede. Det er derfor ikke muligt at estimere omkostninger.',
        fee: 'Estimerede transaktionsomkostninger',
    },
    tokens: {
        tabBar: {
            ft: 'Ombyttelige',
            nft: 'Samlerobjekter',
            manage: 'Rediger',
        },
        add: {
            chooseContract: 'Vælg kontrakt',
            indexRequired: 'Kontrakt indeks er påkrævet',
            noContractFound: 'Ingen kontrakt fundet på indeks',
            cis0Error: 'Kontrakten supporterer ikke CIS-0',
            cis2Error: 'Kontrakten supporterer ikke CIS-2',
            noTokensError: 'Ingen tokens fundet i kontrakten',
            contractIndex: 'Kontrakt indeks',
            hexId: 'Id skal være HEX encodet',
            updateTokens: 'Opdater tokens',
            chooseContractHeader: 'Indtast et kontraktindeks til at vælge tokens fra.',
            ItemBalancePre: 'Din saldo: ',
            searchLabel: 'Søg efter token ID i {{ contractName }}',
            noValidTokenError: 'Token eksisterer enten ikke eller kan ikke vises i wallet',
            noTokensChange: 'Ingen opdateringer til tokenliste.',
            tokensChanged: 'Tokenliste opdateret.',
            missingMetadata: 'Tokens kunne ikke vises på grund af manglende metadata.',
            emptyList: 'Ingen tokens fundet.',
        },
        unownedUnique: 'Ikke ejet',
    },
    accountPending: 'Denne konto er stadig ved at blive oprettet.',
    request: 'Opret konto',
    unknown: 'Ukendt',
};

export default t;
