export default {
    title: 'Proof of identity request',
    header: '<1>{{dappName}}</1> requests the following information about you:',
    approve: 'Approve',
    continue: 'Continue',
    back: 'Back',
    reject: 'Reject',
    displayStatement: {
        requirementsMet: 'You meet this requirement',
        requirementsNotMet: "You don't meet this requirement",
        revealDescription:
            'Important: {{dappName}} will be given all the information above. You should only accept if you trust the service, and you are familiar with their privacy policy.',
        revealTooltip: {
            header: 'Information to reveal',
            body: 'When you reveal information for a third party, you effectively hand over the information to them. This means that you should only do this if you have absolute trust in them, and if you are familiar with their data usage and protection procedures.\nYou can read more on developer.concordium.software',
        },
        secretTooltip: {
            header: 'ZK proof',
            body: 'Zero-knowledge proofs are a way of proving something to a service or dApp without revealing the exact personal information. One example can be that you prove that you are over 18 years old without revealing your exact date of birth. Another example could be that you live in one of a range of countries without revealing exactly which country you live in.\nYou can read more on developer.concordium.software',
        },
        headers: {
            reveal: 'Information to reveal',
            secret: 'Zero-knowledge proof',
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
        unableToProve: 'One or more attributes do not meet the requirements from the verifier.',
        noCredentialsForThatIssuer:
            'You do not hold any active credentials from the issuer that the verifier requested.',
    },
};
