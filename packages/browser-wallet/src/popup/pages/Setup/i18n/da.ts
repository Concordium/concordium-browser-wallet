import type en from './en';

const t: typeof en = {
    intro: {
        welcome: 'Velkommen til Concordium Wallet for web.',
        description:
            'På de følgende sider vil du blive guidet igennem at oprette en ny wallet, eller at genskabe en allerede eksisterende wallet.',
        form: {
            termsAndConditionsRequired: 'Det er påkrævet at læse og at acceptere vilkår og betingelser',
            termsAndConditionsDescription: 'Jeg har læst og accepteret Vilkår og Betingelser',
            termsAndConditionsLinkDescription: 'Vilkår og Betingelser',
        },
    },
    setupPasscode: {
        title: 'Vælg kodeord',
        description:
            'Det første skridt er at vælge et kordeord. Indtast venligst ét kordeord nedenfor. Kodeordet skal minimum indhold 6 tegn.',
        form: {
            enterPasscode: 'Indtast kodeord',
            enterPasscodeAgain: 'Indtast kodeord igen',
            passcodeRequired: 'Der skal indtastes et kodeord',
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
        description: 'Skriv de 24 ord fra din recovery phrase ned. Husk at rækkefølgen af ordene er vigtig.',
    },
    recoverSeedPhrase: {
        title: 'Genskab din wallet',
    },
    confirmRecoveryPhrase: {
        newPhrase:
            'Venligst skriv dine 24 ord i den korrekte rækkefølge, adskilt med et mellemrum, for at bekræfte din hemmelige recovery phrase.',
        existingPhrase:
            'Venligst skriv dine 24 ord i den korrekte rækkefølge, adskilt med et mellemrum, for at genskabe dine identititer og konti.',
    },
    enterRecoveryPhrase: {
        form: {
            required: 'Et recovery phrase skal indtastes',
            error: 'Der er en fejl i den valgte recovery phrase',
        },
        seedPhrase: {
            required: 'Indtast et 24 ord BIP 39 recovery phrase',
            validate: 'Ugyldigt recovery phrase',
        },
    },
    chooseNetwork: {
        create: {
            descriptionP1: 'Her kan du vælge om du vil forbinde til Concordium Mainnet eller Testnet',
            descriptionP2: 'Hvis du er usikker på hvad du skal vælge, så vælg Concordium Mainnet.',
            descriptionP3: 'Du kan vælge et andet netværk i Indstillinger på et senere tidspunkt.',
        },
        restore: {
            descriptionP1:
                'Her kan du vælge om du vil genskabe dine identitier og konti fra Concordium Mainnet eller Testnet',
            descriptionP2: 'Hvis du er usikker på hvad du skal vælge, så vælg Concordium Mainnet.',
            descriptionP3: 'Du kan skifte til et andet netværk via Indstillinger på et senere tidspunkt.',
        },
    },
    continue: 'Fortsæt',
};

export default t;
