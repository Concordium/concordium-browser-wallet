const t = {
    description: '{{ dApp }} requests a signature on a message',
    descriptionWithSchema:
        "{{ dApp }} has provided the raw message and a schema to render it. We've rendered the message but you should only sign it if you trust {{ dApp }}.",
    deserializedDisplay: 'Rendered',
    rawDisplay: 'Raw',
    sign: 'Sign',
    reject: 'Reject',
    error: 'Error',
};

export default t;
