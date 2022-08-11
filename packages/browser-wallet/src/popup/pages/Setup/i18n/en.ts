const t = {
    title: 'Settings',
    continue: 'Continue',
    form: {
        labels: {
            credentials: 'Key, address pairs',
            url: 'JSON-RPC endpoint',
            seedPhrase: 'Seed Phrase',
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
        seedPhrase: {
            required: 'Please specify a 24 word BIP 39 seed phrase',
            length: 'Please enter 24 words',
        },
    },
    themeLabel: 'Theme:',
    themeLight: 'Light',
    themeDark: 'Dark',
};

export default t;
