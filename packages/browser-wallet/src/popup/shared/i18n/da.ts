import type en from './en';

const t: typeof en = {
    form: {
        password: {
            tooWeak: 'Meget svagt',
            weak: 'Svagt',
            medium: 'Medium',
            strong: 'Stærkt',
        },
    },
    id: {
        header: 'Concordium identitet',
        pending: 'Afventer godkendelse fra',
        confirmed: 'Godkendt af',
        rejected: 'Afvist af',
    },
    idAttributes: {
        countryOfResidence: 'Bopælsland',
        firstName: 'Fornavn',
        idDocExpiresAt: 'ID gyldigt indtil',
        idDocIssuedAt: 'ID gyldigt fra',
        idDocIssuer: 'Identitetsdokumentudsteder',
        idDocType: 'Identitetsdokumenttype',
        idDocNo: ' Identitetsdokumentnummer',
        lastName: 'Efternavn',
        taxIdNo: 'Skatte-ID-nummer',
        nationalIdNo: 'Personnummer',
        nationality: 'Nationalitet',
        sex: 'Køn',
        dob: 'Fødselsdato',
    },

    account: {
        error: 'Fejl ved hentning af kontoens balance',
    },
    utils: {
        address: {
            required: 'Indtast en addresse',
            invalid: 'Ugyldig addresse',
        },
        ccdAmount: {
            required: 'Indtast et beløb',
            invalid: 'Ugyldigt beløb',
            insufficient: 'Ikke nok penge',
            zero: 'Beløbet må ikke være nul',
            exceedingDelegationCap: "delegeret mængde må ikke gå over valgt bager gruppe's loft på {{ max }}.",
        },
        transaction: {
            type: {
                simple: 'Send CCD',
                init: 'Opret Smart Contract Instans',
                update: 'Opdater Smart Contract Instans',
                registerData: 'Registrer data',
                configureDelegation: 'Konfigurer delegering',
            },
        },
    },
    transactionReceipt: {
        sender: 'Afsender',
        cost: 'Estimerede transaktionsomkostninger',
        unknown: 'Ukendt',
        tokenTransfer: {
            title: 'Send {{ tokenName }}',
            amount: 'Token mængde',
            receiver: 'Modtager',
            showTransfer: 'Vis overførslesdetaljer',
            showContract: 'Vis kontraktdetaljer',
        },
        amount: 'Beløb',
        parameter: 'Parameter',
        noParameter: 'Ingen parametre',
    },
    delegation: {
        amount: 'Delegeret mængde',
        target: 'Mål',
        targetPassive: 'Passiv delegering',
        targetBaker: 'Bager {{bakerId}}',
        redelegate: 'Afkast vil blive',
        redelegateOption: 'tilføjet til delegeret mængde',
        noRedelegateOption: 'tilføjet til offentligt balance',
        changesTakesEffectOn: 'De følgende ændringer tager effekt d.\n{{ effectiveTime }}',
        pendingRemove: 'Delegeringen vil stoppe og den delegeret mængde vil blive frigjort til den offentlige balance.',
        pendingChange: 'Ny delegeret mængde',
    },
    tokenDetails: {
        balance: 'Saldo',
        description: 'Beskrivelse',
        ownership: 'Ejerskab',
        ticker: 'Ticker',
        decimals: 'Decimaler',
        contractIndex: 'Kontraktindeks, subindeks',
        removeToken: 'Vis ikke token i wallet',
        showRawMetadata: 'Vis rå metadata',
        unownedUnique: 'Ejer ikke',
        ownedUnique: 'Ejer',
        tokenId: 'Token ID',
        tokenRemoved: 'Token fjernet fra wallet',
        removePrompt: {
            header: 'Skjul {{ name }} i din wallet',
            text: 'Er du sikker på at du vil skjule dette token i din wallet? Du kan til enhver tid tilføje det igen fra token listen.',
            cancel: 'Behold token',
            remove: 'Fjern token',
        },
    },
    tokenBalance: {
        noBalance: 'Ingen saldo hentet',
    },
    addTokens: {
        cis0Error: 'Kontrakten supporterer ikke CIS-0',
        cis2Error: 'Kontrakten supporterer ikke CIS-2',
    },
};

export default t;
