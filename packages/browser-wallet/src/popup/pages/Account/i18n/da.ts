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
    // TODO translate
    earn: {
        title: 'Earning rewards',
        description: 'There are two options for earning rewards on Concordium: Baking and delegation.',
        bakingHeader: 'Baking (coming soon)',
        bakingDescription:
            'As a baker you participate in the network by baking blocks on the Concordium network. This requires a minimum of {{ minAmount }} CCD and access to a dedicated node.',
        delegateHeader: 'Delegation',
        delegateDescription:
            "If you don't have access to your own node you may delegate your stake to one of the other bakers. There is no minimum amount of CCD required when delegating\n\nChoose the option that suits you below to learn more.\n\nNOTE: A single account cannot both be a baker and delegator, but it is possible to stop one and change to the other.",
        delegateCta: 'Opsæt delegering',
    },
    // TODO translate
    delegate: {
        registerIntro: {
            '1': {
                title: 'Delegation',
                body: 'Delegation allows users on the Concordium blockchain to earn rewards without the need to become a baker or run a node.\n\nBy delegating some of your funds to a pool, your can earn rewards.\n\nOn the next few pages, we will go through the basics of delegation. If you want to learn more, you can visit our <1>documentation website</1>.',
            },
            '2': {
                title: 'Delegation models',
                body: "There are two staking models that a delegator can choose:<2><3>Delegating to a specific pool</3><3>Passive delegation</3></2>A baker pool is managed by an individual baker running a node, so the rewards depend on that baker's performance.\n\nSince passive delegation doesn't go to a specific pool, it mitigates the risk of a single baker performing badly, however, rewards are lower.\n\nFor more info, visit our <1>documentation website</1>.",
            },
            '3': {
                title: 'Baker pools',
                body: "A baker pool is managed by an individual baker.\n\nRunning a pool allows a baker to attract more stake and thus increate chances of being selectd to bake a block.\n\nBakers earn a commision from the delegators upon baking a block.\n\nDelegating to a baker pool is usually more profitable that passive delegation, but there is also a risk of losingout on rewards if the baker is not running properly. It is therefore a good idea to keep an eye on the baker's performance.\n\nYou can read morea bout how to investigate a baker's performance on our <1>documentation website</1>.",
            },
            '4': {
                title: 'Passive delegation',
                body: 'For CCD holders who do not want to regularly check the performance of a chosen pool, but just want a stable way of earning rewards, passive delegation offers a low-risk, low-reward alternative.\n\nThis staking strategy is not associated with a specific baker, so there is no risk of poor baker health.\n\nThe trade off when choosing passive delegation is that the return on your stake will be less than what you may receive, when delegatin gto a specific baker pool.',
            },
            '5': {
                title: 'Pay days',
                body: 'Whether you choose an individual baking pool or passive delegation, rewards are paid out at what is called the pay day. Rewards are distribured to everyone in the pool proportioned to their stake, and a commission is paid to the baker by all delegators.\n\nIf you make updates to your ddelegation at a later point, most o fthese will also take effect from the next pay day.\n\nTo read more about the pay day, you can visit our <1>documentation website</1>.',
            },
            '6': {
                title: 'Lock-in and cool-downs',
                body: 'When you make a delegation to either type of pool, your delegation amount will be locked on your account.\n\nThis means that you cannot use the amount for anything while it is still locked in for delegation.\n\nIf you decrease your delegation amount or stop the delegation altogether, the amount will still be locked for a cool-down period. While in the cool-down period, that full delegation amount will keep earning rewards.\n\nAs transactions cost a fee, it is important to take into consideration, that you will need some unlocked funds on your public balance to pay the fee for unlocking your delegation amount again.',
            },
            '7': {
                title: 'The status page',
                body: 'After starting a delegatoin, you will be able to see its current status on the status screen.\n\nFrom there, you can also make updates to your delegation, or stop it again.',
            },
        },
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
    accountPending: 'Denne konto er stadig ved at blive oprettet.',
    accountRejected: 'Denne konto kunne ikke blive oprettet.',
    request: 'Opret konto',
    unknown: 'Ukendt',
};

export default t;
