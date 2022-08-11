import type en from './en';

const t: typeof en = {
    title: 'Indstillinger',
    continue: 'Fortsæt',
    form: {
        labels: {
            credentials: 'Nøgle,adresse par',
            url: 'JSON-RPC endpoint',
            seedPhrase: 'Seed Phrase',
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
        seedPhrase: {
            required: 'Indtast et 24 ord BIP 39 seed phrase',
            length: 'Indtast 24 ord',
        },
    },
    themeLabel: 'Udseende:',
    themeLight: 'Lys',
    themeDark: 'Mørk',
};

export default t;
