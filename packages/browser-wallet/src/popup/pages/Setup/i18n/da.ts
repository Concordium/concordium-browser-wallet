import type en from './en';

const t: typeof en = {
    intro: {
        welcome: "Velkommen til Concordium's officielle browser extension wallet",
        description:
            'På de følgende sider vil du blive guidet igennem at oprette en ny konto, eller at genskabe allerede eksisterende konti.',
    },
    title: 'Indstillinger',
    continue: 'Fortsæt',
    form: {
        labels: {
            passcodeDescription: 'Det første skridt er at vælge et kordeord. Vælg venligst ét kordeord nedenfor.',
            enterPasscode: 'Indtast kodeord',
            enterPasscodeAgain: 'Indtast kodeord igen',
            passcodeRequired: 'Der skal vælges et kodeord',
            passcodeMismatch: 'Kodeordene er ikke ens',
            passcodeMinLength: 'Kodeordet skal bestå af mindst 6 tegn',
            credentials: 'Key, address pairs',
            url: 'JSON-RPC endpoint',
        },
        notes: {
            credentials:
                'Brug "{{fieldSeparator}}" for at separere værdier, og "{{lineSeparator}}" for at separere par',
        },
    },
    validation: {
        credentials: {
            required: 'Indtast mindst 1 nøgle',
            format: 'Kan ikke parse CSV par. Indtast venligst "nøgle{{fieldSeparator}}adresse", med "{{lineSeparator}}" til at separere par',
        },
        url: {
            required: 'Indtast JSON-RPC endpoint for node',
        },
    },
    themeLabel: 'Udseende:',
    themeLight: 'Lys',
    themeDark: 'Mørk',
};

export default t;
