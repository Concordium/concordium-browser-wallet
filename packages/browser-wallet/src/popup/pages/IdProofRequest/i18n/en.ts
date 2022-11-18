export default {
    displayStatement: {
        requirementsMet: 'You meet this requirement',
        requirementsNotMet: "You don't meet this requirement",
        revealDescription:
            '<1>Important:</1> {{dappName}} will be given all the information above. You should only accept to do so, if you have absolute trust in the service, and if you are familiar with their privacy policiy.',
        revealTooltip: {
            header: 'Revealing information <1 />',
            body: 'When you reveal information for a third party, you effectlively hand over the information to them. This means that you should only do this if you have absolute trust in them, and if you are familiar with their data usage and protection procedures.\n\nYou can read more in on\n\ndeveleoper.concordium.software',
        },
        secretTooltip: {
            header: 'Secret proofs',
            body: 'Secret proofs are a way of proving something to a service or dApp without revealing the exact personal information. One example can be that you prove that you are over 18 years old without revealing your exact date of birth. Another example could be that you live in one of a range of countries without revealing exactly which country you live in.\n\nYou can read more on\n\n developer.concordium.software',
        },
    },
};
