const t = {
    welcome: {
        welcomeTo: 'Welcome to Concordium',
        safeSecure: 'Safe and Secure',
        trusted: 'Trusted by thousands, CryptoX is a secure wallet making the Concordium blockchain accessible to all',
        easyManage: 'Easily manage digital assets',
        spendAssets: 'Store, spend and send digital assets like tokens, crypto, unique collectibles',
        unlimited: 'Unlimited possibilities',
        transactionInvest: 'With CryptoX you can make transactions to invest, stake, sell, play games and more!',
        start: 'Get started',
        proceeding: 'By proceeding, you agree with ',
        termsAndConditions: 'Terms & Conditions',
    },
    setupPassword: {
        setPassword: 'Setup Passcode',
        firstStep: 'The first step is to set up a passcode.\nPlease enter one below.',
        enterPasscode: 'Enter Passcode',
        enterPasscodeAgain: 'Enter Passcode Again',
        passcodeRequired: 'A passcode must be entered',
        passcodeMismatch: 'Passcode does not match',
        passcodeMinLength: 'Passcode must be at least 6 characters',
        continue: 'Continue',
    },
    createOrRestore: {
        createOrRestore: 'Create or restore',
        optionsInfo:
            'You have the option to create a new wallet or restore an existing one. How do you want to proceed?',
        create: 'Create',
        restore: 'Restore',
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
    idCardsInfo: {
        ids: 'ConcordiumID',
        idDescription:
            'As the only blockchain, Concordium enables you to verify your real-world identity while remaining private on chain.\n\nEvery user in the Concordium ecosystem has been verified by an identity provider (IDP) - a trusted third-party entity that is responsible for validating the real-world identity of users.\n\nThe IDP does not track your wallet or on-chain activities; they only handle the verification process.\n\nAfter a your identity is verified, the identity provider issues a cryptographic identity object to you that is linked to your account and can be used to prove your identity to others without revealing sensitive personal information.\n\nOnly in the case of a legal requirement, an authorized entity (like a regulator) can request the IDP to disclose a user’s real-world identity.',
        request: 'Request Identity',
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
