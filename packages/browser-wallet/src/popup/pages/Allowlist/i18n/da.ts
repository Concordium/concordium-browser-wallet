import type en from './en';

const t: typeof en = {
    empty: 'Du har på nuværende tidspunkt ikke allowlisted nogen service.',
    entry: {
        header: 'Allowlisting af en service',
        description:
            'At allowliste en service betyder at den kan anmode om identitetsbeviser, og signaturer fra de valgte konti.',
        addDescription: 'Vælg hvilke konti der skal deles med servicen nedenfor.',
        modifyDescription:
            'Du kan ændre i hvilke konti der er tilgængelige for servicen nedenfor. En allowlisted service kan altid anmode om proofs.',
    },
    view: {
        remove: 'Fjern service fra allowlisten',
        update: 'Opdater allowlist',
    },
};

export default t;
