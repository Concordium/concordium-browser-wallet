const t = {
    credentials: {
        title: 'Web3 ID Credentials',
        noCredentials: 'There are no Web3 ID Credentials',
    },
    import: {
        importWeb3Id: 'Import Web3 ID Credentials',
        success: 'Import successful',
        noCreds: 'However, no new credentials were found.',
        buttonDone: 'Done',
        dragAndDropFile: 'Drag and drop\nyour Credentials file here',
        error: 'Unable to import the chosen file. The file must be a backup created with the same seed phrase.',
    },
    details: {
        title: 'Credential details',
        confirmRevoke: {
            title: 'Revoke credential',
            description: "You're about to revoke your Web3 ID. This is an irreversible action.",
            buttonContinue: 'Revoke credential',
            buttonCancel: 'Cancel',
            fee: 'Estimated transaction fee',
            account: 'Selected account',
            error: { insufficientFunds: 'Insufficient funds on selected account to cover transaction fee' },
        },
    },
};

export default t;
