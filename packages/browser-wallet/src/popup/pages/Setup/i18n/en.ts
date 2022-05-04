const t = {
    title: 'Settings',
    continue: 'Continue',
    form: {
        labels: {
            keys: 'Private keys (use "{{separator}}" to separate keys)',
            url: 'JSON-RPC endpoint',
        },
    },
    validation: {
        keys: {
            required: 'Please specify at least one key',
        },
        url: {
            required: 'Please specify JSON-RPC endpoint for node',
        },
    },
};

export default t;
