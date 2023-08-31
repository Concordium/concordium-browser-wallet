export default {
    header: '{{dappName}} requests the following information about you:',
    accept: 'Accept',
    continue: 'Continue',
    back: 'Back',
    reject: 'Reject',
    displayStatement: {
        requirementsMet: 'You meet this requirement',
        requirementsNotMet: "You don't meet this requirement",
        revealDescription:
            '<1>Important:</1> {{dappName}} will be given all the information above. You should only accept, if you trust the service, and you are familiar with their privacy policy.',
        revealTooltip: {
            header: 'Information to reveal',
            body: 'When you reveal information for a third party, you effectively hand over the information to them. This means that you should only do this if you have absolute trust in them, and if you are familiar with their data usage and protection procedures.\n\nYou can read more on\ndeveloper.concordium.software',
        },
        secretTooltip: {
            header: 'Zero Knowledge proof',
            body: 'Zero-knowledge proofs are a way of proving something to a service or dApp without revealing the exact personal information. One example can be that you prove that you are over 18 years old without revealing your exact date of birth. Another example could be that you live in one of a range of countries without revealing exactly which country you live in.\n\nYou can read more on\ndeveloper.concordium.software',
        },
        headers: {
            reveal: 'Information to reveal',
            secret: 'Zero Knowledge proof',
        },
        proofs: {
            range: 'Between {{ lower }} and {{ upper }}',
            membership: '1 of the following',
            nonMembership: 'None of the following',
        },
        descriptions: {
            range: 'This will prove that your {{ name }} is between {{ lower }} and {{ upper }}',
            membership: 'This will prove that your {{ name }} is 1 of the following:\n{{ setNames }}',
            nonMembership: 'This will prove that your {{ name }} is none of the following:\n{{ setNames }}',
            missingAttribute: 'The attribute cannot be found on the identity "{{identityName}}"',
        },
    },
    select: {
        verifiableCredential: 'Select verifiable credential',
        accountCredential: 'Select Account',
    },
    descriptions: {
        verifiableCredential: 'Select a verifiable credential to reveal/prove the requested information.',
        accountCredential:
            'Select an account associated with the identity whose credentials will be used to reveal/prove the requested information.',
    },
    failedProof: 'Unable to create proof',
    failedProofReason: 'Unable to create proof due to: {{ reason }}',
    unableToProve:
        ' {{ dappName }} has requested a proof of identity from you, however you are unable to fulfill the request',
};
