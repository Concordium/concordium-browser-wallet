const t = {
    intro: {
        welcome: 'Welcome to the Concordium Wallet for web.',
        description:
            'On the following pages, you will be guided through the process of setting up a new wallet or restoring an existing one.',
    },
    setupPasscode: {
        title: 'Setup passcode',
        description:
            'The first step is to set up a passcode. Enter a passcode below. It must contain at least 6 characters.',
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
            'You now have the option to create a new wallet or restore an existing one. How do you want to proceed?',
        create: 'Create',
        createFromExisting: 'Create from existing',
        restore: 'Restore',
    },
    recoveryPhrase: {
        title: 'Your recovery phrase',
        description: 'Write down your 24 word recovery phrase. Remember that the order is important.',
    },
    recoverSeedPhrase: {
        title: 'Restore your wallet',
    },
    confirmRecoveryPhrase: {
        newPhrase:
            'Please enter your 24-word recovery phrase in the correct order, separated by spaces, to confirm your secret recovery phrase.',
        existingPhrase:
            'Please enter your 24-word secret recovery phrase in the correct order and separated by spaces to restore your identities and accounts.',
    },
    enterRecoveryPhrase: {
        form: {
            required: 'A secret recovery phrase must be provided',
            error: 'Incorrect secret recovery phrase',
        },
        seedPhrase: {
            required: 'Please specify a 24-word BIP 39 recovery phrase',
            validate: 'Invalid secret recovery phrase',
        },
    },
    chooseNetwork: {
        create: {
            descriptionP1: 'Choose whether to connect to the Concordium Mainnet or Testnet.',
            descriptionP2: 'If you are unsure what to choose, select Concordium Mainnet.',
            descriptionP3: 'You can choose another network later in the Settings menu.',
        },
        restore: {
            descriptionP1:
                'Choose whether to recover your identities and accounts on the Concordium Mainnet or Testnet.',
            descriptionP2: 'If you are unsure what to choose, select Concordium Mainnet.',
            descriptionP3: 'You can choose another network later in the Settings menu.',
        },
    },
    continue: 'Continue',
};

export default t;
