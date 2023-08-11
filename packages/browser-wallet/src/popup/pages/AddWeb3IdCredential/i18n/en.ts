const t = {
    description: '{{ dapp }} requests that you add this web3Id Credential to the wallet.',
    accept: 'Add credential',
    reject: 'Cancel',
    error: {
        initial:
            'We are unable to add the web3Id credential to the wallet due to the following issue, please report this to the issuer:',
        metadata: 'We are unable to load the metadata for the credential.',
        schema: 'We are unable to load the schema specification for the credential.',
    },
};

export default t;
