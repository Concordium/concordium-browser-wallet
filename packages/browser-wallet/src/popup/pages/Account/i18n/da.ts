import en from './en';

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
        earn: 'Optjen CCD',
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
        accountStatement: {
            title: 'Eksportér transaktionslog',
            description:
                'Transaktionslogs for en konto kan genereres og hentes fra CCDScan.io.\n\nCCDScan er en Concordium block explorer, og ved at trykke på knappen nedenfor åbnes et denne side i din browser.',
            link: 'Gå til CCDScan.io',
        },
    },
    confirmTransfer: {
        buttons: {
            back: 'tilbage',
            send: 'Send',
            finish: 'Færdigør',
        },
    },
    sendCcd: {
        labels: {
            ccd: 'Indtast et beløb at overføre',
            recipient: 'Indtast modtager addresse',
        },
        buttons: {
            continue: 'Fortsæt',
        },
        title: 'Send CCD',
        currentBalance: 'Nuværende saldo',
        unableToCoverCost: 'Utilstrækkelig antal CCD til at dække omkostninger',
        unableToSendFailedInvoke: 'Simulering af overførsel fejlede, overførslen er ikke mulig.',
        transferInvokeFailed: 'Simulering af overførsel fejlede: {{ message }}',
        unableToCreatePayload: 'Konstruktion af transaktion fejlede: {{ message}}',
        nonexistingAccount: 'Modtager findes ikke på kæden',
        fee: 'Estimerede transaktionsomkostninger',
    },
    tokens: {
        tabBar: {
            ft: 'Ombyttelige',
            nft: 'Samlerobjekter',
            manage: 'Rediger',
        },
        add: {
            lookupTokens: 'Søg efter tokens',
            indexRequired: 'Kontrakt indeks er påkrævet',
            noContractFound: 'Ingen kontrakt fundet på indeks',
            noTokensError: 'Ingen tokens fundet i kontrakten',
            failedTokensError: 'En fejl skete under tjekket efter tokens',
            contractIndex: 'Kontrakt indeks',
            hexId: 'Ugyldigt token ID (skal være HEX encodet)',
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
        listAddMore: 'Du kan tilføje flere tokens fra Rediger siden.',
        listEmpty: 'Du kan tilføje tokens fra Rediger siden.',
    },
    // TODO translate
    earn: en.earn,
    // TODO translate
    delegate: en.delegate,
    accountPending: 'Denne konto er stadig ved at blive oprettet.',
    accountRejected: 'Denne konto kunne ikke blive oprettet.',
    request: 'Opret konto',
    unknown: 'Ukendt',
};

export default t;
