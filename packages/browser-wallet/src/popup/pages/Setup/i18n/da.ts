import type en from './en';

const t: typeof en = {
    intro: {
        welcome: "Velkommen til Concordium's officielle browser extension wallet",
        description:
            'På de følgende sider vil du blive guidet igennem at oprette en ny konto, eller at genskabe allerede eksisterende konti.',
    },
    setupPasscode: {
        title: 'Vælg kodeord',
        description: 'Det første skridt er at vælge et kordeord. Vælg venligst ét kordeord nedenfor.',
        form: {
            enterPasscode: 'Indtast kodeord',
            enterPasscodeAgain: 'Indtast kodeord igen',
            passcodeRequired: 'Der skal vælges et kodeord',
            passcodeMismatch: 'Kodeordene er ikke ens',
            passcodeMinLength: 'Kodeordet skal bestå af mindst 6 tegn',
        },
    },
    createRestore: {
        description:
            'Du har nu muligheden for enten at oprette en ny wallet, eller at genskabe en eksisterende. Hvordan vil du fortsætte?',
        create: 'Opret',
        restore: 'Genskab',
    },
    recoveryPhrase: {
        title: 'Dit recovery phrase',
        description: 'Skriv de 24 ord fra din recovery phrase ned. Husk at rækkefølgen er ordene er vigtig.',
    },
    performRecovery: {
        title: 'Genskaber din wallet',
        description: {
            during: 'Vent venligt mens der søges efter dine identiteter og konti.',
            after: 'Følgende identiteter og konti blev fundet.',
        },
    },
    confirmRecoveryPhrase: {
        description:
            'Venligst skriv dine 24 ord i den korrekte rækkefølge, adskilt med et mellemrum, for at bekræfte din hemmelige recovery phrase.',
    },
    enterRecoveryPhrase: {
        form: {
            required: 'En seed phrase skal indtastes',
            error: 'Der er en fejl i den valgte recovery phrase',
        },
        seedPhrase: {
            required: 'Indtast et 24 ord BIP 39 seed phrase',
            length: 'Indtast 24 ord',
        },
    },
    chooseNetwork: {
        descriptionP1: 'Her kan du vælge om du vil forbinde til Concordium Mainnet eller Testnet',
        descriptionP2: 'Hvis du er usikker på hvad du skal vælge, så vælg Concordium Mainnet.',
        descriptionP3: 'Du kan vælge et andet netværk via Indstillinger på et senere tidspunkt.',
    },
    continue: 'Fortsæt',
};

export default t;
