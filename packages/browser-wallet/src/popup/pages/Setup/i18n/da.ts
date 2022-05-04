import type en from './en';

const t: typeof en = {
    title: 'Opsætning',
    continue: 'Fortsæt',
    form: {
        labels: {
            keys: 'Brug "{{separator}}" til separere nøgler',
        },
    },
    validation: {
        keys: {
            required: 'Indtast mindst 1 nøgle',
        },
        url: {
            required: 'Indtast JSON-RPC endpoint for node',
        },
    },
};

export default t;
