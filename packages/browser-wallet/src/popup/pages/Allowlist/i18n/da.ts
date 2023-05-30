import type en from './en';

const t: typeof en = {
    empty: 'Du har på nuværende tidspunkt ikke allowlisted nogen service.',
    editor: {
        header: 'Allowlisting af en service',
        description:
            'At allowliste en service betyder at den kan anmode om identitetsbeviser, og signaturer fra de valgte konti.',
    },
    view: {
        remove: 'Fjern service fra allowlisten',
        update: 'Opdater allowlist',
    },
};

export default t;
