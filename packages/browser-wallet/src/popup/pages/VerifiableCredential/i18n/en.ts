const t = {
    topbar: {
        details: 'Credential Details',
        list: 'Web3 ID Credentials',
    },
    menu: {
        revoke: 'Revoke',
        details: 'Details',
        import: 'Open import window',
        export: 'Download export file',
    },
    details: {
        id: 'Credential holder ID',
        validFrom: 'Valid from',
        validUntil: 'Valid until',
        issuer: {
            title: 'Issued by',
            contract: 'contract index, subindex',
            name: 'Name',
            description: 'Description',
            url: 'Website',
        },
    },
    status: {
        Active: 'Active',
        Revoked: 'Revoked',
        Expired: 'Expired',
        NotActivated: 'Not activated',
        Pending: 'Pending',
    },
    errors: {
        badSchema:
            'The credential schema does not match the credential attributes. Please contact the issuer of the Web3 ID credential to report the error.',
        fallbackSchema:
            'There was an issue retrieving the schema for the credential. Using fallback schema to display the credential. Please contact the issuer of the Web3 ID credential to report the error.',
    },
};

export default t;
