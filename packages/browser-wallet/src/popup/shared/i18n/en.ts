import { attributeNamesMap } from 'wallet-common-helpers';

const t = {
    form: {
        password: {
            tooWeak: 'Very weak',
            weak: 'Weak',
            medium: 'Medium',
            strong: 'Strong',
        },
    },
    id: {
        header: 'Concordium identity',
        pending: 'Pending verification with',
        confirmed: 'Verified by',
        rejected: 'Rejected by',
    },
    idAttributes: {
        countryOfResidence: 'Country of residence',
        firstName: 'First name',
        idDocExpiresAt: 'ID valid until',
        idDocIssuedAt: 'ID valid from',
        idDocIssuer: 'Identity document issuer',
        idDocType: 'Identity document type',
        idDocNo: 'Identity document number',
        lastName: 'Last name',
        taxIdNo: 'Tax ID number',
        nationalIdNo: 'National ID number',
        nationality: 'Country of nationality',
        sex: 'Sex',
        dob: 'Date of birth',
    } as typeof attributeNamesMap,
    idAttributeValues: {
        sex: {
            NotKnown: 'Not known',
            Male: 'Male',
            Female: 'Female',
            NA: 'N/A',
            Unavailable: 'Unavailable',
        },
        documentType: {
            NA: 'N/A',
            NationalIdCard: 'National ID card',
            Passport: 'Passport',
            DriversLicense: 'Drivers license',
            ImmigrationCard: 'Immigration card',
            Unavailable: 'Unavailable',
        },
    },
    account: {
        error: 'Unable to retrieve account balance',
    },
    utils: {
        address: {
            required: 'Please enter an address',
            invalid: 'Invalid address',
        },
        ccdAmount: {
            required: 'Please enter an amount',
            invalid: 'Invalid amount',
            insufficient: 'Insufficient funds',
            zero: 'Amount may not be zero',
            belowBakerThreshold: 'Minimum stake: {{ threshold }}',
            exceedingDelegationCap: "Amount may not exceed the target pool's cap of {{ max }}.",
            insufficientFundsAtDisposal: 'Insufficient funds at disposal',
        },
        transaction: {
            type: {
                simple: 'Send CCD',
                init: 'Initialize Smart Contract Instance',
                update: 'Update Smart Contract Instance',
                registerData: 'Register data',
                configureDelegation: 'Configure delegation',
                configureBaker: 'Configure baker',
            },
        },
    },
    delegation: {
        amount: 'Delegation amount',
        target: 'Target',
        targetPassive: 'Passive delegation',
        targetBaker: 'Baker {{bakerId}}',
        redelegate: 'Rewards will be',
        redelegateOption: 'Added to delegation amount',
        noRedelegateOption: 'Added to public balance',
        changesTakesEffectOn: 'The following changes will take effect on\n{{ effectiveTime }}',
        pendingRemove:
            'The delegation will be stopped, and the delegation amount will be unlocked on the public balance of the account.',
        pendingChange: 'New delegation amount',
    },
    baking: {
        amount: 'Baker stake',
        restake: 'Rewards will be',
        restakeOption: 'Added to baker stake',
        noRestakeOption: 'Added to public balance',
        openForDelegation: 'Delegation pool status',
        openForAll: 'Open for delegation',
        closedForNew: 'Closed for new delegators',
        closedForAll: 'Closed for delegation',
        electionKey: 'Election verify key',
        signatureKey: 'Signature verify key',
        aggregationKey: 'Aggregation verify key',
        metadataUrl: 'Metadata URL',
        noUrl: 'Empty',
        transactionCommission: 'Transaction fee commission',
        bakingCommission: 'Baking reward commission',
        finalizationCommission: 'Finalization reward commission',
        bakerId: 'Baker ID',
        changesTakesEffectOn: 'The following changes will take effect on\n{{ effectiveTime }}',
        pendingRemove:
            'The baker will be deregistered, and the stake will be unlocked on the public balance of the account.',
        pendingChange: 'Baker stake will be lowered to',
        showKeys: 'Show keys',
    },
    transactionReceipt: {
        sender: 'Sender account',
        cost: 'Estimated transaction fee',
        unknown: 'Unknown',
        tokenTransfer: {
            title: 'Send {{ tokenName }}',
            amount: 'Token amount',
            receiver: 'Receiver',
            showTransfer: 'Show simple details',
            showContract: 'Show full details',
        },
        amount: 'Amount',
        parameter: 'Parameter',
        noParameter: 'No parameters',
    },
    tokenDetails: {
        balance: 'Balance',
        description: 'Description',
        ownership: 'Ownership',
        ticker: 'Ticker',
        decimals: 'Decimals',
        contractIndex: 'Contract index, subindex',
        removeToken: "Don't show token in wallet",
        showRawMetadata: 'Show raw metadata',
        unownedUnique: 'Not owned',
        ownedUnique: 'Owned',
        tokenId: 'Token ID',
        tokenRemoved: 'Token removed from wallet',
        removePrompt: {
            header: 'Hide {{ name }} in your wallet',
            text: 'Are you sure you want hide this token in your wallet? You can always add it again from the tokens list.',
            cancel: 'Keep token',
            remove: 'Remove token',
        },
    },
    tokenBalance: {
        noBalance: 'Missing balance',
    },
    addTokens: {
        cis0Error: 'Contract does not support CIS-0',
        cis2Error: 'Contract does not support CIS-2',
        metadata: {
            fetchError: 'Something went wrong, status: {{ status }}',
            incorrectChecksum: 'Metadata does not match checksum provided with url',
            invalidJSON: 'Metadata url did not return valid JSON',
            incorrectDecimalFormat: 'Metadata contains incorrect decimals format',
            incorrectStringField: 'string field was present but did not contain a string',
            incorrectUrlField: 'Url field was present but did not contain an url',
        },
    },
    cancel: 'Cancel',
    continue: 'Continue',
    okay: 'Okay',
    notice: 'Notice',
    estimatedTransactionFee: 'Estimated transaction fee',
};

export default t;
