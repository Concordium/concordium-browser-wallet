import type en from './en';

const t: typeof en = {
    title: 'Indstillinger',
    continue: 'Fortsæt',
    form: {
        labels: {
            credentials:
                'Private nøgler (brug "{{fieldSeparator}}" for at separere værdier, og "{{lineSeparator}}" for at separere par)',
            url: 'JSON-RPC endpoint',
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
};

export default t;
