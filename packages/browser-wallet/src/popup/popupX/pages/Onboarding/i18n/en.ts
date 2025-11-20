const t = {
    intro: {
        smartMoney: 'Smart Money Starts Here',
        continue: 'Continue',
        dataRules: 'Your Data. Your Rules.',
        verify: 'Verify your access, without exposing your identity.',
    },
    welcome: {
        smartMoney: 'Smart Money Starts Here',
        speed: 'Speed Matters',
        fastPayments: 'Make payments faster and cheaper using stablecoins.',
        start: 'Get started',
        proceeding: 'By proceeding, you agree with ',
        termsAndConditions: 'Terms & Conditions',
    },
    setupPassword: {
        setPassword: 'Setup Passcode',
        firstStep: 'The first step is to set up a passcode. Please enter one below.',
        enterPasscode: 'Enter Passcode',
        enterPasscodeAgain: 'Repeat Passcode',
        passcodeRequired: 'A passcode must be entered',
        passcodeMismatch: 'Passcode does not match',
        passcodeMinLength: 'Passcode must be at least 6 characters',
        continue: 'Continue',
    },
    createOrRestore: {
        createOrRestore: 'Create or Restore Account',
        optionsInfo:
            'You have the option to create a new wallet or restore an existing one. How do you want to proceed?',
        or: 'or',
        walletAccount: 'Concordium Wallet Account',
        walletAccountDescription: 'Write your seed phrase down in order to keep your wallet account safe',
        restore: 'Restore With a Seed Phrase',
        restoreDescription: 'Use your saved seed phrase to recover your existing accounts',
    },
    selectNetwork: {
        networkSettings: 'Network settings',
    },
    restoreWallet: {
        restoreWallet: 'Restore via seed phrase',
        restoreInfo:
            'Please enter your 24-word seed phrase in the correct order and separated by spaces to restore your identities and accounts.',
        required: 'Please specify a 24-word BIP 39 recovery phrase',
        validate: 'Invalid secret recovery phrase',
        continue: 'Continue',
    },
    generateSeedPhrase: {
        yourRecoveryPhrase: 'Your recovery phrase',
        writeDown: 'Write down your 24 word recovery phrase. Remember that the order is important.',
        continue: 'Continue',
    },
    confirmSeedPhrase: {
        yourRecoveryPhrase: 'Your recovery phrase',
        enterSeed:
            'Please enter your 24-word recovery phrase in the correct order, separated by spaces, to confirm your secret recovery phrase.',
        required: 'Please specify a 24-word BIP 39 recovery phrase',
        validate: 'Invalid secret recovery phrase',
        continue: 'Continue',
    },
    requestIdentity: {
        requestId: 'Request identity',
        request: 'Request Identity',
        identityProvider:
            'An identity provider is a third party that will verify your identity, and return your Concordium identity card.\n\nChoose which identity provider you wish to request an identity with.',
    },
    idSubmitted: {
        yourId: 'Your Concordium identity',
        idSubmitInfo:
            'Your request has been submitted to the identity provider. It may take a little while for them to confirm your identity.\n\nOnce your identity has been verified, you will be able to open an account with it.',
        done: 'Done',
    },
};

export default t;
