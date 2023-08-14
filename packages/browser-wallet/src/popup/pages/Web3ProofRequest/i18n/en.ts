export default {
    header: '{{dappName}} requests the following information about you:',
    accept: 'Accept',
    continue: 'Continue',
    reject: 'Reject',
    displayStatement: {
        requirementsMet: 'You meet this requirement',
        requirementsNotMet: "You don't meet this requirement",
        revealDescription:
            '<1>Important:</1> {{dappName}} will be given all the information above. You should only accept, if you trust the service, and you are familiar with their privacy policy.',
        revealTooltip: {
            header: 'Revealing information <1 />',
            body: 'When you reveal information to a third party, you effectively hand over the information to them. This means you should only do this if you agree to their data usage and protection policies.\n\nYou can read more in\n<1>the developer documentation</1>.',
        },
        secretTooltip: {
            header: 'Zero Knowledge proofs',
            body: 'Zero Knowledge proofs are a way of proving something to a service or dApp without revealing the exact personal information. One example can be that you prove that you are over 18 years old without revealing your exact age. Another example could be proving your residency is within a given set of countries without revealing which of those countries you reside within.\n\nYou can read more in\n<1>the developer documentation</1>.',
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
    failedProof: 'Unable to create proof',
    failedProofReason: 'Unable to create proof due to: {{ reason }}',
};
