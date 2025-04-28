import en from './en';

const t: typeof en = {
    description: '{{ dapp }} anmoder at du tilføjer denne Web3 ID credential til din wallet.',
    accept: 'Tilføj credential',
    reject: 'Annuller',
    error: {
        initial:
            'Vi kan ikke tilføje denne web3Id credential til din wallet, på grund af det følgende problem, venligst rapporter dette til den relevante issuer:',
        // We don't translate these because they are mainly for bug reporting.
        metadata: en.error.metadata,
        schema: en.error.schema,
        attribute: en.error.attribute,
        localization: en.error.localization,
        findingNextIndex: en.error.findingNextIndex,
        schemaValidation: en.error.schemaValidation,
    },
};

export default t;
