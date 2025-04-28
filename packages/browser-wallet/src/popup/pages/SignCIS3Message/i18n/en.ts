const t = {
    description: '{{ dApp }} requests a signature on a message',
    descriptionWithSchema:
        "{{ dApp }} has provided the raw message and a schema to render it. We've rendered the message but you should only sign it if you trust {{ dApp }}.",
    unableToDeserialize: 'Unable to render message',
    contractIndex: 'Contract index (subindex)',
    receiveName: 'Contract and function name',
    parameter: 'Parameter',
    nonce: 'Nonce',
    expiry: 'Expiry time',
    sign: 'Sign',
    reject: 'Reject',
};

export default t;
