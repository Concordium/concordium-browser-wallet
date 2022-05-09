const t = {
    title: 'Settings',
    continue: 'Continue',
    form: {
        labels: {
            credentials: 'Key, address pairs',
            url: 'JSON-RPC endpoint',
        },
        notes: {
            credentials: 'Use "{{fieldSeparator}}" to separate values, and "{{lineSeparator}}" to separate pairs',
        },
    },
    validation: {
        credentials: {
            required: 'Please specify at least one key',
            format: 'Cannot parse CSV pairs. Please enter "key{{fieldSeparator}}address", with "{{lineSeparator}}" separating pairs',
        },
        url: {
            required: 'Please specify JSON-RPC endpoint for node',
        },
    },
};

export default t;
