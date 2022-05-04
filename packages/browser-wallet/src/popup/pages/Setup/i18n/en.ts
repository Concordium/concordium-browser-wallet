const t = {
    title: 'Settings',
    continue: 'Continue',
    form: {
        labels: {
            credentials:
                'Private keys (use "{{fieldSeparator}}" to separate values, and "{{lineSeparator}}" to separate pairs)',
            url: 'JSON-RPC endpoint',
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
