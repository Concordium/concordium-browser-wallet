const t = {
    form: {
        password: {
            tooWeak: 'Very weak',
            weak: 'Weak',
            medium: 'Medium',
            strong: 'Strong',
            incorrectPasscode: 'Incorrect passcode',
            currentPasscode: 'Enter current passcode',
            passcodeRequired: 'A passcode must be entered',
        },
        tokenAmount: {
            token: {
                label: 'Token',
                available: '{{balance}} available',
            },
            amount: {
                label: 'Amount',
                fee: 'Estimated transaction fee:',
            },
            address: {
                label: 'Receiver address',
                placeholder: 'Enter receiver address here',
            },
            validation: {
                insufficientCcd: 'Not enough CCD in account to cover transaction fee',
            },
        },
        fileInput: {
            selectButton: 'or Select file to import',
        },
    },
    utils: {
        address: {
            required: 'Please enter an address',
        },
        amount: {
            required: 'Please enter an amount',
            zero: 'Amount may not be zero',
        },
    },
    idCard: {
        name: {
            edit: 'Edit Name',
            save: 'Save',
            abort: 'Cancel',
        },
        verifiedBy: 'Verified by {{idProviderName}}',
        rejectedBy: 'Rejected by {{idProviderName}}',
        pendingBy: 'Pending verification by {{idProviderName}}',
        itentityRejected: 'This identity has been rejected',
    },
    web3IdCard: {
        status: {
            active: 'Active',
            revoked: 'Revoked',
            expired: 'Expired',
            notActivated: 'Not activated',
            pending: 'Pending',
        },
        warning: {
            schemaMismatch: 'Attributes found do not match credential schema',
            fallback: 'Using fallback credential chema',
        },
        details: {
            id: 'Credential holder ID',
            contract: 'Contract address',
            validFrom: 'Valid from',
            validUntil: 'Valid until',
        },
    },
    parameter: {
        parameter: 'Parameter',
    },
    binaryDisplay: {
        description: '{{ dApp }} requests a signature on a message',
        descriptionWithSchema:
            "{{ dApp }} has provided the raw message and a schema to render it. We've rendered the message but you should only sign it if you trust {{ dApp }}.",
        deserializedDisplay: 'Rendered',
        unableToDeserialize: 'Unable to render message',
        rawDisplay: 'Raw',
        sign: 'Sign',
        reject: 'Reject',
        error: 'Error',
    },
    messages: {
        addressCopied: 'Address copied',
        copied: 'Copied',
    },
    passwordSession: {
        unlock: 'Unlock',
        enterPassword: 'Please enter your passcode to enter the wallet.',
    },
};

export default t;
