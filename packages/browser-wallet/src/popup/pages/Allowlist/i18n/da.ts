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
    editor: {
        removeButton: 'Fjern service fra allowlisten',
        modal: {
            header: 'Fjern service?',
            description:
                'Når du fjerner en service betyder det, at den ikke længere kan anmode om credential proofs, eller anmode dig om at signere transkationer.',
            keep: 'Behold',
            remove: 'Fjern',
        },
    },
};

export default t;
