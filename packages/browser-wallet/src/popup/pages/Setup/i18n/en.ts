const t = {
    intro: {
        welcome: "Welcome to Concordium's official browser extension wallet.",
        description:
            'On the following pages you will be guided through the process of optaining a new account or restoring old ones.',
    },
    title: 'Setup',
    continue: 'Continue',
    form: {
        labels: {
            passcodeDescription: 'The first step is to set up a passcode. Please enter one below.',
            enterPasscode: 'Enter passcode',
            enterPasscodeAgain: 'Enter passcode again',
            passcodeRequired: 'A passcode must be entered',
            passcodeMismatch: 'Passcode does not match',
            passcodeMinLength: 'Passcode must be at least 6 characters',
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
    themeLabel: 'Theme:',
    themeLight: 'Light',
    themeDark: 'Dark',
};

export default t;
