const t = {
    reject: 'Reject',
    sign: 'Sign & Submit',
    signTransaction: '<1>{{dApp}}</1> suggests a transaction',
    signRequest: 'Signature request',
    errors: {
        missingAccount: 'Missing account address',
        missingKey: 'Missing key for the chosen address',
        insufficientFunds: 'Account has insufficient funds for the transaction',
        missingNonce: 'No nonce was found for the chosen account',
    },
    payload: {
        amount: 'Amount',
        receiver: 'Receiver',
        contractIndex: 'Contract index (subindex)',
        receiveName: 'Contract and function name',
        maxEnergy: 'Max energy allowed',
        nrg: 'NRG',
        noParameter: 'No parameters',
        sender: 'Sender account',
        cost: 'Estimated transaction fee',
        unknown: 'Unknown',
        moduleReference: 'Module reference',
        contractName: 'Contract name',
        data: 'Data',
        rawData: ': (Unable to be decoded)',
        version: 'Version',
        tokenId: 'Token Id',
        operations: 'Operations',
    },
};

export default t;
