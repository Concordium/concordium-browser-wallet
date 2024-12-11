const t = {
    title: 'Add Web3 ID request',
    description: '{{ dapp }} requests that you add this Web3 ID credential to the wallet.',
    accept: 'Add credential',
    reject: 'Cancel',
    error: {
        initial:
            'We are unable to add the Web3 ID credential to the wallet due to the following issue, please report this to the issuer:',
        metadata: 'We are unable to load the metadata for the credential.',
        schema: 'We are unable to load the schema specification for the credential.',
        attribute: {
            required: 'The received credential is missing one or more required attributes ({{ attributeKeys }})',
            additional:
                'The attribute with key [{{ credentialAttribute }}] is not available in the list of schema attributes: [{{ schemaAttributes }}]',
        },
        localization: 'Failed to get localization',
        findingNextIndex: 'An error ocurred while attempting to add the credential. Please try again.',
        schemaValidation: 'The credential did not validate according to the schema: [{{ errors }}]',
    },
};

export default t;
