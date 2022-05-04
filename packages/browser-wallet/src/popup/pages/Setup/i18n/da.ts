import type en from './en';

const t: typeof en = {
    title: 'Indstillinger',
    continue: 'Fortsæt',
    form: {
        labels: {
            keys: 'Private nøgler (brug "{{separator}}" til separere nøgler)',
            url: 'JSON-RPC endpoint',
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
