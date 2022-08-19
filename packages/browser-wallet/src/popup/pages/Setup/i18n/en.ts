const t = {
    intro: {
        welcome: "Welcome to Concordium's official browser extension wallet.",
        description:
            'On the following pages you will be guided through the process of optaining a new account or restoring old ones.',
    },
    setupPasscode: {
        title: 'Setup passcode',
        description: 'The first step is to set up a passcode. Please enter one below.',
        form: {
            enterPasscode: 'Enter passcode',
            enterPasscodeAgain: 'Enter passcode again',
            passcodeRequired: 'A passcode must be entered',
            passcodeMismatch: 'Passcode does not match',
            passcodeMinLength: 'Passcode must be at least 6 characters',
        },
    },
    createRestore: {
        description:
            'You now have the option create a new wallet or restore an existing one. How do you want to proceed?',
        create: 'Create',
        restore: 'Restore',
    },
    recoveryPhrase: {
        description: 'Write down your 24 word recovery phrase. Remember that the order is important.',
    },
    enterRecoveryPhrase: {
        description:
            'Please enter your 24 words in the correct order and separated by spaces, to confirm your secret recovery phrase.',
        form: {
            required: 'A seed phrase must be provided',
            error: 'Incorrect secret recovery phrase',
        },
        seedPhrase: {
            required: 'Please specify a 24 word BIP 39 seed phrase',
            length: 'Please enter 24 words',
        },
    },
    chooseNetwork: {
        descriptionP1: 'Here you can choose whether to connect to the Concordium Mainnet or Testnet.',
        descriptionP2: 'If you are unsure what to choose, choose Concordium Mainnet.',
        descriptionP3: 'You can choose another network via the Settings menu later.',
    },
    continue: 'Continue',
};

export default t;
